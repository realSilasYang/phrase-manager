const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const babel = require('@babel/core')

const projectRoot = path.resolve(__dirname, '..')
const sourceRoot = path.resolve(projectRoot, 'src')
const previousLoader = Module._extensions['.js']
Module._extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(`${sourceRoot}${path.sep}`)) return previousLoader(module, filename)
  const source = fs.readFileSync(filename, 'utf8')
  const transformed = babel.transformSync(source, {
    filename,
    presets: [['@babel/preset-env', { modules: 'commonjs', targets: { node: 'current' } }]]
  }).code
  module._compile(transformed, filename)
}

const domain = require(path.join(sourceRoot, 'services/domainSchema.js'))
const transfer = require(path.join(sourceRoot, 'services/transferSchema.js'))
const importer = require(path.join(sourceRoot, 'services/importer.js'))
const indexes = require(path.join(sourceRoot, 'services/libraryIndexes.js'))
const dynamic = require(path.join(sourceRoot, 'services/dynamicFeature.js'))
const sync = require(path.join(sourceRoot, 'services/librarySync.js'))

const category = { 编号: 'category-1', 名称: 'Work', 排序: 0, 创建时间: 1 }
const group = { 编号: 'group-1', 名称: 'Replies', 所属分类编号: 'category-1', 排序: 0, 创建时间: 1 }
const phrase = {
  编号: 'phrase-1', 标题: 'Greeting', 内容: 'Hello there', 所属分组编号: 'group-1',
  排序: 0, 使用次数: 0, 创建时间: 1, 更新时间: 1
}
const collections = { 分类: [category], 分组: [group], 常用语: [phrase] }

assert.equal(domain.validateCollections(collections).valid, true)
assert.deepEqual(domain.toPersistableCollections(collections), collections)

const malformed = {
  分类: [category, { ...category, 编号: 'category-1' }, { 编号: '', 名称: 'invalid' }],
  分组: [group, { ...group, 编号: 'orphan-group', 所属分类编号: 'missing' }],
  常用语: [phrase, { ...phrase, 编号: 'orphan-phrase', 所属分组编号: 'missing' }]
}
const sanitized = domain.sanitizeCollections(malformed)
assert.equal(domain.validateCollections(sanitized).valid, true)
assert.deepEqual(sanitized.分类.map(item => item.编号), ['category-1'])
assert.deepEqual(sanitized.分组.map(item => item.编号), ['group-1'])
assert.deepEqual(sanitized.常用语.map(item => item.编号), ['phrase-1'])

const transientCategory = { 编号: 'new-category-1', 名称: 'Draft category', 是否新建: true }
const transientGroup = { 编号: 'new-group-1', 名称: 'Draft group', 所属分类编号: 'new-category-1', 是否新建: true }
const transientPhrase = { 编号: 'new-phrase-1', 标题: 'Draft phrase', 内容: 'Draft content', 所属分组编号: 'new-group-1', 是否新建: true }
const transientCollections = { 分类: [transientCategory], 分组: [transientGroup], 常用语: [transientPhrase] }
assert.equal(domain.sanitizeCollections(transientCollections).分类.length, 0)
const preservedTransient = domain.sanitizeCollections(transientCollections, { allowTransient: true })
assert.deepEqual(preservedTransient, transientCollections)
assert.equal(domain.validateCollections(preservedTransient, { allowTransient: true }).valid, true)
const emptyTransient = {
  分类: [{ 编号: 'new-category-empty', 名称: '', 是否新建: true }],
  分组: [{ 编号: 'new-group-empty', 名称: '', 所属分类编号: 'new-category-empty', 是否新建: true }],
  常用语: [{ 编号: 'new-phrase-empty', 标题: '新建常用语', 内容: '', 所属分组编号: 'new-group-empty', 是否新建: true }]
}
assert.deepEqual(domain.sanitizeCollections(emptyTransient, { allowTransient: true }), emptyTransient)
assert.equal(domain.validateCollections(emptyTransient, { allowTransient: true }).valid, true)

// The normalizer must not reuse a category-shaped object as a group, and must
// re-check mutable input instead of trusting an earlier normalization call.
const shared = { 编号: 'shared', 名称: 'Shared' }
assert.equal(domain.normalizeCategory(shared).名称, 'Shared')
assert.equal(domain.normalizeGroup(shared).所属分类编号, undefined)
const mutable = { 编号: 'mutable', 名称: 'Before' }
domain.normalizeCategory(mutable)
mutable.名称 = ' After '
assert.equal(domain.normalizeCategory(mutable).名称, 'After')

const serialized = transfer.serializeCollections(collections)
assert.deepEqual(transfer.deserializeCollections(serialized), collections)
assert.throws(
  () => importer.prepareImportPreview({ name: 'malformed.json', buffer: new TextEncoder().encode(JSON.stringify({
    分类: [], 分组: [], 常用语: [], unexpected: true
  })) }, collections, { iflytekGroup: 'Imported', uncategorized: 'Ungrouped' }),
  /error.jsonInvalidShape/
)

const aiJson = JSON.stringify({
  分类: [{ 名称: 'Work', 分组: [{ 名称: 'Replies', 常用语: [{ 标题: 'Bye', 内容: 'See you' }] }] }]
})
const preview = importer.prepareAiImportPreview(aiJson, 'ai.json', collections)
assert.deepEqual(preview.统计, { 分类: 1, 分组: 1, 常用语: 1, 重复项: 0, 无效行: 0 })
assert.throws(
  () => importer.prepareAiImportPreview(JSON.stringify({ 分组: [{ 名称: 'Replies', 分类: [] }] }), 'malformed-ai.json', collections),
  /ai.importInvalidFormat/
)
const applied = importer.applyImportPreview(preview, collections, 'merge', (() => {
  let index = 0
  return () => `generated-${++index}`
})())
assert.equal(domain.validateCollections(applied.集合).valid, true)
assert.equal(applied.集合.分类[0].编号, 'category-1')
assert.equal(applied.集合.分组[0].编号, 'group-1')
assert.equal(applied.集合.常用语.length, 2)
const noOpImport = importer.applyImportPreview(preview, applied.集合, 'merge', () => 'unused-id')
assert.deepEqual(noOpImport.导入结果, { 分类: 0, 分组: 0, 常用语: 0, 跳过重复项: 1 })
const importedWithDraft = importer.applyImportPreview(preview, transientCollections, 'merge', (() => {
  let index = 0
  return () => `draft-import-${++index}`
})())
assert.equal(importedWithDraft.集合.分类.some(item => item.编号 === transientCategory.编号), true)
assert.equal(importedWithDraft.集合.分组.some(item => item.编号 === transientGroup.编号), true)
assert.equal(importedWithDraft.集合.常用语.some(item => item.编号 === transientPhrase.编号), true)
const overwrittenWithDraft = importer.applyImportPreview(preview, transientCollections, 'overwrite', (() => {
  let index = 0
  return () => `draft-overwrite-${++index}`
})())
assert.equal(overwrittenWithDraft.集合.分类.some(item => item.编号 === transientCategory.编号), true)
assert.equal(overwrittenWithDraft.集合.分组.some(item => item.编号 === transientGroup.编号), true)
assert.equal(overwrittenWithDraft.集合.常用语.some(item => item.编号 === transientPhrase.编号), true)

const graphIndexes = indexes.buildLibraryIndexes(
  [category, { 编号: 'empty-name', 名称: '' }],
  [group, { 编号: 'orphan', 名称: 'Orphan', 所属分类编号: 'missing' }],
  [phrase, { 编号: 'orphan-phrase', 标题: 'Orphan', 内容: 'x', 所属分组编号: 'missing' }]
)
assert.equal(graphIndexes.groupsByCategory.get('missing'), undefined)
assert.equal(graphIndexes.phrasesByGroup.get('missing'), undefined)
assert.equal(graphIndexes.groupsById.has('orphan'), false)
assert.equal(graphIndexes.phrasesById.has('orphan-phrase'), false)
const transientIndexes = indexes.buildLibraryIndexes(
  [{ 编号: 'new-category-empty', 名称: '', 是否新建: true }],
  [{ 编号: 'new-group-empty', 名称: '', 所属分类编号: 'new-category-empty', 是否新建: true }],
  [{ 编号: 'new-phrase-empty', 标题: '新建常用语', 内容: '', 所属分组编号: 'new-group-empty', 是否新建: true }]
)
assert.equal(transientIndexes.categoriesById.has('new-category-empty'), true)
assert.equal(transientIndexes.groupsById.has('new-group-empty'), true)
assert.equal(transientIndexes.phrasesById.has('new-phrase-empty'), true)

const commands = dynamic.createDynamicCommands(
  [category], [group, { 编号: 'orphan', 名称: 'Orphan', 所属分类编号: 'missing' }],
  [phrase, { 编号: 'empty', 标题: 'Empty', 内容: '', 所属分组编号: 'group-1' }],
  { category: 'Category', group: 'Group', phrase: 'Phrase' }
)
assert.deepEqual(commands, ['[Category] Work', '[Group] Replies', '[Phrase] Greeting'])
assert.deepEqual(dynamic.createDynamicCommands(
  [{ ...category, 是否新建: true }],
  [{ ...group, 是否新建: true }],
  [{ ...phrase, 是否新建: true }],
  { category: 'Category', group: 'Group', phrase: 'Phrase' }
), [])
assert.equal(sync.reconcilePendingCollections(collections, collections, malformed).分组.length, 1)
const syncedWithDraft = sync.reconcilePendingCollections(
  collections,
  transientCollections,
  collections
)
assert.equal(syncedWithDraft.分类.some(item => item.编号 === transientCategory.编号), true)
assert.equal(syncedWithDraft.分组.some(item => item.编号 === transientGroup.编号), true)
assert.equal(syncedWithDraft.常用语.some(item => item.编号 === transientPhrase.编号), true)

console.log('Domain verification passed: canonical graph, persistence, AI import, sync, indexes, and dynamic commands')
