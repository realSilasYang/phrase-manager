import {
  SETTING_FIELDS,
  normalizeCategory,
  normalizeCollections,
  normalizeGroup,
  normalizePhrase,
  normalizeSettings,
  toPersistableCollections,
  isCanonicalEntity
} from './domainSchema'

// External JSON uses the same canonical hierarchy as the runtime:
// 分类 (top level) → 分组 (child) → 常用语.
function readValue(source, key) { return source?.[key] }
function compact(entries) { return Object.fromEntries(entries.filter(([, value]) => value !== undefined)) }

function serializeCategory(category) {
  const normalized = normalizeCategory(category)
  return compact([['编号', normalized?.编号], ['名称', normalized?.名称], ['排序', normalized?.排序], ['创建时间', normalized?.创建时间]])
}

function serializeGroup(group) {
  const normalized = normalizeGroup(group)
  return compact([
    ['编号', normalized?.编号], ['名称', normalized?.名称], ['所属分类编号', normalized?.所属分类编号],
    ['排序', normalized?.排序], ['创建时间', normalized?.创建时间]
  ])
}

function serializePhrase(phrase) {
  const normalized = normalizePhrase(phrase)
  return compact([
    ['编号', normalized?.编号], ['标题', normalized?.标题], ['内容', normalized?.内容],
    ['所属分组编号', normalized?.所属分组编号], ['排序', normalized?.排序], ['使用次数', normalized?.使用次数],
    ['创建时间', normalized?.创建时间], ['更新时间', normalized?.更新时间]
  ])
}

function deserializeCategory(category) {
  return normalizeCategory(compact([
    ['编号', readValue(category, '编号')], ['名称', readValue(category, '名称')],
    ['排序', readValue(category, '排序')], ['创建时间', readValue(category, '创建时间')]
  ]))
}

function deserializeGroup(group) {
  return normalizeGroup(compact([
    ['编号', readValue(group, '编号')], ['名称', readValue(group, '名称')],
    ['所属分类编号', readValue(group, '所属分类编号')], ['排序', readValue(group, '排序')],
    ['创建时间', readValue(group, '创建时间')]
  ]))
}

function deserializePhrase(phrase) {
  return normalizePhrase(compact([
    ['编号', readValue(phrase, '编号')], ['标题', readValue(phrase, '标题')], ['内容', readValue(phrase, '内容')],
    ['所属分组编号', readValue(phrase, '所属分组编号')], ['排序', readValue(phrase, '排序')],
    ['使用次数', readValue(phrase, '使用次数')], ['创建时间', readValue(phrase, '创建时间')],
    ['更新时间', readValue(phrase, '更新时间')]
  ]))
}

export function serializeCollections(collections = {}) {
  const normalized = toPersistableCollections(collections)
  return {
    分类: normalized.分类.map(serializeCategory),
    分组: normalized.分组.map(serializeGroup),
    常用语: normalized.常用语.map(serializePhrase)
  }
}

export function deserializeCollections(data) {
  const categories = readValue(data, '分类')
  const groups = readValue(data, '分组')
  const phrases = readValue(data, '常用语')
  if (!Array.isArray(categories) || !Array.isArray(groups) || !Array.isArray(phrases)) return null
  if (!categories.every(item => isCanonicalEntity('category', item)) ||
    !groups.every(item => isCanonicalEntity('group', item)) ||
    !phrases.every(item => isCanonicalEntity('phrase', item))) return null
  return normalizeCollections({
    分类: categories.map(deserializeCategory),
    分组: groups.map(deserializeGroup),
    常用语: phrases.map(deserializePhrase)
  })
}

export function serializeSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  const normalized = normalizeSettings(settings)
  return compact(SETTING_FIELDS.map(key => [key, normalized[key]]))
}

export function deserializeSettings(data) {
  const settings = readValue(data, '设置')
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  if (!isCanonicalEntity('settings', settings)) return null
  return normalizeSettings(compact(SETTING_FIELDS.map(key => [key, readValue(settings, key)])))
}
