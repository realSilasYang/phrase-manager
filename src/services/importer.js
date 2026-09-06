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
      if (quoted && row[index + 1] === '"') {
        value += '"'
        index++
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      fields.push(value)
      value = ''
    } else {
      value += character
    }
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
      if (quoted && input[index + 1] === '"') {
        row += input[++index]
      } else {
        quoted = !quoted
      }
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index++
      if (row.trim()) rows.push(parseCsvRow(row))
      row = ''
    } else {
      row += character
    }
  }
  if (quoted) throw serviceError('error.csvUnclosedQuote')
  if (row.trim()) rows.push(parseCsvRow(row))
  return rows
}

function makePhraseTitle(content) {
  return content.length > 10 ? `${content.slice(0, 10)}...` : content
}

function normalize(value) {
  return String(value ?? '').trim()
}

function readAiValue(source, chineseKey) {
  return source?.[chineseKey]
}

function hasOnlyKeys(source, allowedKeys) {
  return Boolean(source && typeof source === 'object' && !Array.isArray(source) &&
    Object.keys(source).every(key => allowedKeys.includes(key)))
}

function duplicateKey(groupName, categoryName, title, content) {
  return [groupName, categoryName, title, content].map(normalize).join('\u0001')
}

function countDuplicates(preview, current) {
  const currentGroups = new Map((current.分组 || []).map(group => [String(group.编号), group]))
  const currentCategories = new Map((current.分类 || []).map(category => [String(category.编号), category]))
  const known = new Set((current.常用语 || []).map(phrase => {
    const category = currentCategories.get(String(phrase.所属分类编号))
    const group = category ? currentGroups.get(String(category.所属分组编号)) : null
    return duplicateKey(group?.名称, category?.名称, phrase.标题, phrase.内容)
  }))
  const groups = new Map(preview.分组.map(group => [String(group.来源编号), group]))
  const categories = new Map(preview.分类.map(category => [String(category.来源编号), category]))
  let duplicates = 0
  preview.常用语.forEach(phrase => {
    const category = categories.get(String(phrase.所属分类来源编号))
    const group = category ? groups.get(String(category.所属分组来源编号)) : null
    const key = duplicateKey(group?.名称, category?.名称, phrase.标题, phrase.内容)
    if (known.has(key)) duplicates++
    known.add(key)
  })
  return duplicates
}

function parseJson(content) {
  let data
  try {
    data = JSON.parse(String(content || '').replace(/^\uFEFF/, ''))
  } catch (error) {
    throw serviceError('error.jsonParseFailed', {}, error)
  }
  if (!hasOnlyKeys(data, ['分组', '分类', '常用语'])) throw serviceError('error.jsonInvalidShape')
  const collections = deserializeCollections(data)
  if (!collections) throw serviceError('error.jsonInvalidShape')

  let invalidRows = 0
  const groupIds = new Set()
  const groups = []
  collections.分组.forEach(group => {
    const sourceId = normalize(group?.编号)
    const name = normalize(group?.名称)
    if (!sourceId || !name || groupIds.has(sourceId)) {
      invalidRows++
      return
    }
    groupIds.add(sourceId)
    groups.push({ 来源编号: sourceId, 名称: name, 创建时间: group.创建时间 })
  })

  const categoryIds = new Set()
  const categories = []
  collections.分类.forEach(category => {
    const sourceId = normalize(category?.编号)
    const name = normalize(category?.名称)
    const groupSourceId = normalize(category?.所属分组编号)
    if (!sourceId || !name || !groupIds.has(groupSourceId) || categoryIds.has(sourceId)) {
      invalidRows++
      return
    }
    categoryIds.add(sourceId)
    categories.push({ 来源编号: sourceId, 名称: name, 所属分组来源编号: groupSourceId, 创建时间: category.创建时间 })
  })

  const phrases = []
  collections.常用语.forEach(phrase => {
    const title = normalize(phrase?.标题)
    const body = normalize(phrase?.内容)
    const categorySourceId = normalize(phrase?.所属分类编号)
    if (!title || !body || !categoryIds.has(categorySourceId)) {
      invalidRows++
      return
    }
    phrases.push({
      来源编号: normalize(phrase?.编号) || `phrase-${phrases.length}`,
      标题: title,
      内容: body,
      所属分类来源编号: categorySourceId,
      创建时间: phrase.创建时间,
      更新时间: phrase.更新时间
    })
  })
  return { 格式: 'json', 分组: groups, 分类: categories, 常用语: phrases, 无效行: invalidRows }
}

function parseIflytekCsv(content, names) {
  const rows = parseCsv(content)
  if (rows.length === 0) throw serviceError('error.csvEmpty')
  const header = rows[0].map(normalize)
  if (header.length !== CSV_HEADER.length || header.some((field, index) => field !== CSV_HEADER[index])) {
    throw serviceError('error.csvInvalidHeader', { expected: CSV_HEADER.join(',') })
  }

  const groupSourceId = 'csv-group'
  const categoryByName = new Map()
  const categories = []
  const phrases = []
  let invalidRows = 0
  rows.slice(1).forEach((row, index) => {
    if (row.length !== 2) {
      invalidRows++
      return
    }
    const categoryName = normalize(row[0]) || names.uncategorized
    const contentValue = normalize(row[1])
    if (!contentValue) {
      invalidRows++
      return
    }
    let category = categoryByName.get(categoryName)
    if (!category) {
      category = { 来源编号: `csv-category-${categories.length}`, 名称: categoryName, 所属分组来源编号: groupSourceId }
      categoryByName.set(categoryName, category)
      categories.push(category)
    }
    phrases.push({
      来源编号: `csv-phrase-${index}`,
      标题: makePhraseTitle(contentValue),
      内容: contentValue,
      所属分类来源编号: category.来源编号
    })
  })
  return {
    格式: 'csv',
    分组: [{ 来源编号: groupSourceId, 名称: names.iflytekGroup }],
    分类: categories,
    常用语: phrases,
    无效行: invalidRows
  }
}

function decodeBuffer(buffer, encoding, fatal = false) {
  return new TextDecoder(encoding, { fatal }).decode(buffer)
}

export function decodeImportSource(file) {
  let content
  try {
    content = decodeBuffer(file.buffer, 'utf-8', true)
  } catch {
    try {
      content = decodeBuffer(file.buffer, 'gbk', true)
    } catch (gbkError) {
      throw serviceError('error.invalidEncoding', {}, gbkError)
    }
  }
  content = String(content || '').replace(/^\uFEFF/, '')
  if (!content.trim()) throw serviceError('error.emptyFile')
  return content
}

function finalizeImportPreview(preview, fileName, current) {
  if (preview.分组.length === 0 && preview.分类.length === 0 && preview.常用语.length === 0) {
    throw serviceError('error.importNoData')
  }
  return {
    ...preview,
    文件名: fileName,
    统计: {
      分组: preview.分组.length,
      分类: preview.分类.length,
      常用语: preview.常用语.length,
      重复项: countDuplicates(preview, current),
      无效行: preview.无效行
    }
  }
}

function parseAiImportJson(content) {
  const source = String(content || '').trim()
  const fenced = source.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1]
  const objectStart = source.indexOf('{')
  const objectEnd = source.lastIndexOf('}')
  const candidates = [source, fenced, objectStart >= 0 && objectEnd > objectStart ? source.slice(objectStart, objectEnd + 1) : '']
    .filter((value, index, values) => value && values.indexOf(value) === index)

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      // 当前候选不符合约束时继续尝试下一个 JSON 候选片段。
    }
  }
  throw serviceError('ai.importInvalidFormat')
}

export function prepareAiImportPreview(content, fileName, current) {
  const data = parseAiImportJson(content)
  if (!hasOnlyKeys(data, ['分组'])) throw serviceError('ai.importInvalidFormat')
  const sourceGroups = readAiValue(data, '分组')
  if (!Array.isArray(sourceGroups)) throw serviceError('ai.importInvalidFormat')

  const groups = []
  const categories = []
  const phrases = []
  let invalidRows = 0

  sourceGroups.forEach((group, groupIndex) => {
    if (!hasOnlyKeys(group, ['名称', '分类'])) throw serviceError('ai.importInvalidFormat')
    const groupName = normalize(readAiValue(group, '名称'))
    const sourceCategories = readAiValue(group, '分类')
    if (!groupName || !Array.isArray(sourceCategories)) {
      invalidRows++
      return
    }
    const groupSourceId = `ai-group-${groupIndex}`
    groups.push({ 来源编号: groupSourceId, 名称: groupName })

    sourceCategories.forEach((category, categoryIndex) => {
      if (!hasOnlyKeys(category, ['名称', '常用语'])) throw serviceError('ai.importInvalidFormat')
      const categoryName = normalize(readAiValue(category, '名称'))
      const sourcePhrases = readAiValue(category, '常用语')
      if (!categoryName || !Array.isArray(sourcePhrases)) {
        invalidRows++
        return
      }
      const categorySourceId = `ai-category-${groupIndex}-${categoryIndex}`
      categories.push({ 来源编号: categorySourceId, 名称: categoryName, 所属分组来源编号: groupSourceId })

      sourcePhrases.forEach((phrase, phraseIndex) => {
        if (!hasOnlyKeys(phrase, ['标题', '内容'])) throw serviceError('ai.importInvalidFormat')
        const phraseContent = normalize(readAiValue(phrase, '内容'))
        const phraseTitle = normalize(readAiValue(phrase, '标题')) || makePhraseTitle(phraseContent)
        if (!phraseContent || !phraseTitle) {
          invalidRows++
          return
        }
        phrases.push({
          来源编号: `ai-phrase-${groupIndex}-${categoryIndex}-${phraseIndex}`,
          标题: phraseTitle,
          内容: phraseContent,
          所属分类来源编号: categorySourceId
        })
      })
    })
  })

  if (phrases.length === 0) throw serviceError('ai.importNoUsableData')
  return finalizeImportPreview({ 格式: 'ai', 分组: groups, 分类: categories, 常用语: phrases, 无效行: invalidRows }, fileName, current)
}

export function prepareImportPreview(file, current, { iflytekGroup, uncategorized }) {
  const isCsv = /\.csv$/i.test(file.name || '')
  const isJson = /\.json$/i.test(file.name || '')
  let preview
  if (isCsv) {
    const content = decodeImportSource(file)
    preview = parseIflytekCsv(content, { iflytekGroup, uncategorized })
  } else if (isJson) {
    const content = decodeImportSource(file)
    preview = parseJson(content)
  } else {
    throw serviceError('error.nonStandardImportFormat')
  }
  return finalizeImportPreview(preview, file.name, current)
}

function uniqueName(base, used) {
  if (!used.has(base)) {
    used.add(base)
    return base
  }
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
  const nextGroups = overwrite ? [] : [...current.分组]
  const nextCategories = overwrite ? [] : [...current.分类]
  const nextPhrases = overwrite ? [] : [...current.常用语]
  const groupMap = new Map()
  const categoryMap = new Map()
  const usedGroupNames = new Set(nextGroups.map(group => normalize(group.名称)))
  const groupByName = new Map()
  nextGroups.forEach(group => {
    const name = normalize(group.名称)
    if (!groupByName.has(name)) groupByName.set(name, group)
  })
  const categoryByParentAndName = new Map()
  const categoryCountByParent = new Map()
  nextCategories.forEach(category => {
    const parentId = category.所属分组编号
    let byName = categoryByParentAndName.get(parentId)
    if (!byName) {
      byName = new Map()
      categoryByParentAndName.set(parentId, byName)
    }
    const name = normalize(category.名称)
    if (!byName.has(name)) byName.set(name, category)
    categoryCountByParent.set(parentId, (categoryCountByParent.get(parentId) || 0) + 1)
  })
  const phraseCountByCategory = new Map()
  nextPhrases.forEach(phrase => {
    const categoryId = phrase.所属分类编号
    phraseCountByCategory.set(categoryId, (phraseCountByCategory.get(categoryId) || 0) + 1)
  })
  let importedGroups = 0
  let importedCategories = 0
  let importedPhrases = 0
  let skippedDuplicates = 0

  preview.分组.forEach(group => {
    const normalizedName = normalize(group.名称)
    const existing = !overwrite && !keepCopies ? groupByName.get(normalizedName) : null
    const id = existing?.编号 || generateId()
    groupMap.set(String(group.来源编号), id)
    if (!existing) {
      const name = keepCopies ? uniqueName(group.名称, usedGroupNames) : group.名称
      usedGroupNames.add(name)
      const nextGroup = { 编号: id, 名称: name, 排序: nextGroups.length, 创建时间: group.创建时间 || now }
      nextGroups.push(nextGroup)
      if (!groupByName.has(normalize(name))) groupByName.set(normalize(name), nextGroup)
      importedGroups++
    }
  })

  preview.分类.forEach(category => {
    const parentCategoryId = groupMap.get(String(category.所属分组来源编号))
    if (!parentCategoryId) return
    let categoriesByName = categoryByParentAndName.get(parentCategoryId)
    if (!categoriesByName) {
      categoriesByName = new Map()
      categoryByParentAndName.set(parentCategoryId, categoriesByName)
    }
    const normalizedName = normalize(category.名称)
    const existing = !overwrite && !keepCopies ? categoriesByName.get(normalizedName) : null
    const id = existing?.编号 || generateId()
    categoryMap.set(String(category.来源编号), id)
    if (!existing) {
      const order = categoryCountByParent.get(parentCategoryId) || 0
      const nextCategory = {
        编号: id,
        名称: category.名称,
        所属分组编号: parentCategoryId,
        排序: order,
        创建时间: category.创建时间 || now
      }
      nextCategories.push(nextCategory)
      categoryCountByParent.set(parentCategoryId, order + 1)
      if (!categoriesByName.has(normalizedName)) categoriesByName.set(normalizedName, nextCategory)
      importedCategories++
    }
  })

  const knownPhrases = new Set(nextPhrases.map(phrase => `${phrase.所属分类编号}\u0001${normalize(phrase.标题)}\u0001${normalize(phrase.内容)}`))
  preview.常用语.forEach(phrase => {
    const categoryId = categoryMap.get(String(phrase.所属分类来源编号))
    if (!categoryId) return
    const key = `${categoryId}\u0001${normalize(phrase.标题)}\u0001${normalize(phrase.内容)}`
    if (!keepCopies && knownPhrases.has(key)) {
      skippedDuplicates++
      return
    }
    knownPhrases.add(key)
    const order = phraseCountByCategory.get(categoryId) || 0
    nextPhrases.push({
      编号: generateId(),
      标题: phrase.标题,
      内容: phrase.内容,
      所属分类编号: categoryId,
      排序: order,
      使用次数: 0,
      创建时间: phrase.创建时间 || now,
      更新时间: phrase.更新时间 || now
    })
    phraseCountByCategory.set(categoryId, order + 1)
    importedPhrases++
  })

  return {
    集合: normalizeCollections({ 分组: nextGroups, 分类: nextCategories, 常用语: nextPhrases }),
    导入结果: { 分组: importedGroups, 分类: importedCategories, 常用语: importedPhrases, 跳过重复项: skippedDuplicates }
  }
}
