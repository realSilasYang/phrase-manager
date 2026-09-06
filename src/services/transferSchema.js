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

// 导入导出数据的边界转换层：只读写规范化后的中文字段，过滤未知或空值字段。
function readValue(source, chineseKey) {
  return source?.[chineseKey]
}

function compact(entries) {
  // 序列化时移除 undefined，避免备份文件出现无意义的空字段。
  return Object.fromEntries(entries.filter(([, value]) => value !== undefined))
}

function serializeGroup(group) {
  // 分组只保留编号、名称、排序和创建时间四个稳定字段。
  const normalized = normalizeGroup(group)
  return compact([
    ['编号', normalized?.编号],
    ['名称', normalized?.名称],
    ['排序', normalized?.排序],
    ['创建时间', normalized?.创建时间]
  ])
}

function serializeCategory(category) {
  // 分类额外保留所属分组编号，用于导入时恢复父子关系。
  const normalized = normalizeCategory(category)
  return compact([
    ['编号', normalized?.编号],
    ['名称', normalized?.名称],
    ['所属分组编号', normalized?.所属分组编号],
    ['排序', normalized?.排序],
    ['创建时间', normalized?.创建时间]
  ])
}

function serializePhrase(phrase) {
  // 常用语保留正文、归属、排序、使用次数及创建和更新时间。
  const normalized = normalizePhrase(phrase)
  return compact([
    ['编号', normalized?.编号],
    ['标题', normalized?.标题],
    ['内容', normalized?.内容],
    ['所属分类编号', normalized?.所属分类编号],
    ['排序', normalized?.排序],
    ['使用次数', normalized?.使用次数],
    ['创建时间', normalized?.创建时间],
    ['更新时间', normalized?.更新时间]
  ])
}

function deserializeGroup(group) {
  // 反序列化前只读取允许字段，再交给领域规范化函数校正类型和默认值。
  return normalizeGroup(compact([
    ['编号', readValue(group, '编号')],
    ['名称', readValue(group, '名称')],
    ['排序', readValue(group, '排序')],
    ['创建时间', readValue(group, '创建时间')]
  ]))
}

function deserializeCategory(category) {
  // 分类反序列化保留所属分组编号，整体关联性由集合反序列化阶段统一校验。
  return normalizeCategory(compact([
    ['编号', readValue(category, '编号')],
    ['名称', readValue(category, '名称')],
    ['所属分组编号', readValue(category, '所属分组编号')],
    ['排序', readValue(category, '排序')],
    ['创建时间', readValue(category, '创建时间')]
  ]))
}

function deserializePhrase(phrase) {
  // 常用语反序列化保留所有可持久化字段，正文校验由领域模型负责。
  return normalizePhrase(compact([
    ['编号', readValue(phrase, '编号')],
    ['标题', readValue(phrase, '标题')],
    ['内容', readValue(phrase, '内容')],
    ['所属分类编号', readValue(phrase, '所属分类编号')],
    ['排序', readValue(phrase, '排序')],
    ['使用次数', readValue(phrase, '使用次数')],
    ['创建时间', readValue(phrase, '创建时间')],
    ['更新时间', readValue(phrase, '更新时间')]
  ]))
}

export function serializeCollections(collections = {}) {
  // 只导出可持久化实体，演示数据和编辑草稿不会进入备份。
  const { 分组, 分类, 常用语 } = toPersistableCollections(collections)
  return {
    分组: 分组.map(serializeGroup),
    分类: 分类.map(serializeCategory),
    常用语: 常用语.map(serializePhrase)
  }
}

export function deserializeCollections(data) {
  // 先检查三个顶层数组和实体关联，再生成可供应用使用的规范化集合。
  const parentCategories = readValue(data, '分组')
  const categories = readValue(data, '分类')
  const phrases = readValue(data, '常用语')
  if (!Array.isArray(parentCategories) || !Array.isArray(categories) || !Array.isArray(phrases)) return null
  if (!parentCategories.every(item => isCanonicalEntity('group', item)) ||
    !categories.every(item => isCanonicalEntity('category', item)) ||
    !phrases.every(item => isCanonicalEntity('phrase', item))) return null
  return normalizeCollections({
    分组: parentCategories.map(deserializeGroup),
    分类: categories.map(deserializeCategory),
    常用语: phrases.map(deserializePhrase)
  })
}

export function serializeSettings(settings) {
  // 设置只允许领域模型声明的字段，防止将临时状态写入备份。
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  const normalized = normalizeSettings(settings)
  return compact(SETTING_FIELDS.map(key => [key, normalized[key]]))
}

export function deserializeSettings(data) {
  // 恢复设置前验证对象形状；无效设置返回 null，由调用方使用默认配置。
  const settings = readValue(data, '设置')
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  if (!isCanonicalEntity('settings', settings)) return null
  return normalizeSettings(compact(SETTING_FIELDS.map(key => [
    key,
    readValue(settings, key)
  ])))
}
