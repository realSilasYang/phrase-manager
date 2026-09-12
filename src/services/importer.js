import { serviceError } from './errors'
import { deserializeCollections } from './transferSchema'
import { normalizeCollections } from './domainSchema'

const CSV_HEADER = ['常用语分组', '常用语内容']
export const AI_IMPORT_MAX_CHARS = 60000

function parseCsvRow(row) {
  const fields = []
  let value = ''
  let quoted = false
  for (let index = 0; index < row.length; index++) {
    const character = row[index]
    if (character === '"') {
      if (quoted && row[index + 1] === '"') { value += '"'; index++ } else quoted = !quoted
    } else if (character === ',' && !quoted) { fields.push(value); value = '' } else value += character
  }
  if (quoted) throw serviceError('error.csvUnclosedQuote')
  fields.push(value)
  return fields
}

function parseCsv(content) {
  const rows = []
  let row = ''
  let quoted = false
  const input = String(content || '').replace(/^\uFEFF/, '')
  for (let index = 0; index < input.length; index++) {
    const character = input[index]
    if (character === '"') {
      row += character
      if (quoted && input[index + 1] === '"') row += input[++index]
      else quoted = !quoted
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index++
      if (row.trim()) rows.push(parseCsvRow(row))
      row = ''
    } else row += character
  }
  if (quoted) throw serviceError('error.csvUnclosedQuote')
  if (row.trim()) rows.push(parseCsvRow(row))
  return rows
}

function makePhraseTitle(content) { return content.length > 10 ? `${content.slice(0, 10)}...` : content }
function normalize(value) { return String(value ?? '').trim() }
function readValue(source, key) { return source?.[key] }
function hasOnlyKeys(source, allowedKeys) {
  return Boolean(source && typeof source === 'object' && !Array.isArray(source) && Object.keys(source).every(key => allowedKeys.includes(key)))
}
function duplicateKey(categoryName, groupName, title, content) {
  return [categoryName, groupName, title, content].map(normalize).join('\u0001')
}

function countDuplicates(preview, current) {
  const categories = new Map((current.分类 || []).map(category => [String(category.编号), category]))
  const groups = new Map((current.分组 || []).map(group => [String(group.编号), group]))
  const known = new Set((current.常用语 || []).map(phrase => {
    const group = groups.get(String(phrase.所属分组编号))
    const category = group ? categories.get(String(group.所属分类编号)) : null
    return duplicateKey(category?.名称, group?.名称, phrase.标题, phrase.内容)
  }))
  const previewCategories = new Map(preview.分类.map(category => [String(category.来源编号), category]))
  const previewGroups = new Map(preview.分组.map(group => [String(group.来源编号), group]))
  let duplicates = 0
  preview.常用语.forEach(phrase => {
    const group = previewGroups.get(String(phrase.所属分组来源编号))
    const category = group ? previewCategories.get(String(group.所属分类来源编号)) : null
    const key = duplicateKey(category?.名称, group?.名称, phrase.标题, phrase.内容)
    if (known.has(key)) duplicates++
    known.add(key)
  })
  return duplicates
}

function parseJson(content) {
  let data
  try { data = JSON.parse(String(content || '').replace(/^\uFEFF/, '')) } catch (error) { throw serviceError('error.jsonParseFailed', {}, error) }
  if (!hasOnlyKeys(data, ['分类', '分组', '常用语'])) throw serviceError('error.jsonInvalidShape')
  const collections = deserializeCollections(data)
  if (!collections) throw serviceError('error.jsonInvalidShape')

  let invalidRows = 0
  const categoryIds = new Set()
  const categories = []
  collections.分类.forEach(category => {
    const sourceId = normalize(category?.编号)
    const name = normalize(category?.名称)
    if (!sourceId || !name || categoryIds.has(sourceId)) { invalidRows++; return }
    categoryIds.add(sourceId)
    categories.push({ 来源编号: sourceId, 名称: name, 创建时间: category.创建时间 })
  })

  const groupIds = new Set()
  const groups = []
  collections.分组.forEach(group => {
    const sourceId = normalize(group?.编号)
    const name = normalize(group?.名称)
    const categorySourceId = normalize(group?.所属分类编号)
    if (!sourceId || !name || !categoryIds.has(categorySourceId) || groupIds.has(sourceId)) { invalidRows++; return }
    groupIds.add(sourceId)
    groups.push({ 来源编号: sourceId, 名称: name, 所属分类来源编号: categorySourceId, 创建时间: group.创建时间 })
  })

  const phrases = []
  collections.常用语.forEach(phrase => {
    const title = normalize(phrase?.标题)
    const body = normalize(phrase?.内容)
    const groupSourceId = normalize(phrase?.所属分组编号)
    if (!title || !body || !groupIds.has(groupSourceId)) { invalidRows++; return }
    phrases.push({
      来源编号: normalize(phrase?.编号) || `phrase-${phrases.length}`,
      标题: title, 内容: body, 所属分组来源编号: groupSourceId,
      创建时间: phrase.创建时间, 更新时间: phrase.更新时间
    })
  })
  return { 格式: 'json', 分类: categories, 分组: groups, 常用语: phrases, 无效行: invalidRows }
}

function parseIflytekCsv(content, names) {
  const rows = parseCsv(content)
  if (rows.length === 0) throw serviceError('error.csvEmpty')
  const header = rows[0].map(normalize)
  if (header.length !== CSV_HEADER.length || header.some((field, index) => field !== CSV_HEADER[index])) throw serviceError('error.csvInvalidHeader', { expected: CSV_HEADER.join(',') })

  const categorySourceId = 'csv-category'
  const groupByName = new Map()
  const groups = []
  const phrases = []
  let invalidRows = 0
  rows.slice(1).forEach((row, index) => {
    if (row.length !== 2) { invalidRows++; return }
    const groupName = normalize(row[0]) || names.uncategorized
    const content = normalize(row[1])
    if (!content) { invalidRows++; return }
    let group = groupByName.get(groupName)
    if (!group) {
      group = { 来源编号: `csv-group-${groups.length}`, 名称: groupName, 所属分类来源编号: categorySourceId }
      groupByName.set(groupName, group)
      groups.push(group)
    }
    phrases.push({ 来源编号: `csv-phrase-${index}`, 标题: makePhraseTitle(content), 内容: content, 所属分组来源编号: group.来源编号 })
  })
  return {
    格式: 'csv',
    分类: [{ 来源编号: categorySourceId, 名称: names.iflytekGroup }],
    分组: groups,
    常用语: phrases,
    无效行: invalidRows
  }
}

function decodeBuffer(buffer, encoding, fatal = false) { return new TextDecoder(encoding, { fatal }).decode(buffer) }

export function decodeImportSource(file) {
  let content
  try { content = decodeBuffer(file.buffer, 'utf-8', true) } catch {
    try { content = decodeBuffer(file.buffer, 'gbk', true) } catch (error) { throw serviceError('error.invalidEncoding', {}, error) }
  }
  content = String(content || '').replace(/^\uFEFF/, '')
  if (!content.trim()) throw serviceError('error.emptyFile')
  return content
}

function finalizeImportPreview(preview, fileName, current) {
  if (preview.分类.length === 0 && preview.分组.length === 0 && preview.常用语.length === 0) throw serviceError('error.importNoData')
  return {
    ...preview,
    文件名: fileName,
    统计: {
      分类: preview.分类.length, 分组: preview.分组.length, 常用语: preview.常用语.length,
      重复项: countDuplicates(preview, current), 无效行: preview.无效行
    }
  }
}

function parseAiImportJson(content) {
  const source = String(content || '').trim()
  if (!source) throw serviceError('ai.importInvalidFormat')
  try {
    return JSON.parse(source)
  } catch (error) {
    throw serviceError('ai.importInvalidFormat', {}, error)
  }
}

export function prepareAiImportPreview(content, fileName, current) {
  const data = parseAiImportJson(content)
  if (!hasOnlyKeys(data, ['分类']) || !Array.isArray(readValue(data, '分类'))) throw serviceError('ai.importInvalidFormat')

  const categories = []
  const groups = []
  const phrases = []
  let invalidRows = 0
  readValue(data, '分类').forEach((category, categoryIndex) => {
    if (!hasOnlyKeys(category, ['名称', '分组'])) throw serviceError('ai.importInvalidFormat')
    const categoryName = normalize(readValue(category, '名称'))
    const sourceGroups = readValue(category, '分组')
    if (!categoryName || !Array.isArray(sourceGroups)) { invalidRows++; return }
    const categorySourceId = `ai-category-${categoryIndex}`
    categories.push({ 来源编号: categorySourceId, 名称: categoryName })
    sourceGroups.forEach((group, groupIndex) => {
      if (!hasOnlyKeys(group, ['名称', '常用语'])) throw serviceError('ai.importInvalidFormat')
      const groupName = normalize(readValue(group, '名称'))
      const sourcePhrases = readValue(group, '常用语')
      if (!groupName || !Array.isArray(sourcePhrases)) { invalidRows++; return }
      const groupSourceId = `ai-group-${categoryIndex}-${groupIndex}`
      groups.push({ 来源编号: groupSourceId, 名称: groupName, 所属分类来源编号: categorySourceId })
      sourcePhrases.forEach((phrase, phraseIndex) => {
        if (!hasOnlyKeys(phrase, ['标题', '内容'])) throw serviceError('ai.importInvalidFormat')
        const body = normalize(readValue(phrase, '内容'))
        const title = normalize(readValue(phrase, '标题')) || makePhraseTitle(body)
        if (!body || !title) { invalidRows++; return }
        phrases.push({ 来源编号: `ai-phrase-${categoryIndex}-${groupIndex}-${phraseIndex}`, 标题: title, 内容: body, 所属分组来源编号: groupSourceId })
      })
    })
  })
  if (phrases.length === 0) throw serviceError('ai.importNoUsableData')
  return finalizeImportPreview({ 格式: 'ai', 分类: categories, 分组: groups, 常用语: phrases, 无效行: invalidRows }, fileName, current)
}

export function prepareImportPreview(file, current, { iflytekGroup, uncategorized }) {
  const isCsv = /\.csv$/i.test(file.name || '')
  const isJson = /\.json$/i.test(file.name || '')
  let preview
  if (isCsv) preview = parseIflytekCsv(decodeImportSource(file), { iflytekGroup, uncategorized })
  else if (isJson) preview = parseJson(decodeImportSource(file))
  else throw serviceError('error.nonStandardImportFormat')
  return finalizeImportPreview(preview, file.name, current)
}

function uniqueName(base, used) {
  if (!used.has(base)) { used.add(base); return base }
  let index = 1
  while (used.has(`${base}(${index})`)) index++
  const name = `${base}(${index})`
  used.add(name)
  return name
}

export function applyImportPreview(preview, current, strategy, generateId) {
  const overwrite = strategy === 'overwrite'
  const keepCopies = strategy === 'copies'
  const now = Date.now()
  const nextCategories = overwrite ? [] : [...current.分类]
  const nextGroups = overwrite ? [] : [...current.分组]
  const nextPhrases = overwrite ? [] : [...current.常用语]
  const categoryMap = new Map()
  const groupMap = new Map()
  const usedCategoryNames = new Set(nextCategories.map(category => normalize(category.名称)))
  const categoryByName = new Map()
  nextCategories.forEach(category => {
    const name = normalize(category.名称)
    if (!categoryByName.has(name)) categoryByName.set(name, category)
  })
  const groupByCategoryAndName = new Map()
  const usedGroupNamesByCategory = new Map()
  const groupCountByCategory = new Map()
  nextGroups.forEach(group => {
    const categoryId = group.所属分类编号
    let byName = groupByCategoryAndName.get(categoryId)
    if (!byName) { byName = new Map(); groupByCategoryAndName.set(categoryId, byName) }
    const name = normalize(group.名称)
    if (!byName.has(name)) byName.set(name, group)
    let usedNames = usedGroupNamesByCategory.get(categoryId)
    if (!usedNames) {
      usedNames = new Set()
      usedGroupNamesByCategory.set(categoryId, usedNames)
    }
    usedNames.add(name)
    groupCountByCategory.set(categoryId, (groupCountByCategory.get(categoryId) || 0) + 1)
  })
  const phraseCountByGroup = new Map()
  nextPhrases.forEach(phrase => phraseCountByGroup.set(phrase.所属分组编号, (phraseCountByGroup.get(phrase.所属分组编号) || 0) + 1))
  let importedCategories = 0
  let importedGroups = 0
  let importedPhrases = 0
  let skippedDuplicates = 0

  preview.分类.forEach(category => {
    const normalizedName = normalize(category.名称)
    const existing = !overwrite && !keepCopies ? categoryByName.get(normalizedName) : null
    const id = existing?.编号 || generateId()
    categoryMap.set(String(category.来源编号), id)
    if (!existing) {
      const name = keepCopies ? uniqueName(category.名称, usedCategoryNames) : category.名称
      const nextCategory = { 编号: id, 名称: name, 排序: nextCategories.length, 创建时间: category.创建时间 || now }
      nextCategories.push(nextCategory)
      if (!categoryByName.has(normalize(name))) categoryByName.set(normalize(name), nextCategory)
      importedCategories++
    }
  })

  preview.分组.forEach(group => {
    const categoryId = categoryMap.get(String(group.所属分类来源编号))
    if (!categoryId) return
    let groupsByName = groupByCategoryAndName.get(categoryId)
    if (!groupsByName) { groupsByName = new Map(); groupByCategoryAndName.set(categoryId, groupsByName) }
    const normalizedName = normalize(group.名称)
    const existing = !overwrite && !keepCopies ? groupsByName.get(normalizedName) : null
    const id = existing?.编号 || generateId()
    groupMap.set(String(group.来源编号), id)
    if (!existing) {
      const order = groupCountByCategory.get(categoryId) || 0
      let name = normalize(group.名称)
      if (keepCopies) {
        let usedNames = usedGroupNamesByCategory.get(categoryId)
        if (!usedNames) {
          usedNames = new Set()
          usedGroupNamesByCategory.set(categoryId, usedNames)
        }
        name = uniqueName(name, usedNames)
      }
      const nextGroup = { 编号: id, 名称: name, 所属分类编号: categoryId, 排序: order, 创建时间: group.创建时间 || now }
      nextGroups.push(nextGroup)
      groupCountByCategory.set(categoryId, order + 1)
      if (!groupsByName.has(normalizedName)) groupsByName.set(normalizedName, nextGroup)
      if (keepCopies && !groupsByName.has(name)) groupsByName.set(name, nextGroup)
      importedGroups++
    }
  })

  const knownPhrases = new Set(nextPhrases.map(phrase => `${phrase.所属分组编号}\u0001${normalize(phrase.标题)}\u0001${normalize(phrase.内容)}`))
  preview.常用语.forEach(phrase => {
    const groupId = groupMap.get(String(phrase.所属分组来源编号))
    if (!groupId) return
    const key = `${groupId}\u0001${normalize(phrase.标题)}\u0001${normalize(phrase.内容)}`
    if (!keepCopies && knownPhrases.has(key)) { skippedDuplicates++; return }
    knownPhrases.add(key)
    const order = phraseCountByGroup.get(groupId) || 0
    nextPhrases.push({ 编号: generateId(), 标题: phrase.标题, 内容: phrase.内容, 所属分组编号: groupId, 排序: order, 使用次数: 0, 创建时间: phrase.创建时间 || now, 更新时间: phrase.更新时间 || now })
    phraseCountByGroup.set(groupId, order + 1)
    importedPhrases++
  })

  return {
    集合: normalizeCollections({ 分类: nextCategories, 分组: nextGroups, 常用语: nextPhrases }),
    导入结果: { 分类: importedCategories, 分组: importedGroups, 常用语: importedPhrases, 跳过重复项: skippedDuplicates }
  }
}
