import { DEFAULT_CONTENT_FONT, DEFAULT_INTERFACE_FONT } from './localFonts.js'

// Canonical hierarchy: 分类 (top level) → 分组 (child) → 常用语 (card).
const CATEGORY_FIELDS = [
  '编号', '名称', '排序', '创建时间', '是否新建', '是否引导演示'
]

const GROUP_FIELDS = [
  '编号', '名称', '所属分类编号', '排序', '创建时间', '是否新建', '是否引导演示'
]

const PHRASE_FIELDS = [
  '编号', '标题', '内容', '所属分组编号', '排序', '使用次数', '创建时间', '更新时间', '是否新建', '是否引导演示'
]

export const SETTING_FIELDS = [
  '主题模式', '卡片预览行数', '人工智能模型', '人工智能导入提示词', '人工智能归类提示词',
  '人工智能标题提示词', '人工智能内容提示词', '界面语言', '界面字体', '内容字体',
  '启动时打开', '上次分类编号', '上次分组编号'
]

export const DEFAULT_SETTINGS = Object.freeze({
  主题模式: 'auto', 卡片预览行数: 3, 人工智能模型: '',
  人工智能导入提示词: null, 人工智能归类提示词: null,
  人工智能标题提示词: null, 人工智能内容提示词: null,
  界面语言: 'auto', 界面字体: DEFAULT_INTERFACE_FONT, 内容字体: DEFAULT_CONTENT_FONT,
  启动时打开: 'last', 上次分类编号: null, 上次分组编号: null
})

const SUPPORTED_LANGUAGES = new Set([
  'auto', 'zh-CN', 'zh-HK', 'zh-TW', 'en', 'ja', 'vi', 'ko',
  'es', 'fr', 'pt-BR', 'pt-PT', 'ru', 'de', 'it'
])
const AI_PROMPT_FIELDS = [
  '人工智能导入提示词', '人工智能归类提示词', '人工智能标题提示词', '人工智能内容提示词'
]

const FIELD_MAPS = { category: CATEGORY_FIELDS, group: GROUP_FIELDS, phrase: PHRASE_FIELDS, settings: SETTING_FIELDS }
const CANONICAL_KEY_SETS = Object.fromEntries(
  Object.entries(FIELD_MAPS).map(([kind, fields]) => [kind, new Set(fields)])
)
const REQUIRED_CANONICAL_FIELDS = {
  category: ['编号', '名称'],
  group: ['编号', '名称', '所属分类编号'],
  phrase: ['编号', '标题', '内容', '所属分组编号'],
  settings: []
}
const IDENTIFIER_FIELDS = new Set(['编号', '所属分类编号', '所属分组编号'])
const NUMERIC_FIELDS = new Set(['排序', '使用次数', '创建时间', '更新时间'])
// Cache only immutable objects.  Runtime entities are usually updated through
// object spreads, but callers may still mutate an object after normalizing it.
// A global WeakSet would also incorrectly treat a category as a group when the
// same object reference is passed to another normalizer.  Keep the cache
// scoped by entity kind and never trust mutable references.
const canonicalObjectRefs = new Map(
  Object.keys(CANONICAL_KEY_SETS).map(kind => [kind, new WeakSet()])
)

function normalizeObject(source, fields, kind) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null
  const allowedKeys = CANONICAL_KEY_SETS[kind]
  const cachedRefs = canonicalObjectRefs.get(kind)
  if (cachedRefs?.has(source) && Object.isFrozen(source)) return source
  const sourceKeys = Object.keys(source)
  const hasCanonicalIdentifiers = sourceKeys.every(key => (
    !IDENTIFIER_FIELDS.has(key) || source[key] == null || (
      typeof source[key] === 'string' && source[key] === source[key].trim()
    )
  ))
  const hasCanonicalNumbers = sourceKeys.every(key => (
    !NUMERIC_FIELDS.has(key) || source[key] == null || (
      typeof source[key] === 'number' && Number.isFinite(source[key]) &&
      (key !== '使用次数' || (Number.isInteger(source[key]) && source[key] >= 0))
    )
  ))
  const hasCanonicalNames = sourceKeys.every(key => (
    key !== '名称' || source[key] == null || (typeof source[key] === 'string' && source[key] === source[key].trim())
  ))
  const hasCanonicalText = sourceKeys.every(key => (
    !['标题', '内容'].includes(key) || source[key] == null || typeof source[key] === 'string'
  ))
  const hasRequiredFields = (REQUIRED_CANONICAL_FIELDS[kind] || []).every(key => (
    Object.prototype.hasOwnProperty.call(source, key)
  ))
  if (allowedKeys && hasRequiredFields && hasCanonicalIdentifiers && hasCanonicalNumbers && hasCanonicalNames && hasCanonicalText && sourceKeys.every(key => allowedKeys.has(key))) {
    if (Object.isFrozen(source)) cachedRefs?.add(source)
    return source
  }
  const normalized = {}
  fields.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(source, key)) return
    const value = source[key]
    if (IDENTIFIER_FIELDS.has(key) && value != null) {
      if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) {
        const identifier = String(value).trim()
        if (identifier) normalized[key] = identifier
      }
    } else if (NUMERIC_FIELDS.has(key) && value != null) {
      const numericValue = typeof value === 'number' ? value : (typeof value === 'string' && value.trim() ? Number(value) : NaN)
      if (Number.isFinite(numericValue)) normalized[key] = key === '使用次数' ? Math.max(0, Math.trunc(numericValue)) : numericValue
    } else if (key === '名称' && typeof value === 'string') normalized[key] = value.trim()
    else normalized[key] = value
  })
  const result = Object.isFrozen(source) ? Object.freeze(normalized) : normalized
  return result
}

function normalizeList(items, normalizer) {
  if (!Array.isArray(items)) return []
  const normalized = []
  let unchanged = true
  items.forEach(item => {
    const next = normalizer(item)
    if (!next) { unchanged = false; return }
    if (next !== item) unchanged = false
    normalized.push(next)
  })
  const result = unchanged && normalized.length === items.length
    ? items
    : (Object.isFrozen(items) ? Object.freeze(normalized) : normalized)
  return result
}

export function normalizeCategory(category) { return normalizeObject(category, CATEGORY_FIELDS, 'category') }
export function normalizeGroup(group) { return normalizeObject(group, GROUP_FIELDS, 'group') }
export function normalizePhrase(phrase) { return normalizeObject(phrase, PHRASE_FIELDS, 'phrase') }
export function normalizeCategories(categories) { return normalizeList(categories, normalizeCategory) }
export function normalizeGroups(groups) { return normalizeList(groups, normalizeGroup) }
export function normalizePhrases(phrases) { return normalizeList(phrases, normalizePhrase) }
export function normalizeSettings(settings) { return normalizeObject(settings, SETTING_FIELDS, 'settings') || {} }

export function mergeSettings(base, updates) {
  return normalizeSettings({ ...normalizeSettings(base), ...normalizeSettings(updates) })
}

export function isValidSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return false
  if (!isCanonicalEntity('settings', settings)) return false
  if (settings.主题模式 !== undefined && !['auto', 'light', 'dark'].includes(settings.主题模式)) return false
  if (settings.卡片预览行数 !== undefined && (!Number.isInteger(settings.卡片预览行数) || settings.卡片预览行数 < 1 || settings.卡片预览行数 > 10)) return false
  if (settings.人工智能模型 !== undefined && typeof settings.人工智能模型 !== 'string') return false
  if (AI_PROMPT_FIELDS.some(key => settings[key] !== undefined && settings[key] !== null && typeof settings[key] !== 'string')) return false
  if (settings.界面语言 !== undefined && !SUPPORTED_LANGUAGES.has(settings.界面语言)) return false
  for (const key of ['界面字体', '内容字体']) {
    if (settings[key] !== undefined && (typeof settings[key] !== 'string' || !settings[key].trim() || settings[key] !== settings[key].trim() || settings[key].length > 120 || /[\u0000-\u001f\u007f]/.test(settings[key]))) return false
  }
  if (settings.启动时打开 !== undefined && !['last', 'first'].includes(settings.启动时打开)) return false
  if (['上次分类编号', '上次分组编号'].some(key => settings[key] !== undefined && settings[key] !== null && !['string', 'number'].includes(typeof settings[key]))) return false
  return true
}

export function loadSettings(settings) {
  const source = isValidSettings(settings) ? normalizeSettings(settings) : {}
  const loaded = mergeSettings(DEFAULT_SETTINGS, source)
  return mergeSettings(loaded, {
    上次分类编号: loaded.上次分类编号 == null ? null : String(loaded.上次分类编号),
    上次分组编号: loaded.上次分组编号 == null ? null : String(loaded.上次分组编号)
  })
}

export function normalizeCollections(collections) {
  const source = collections && typeof collections === 'object' && !Array.isArray(collections) ? collections : {}
  const normalized = {
    分类: normalizeCategories(source.分类),
    分组: normalizeGroups(source.分组),
    常用语: normalizePhrases(source.常用语)
  }
  return Object.isFrozen(source) ? Object.freeze(normalized) : normalized
}

function entityId(value) {
  const id = String(value ?? '').trim()
  return id || null
}

/**
 * Validate the complete in-memory graph.  Field validation alone is not
 * sufficient: a valid group must point at one valid category and a valid
 * phrase must point at one valid group.  This is the single graph invariant
 * used by persistence, transfer, recovery, and cloud reconciliation.
 */
export function validateCollections(collections, { allowTransient = false } = {}) {
  const normalized = normalizeCollections(collections)
  const errors = []
  const categoryIds = new Set()
  const groupIds = new Set()
  const phraseIds = new Set()

  normalized.分类.forEach((category, index) => {
    const id = entityId(category?.编号)
    const transient = allowTransient && (category?.是否新建 || category?.是否引导演示)
    const valid = id && typeof category?.名称 === 'string' && (transient || category.名称.trim()) &&
      (allowTransient || !category.是否新建 && !category.是否引导演示)
    if (!valid) errors.push(`分类[${index}]`)
    else if (categoryIds.has(id)) errors.push(`分类[${index}].编号`)
    else categoryIds.add(id)
  })

  normalized.分组.forEach((group, index) => {
    const id = entityId(group?.编号)
    const categoryId = entityId(group?.所属分类编号)
    const transient = allowTransient && (group?.是否新建 || group?.是否引导演示)
    const valid = id && typeof group?.名称 === 'string' && (transient || group.名称.trim()) && categoryId &&
      categoryIds.has(categoryId) && (allowTransient || !group.是否新建 && !group.是否引导演示)
    if (!valid) errors.push(`分组[${index}]`)
    else if (groupIds.has(id)) errors.push(`分组[${index}].编号`)
    else groupIds.add(id)
  })

  normalized.常用语.forEach((phrase, index) => {
    const id = entityId(phrase?.编号)
    const groupId = entityId(phrase?.所属分组编号)
    const transient = allowTransient && (phrase?.是否新建 || phrase?.是否引导演示)
    const valid = id && typeof phrase?.标题 === 'string' && (transient || phrase.标题.trim()) &&
      typeof phrase?.内容 === 'string' && (transient || phrase.内容.trim()) && groupId &&
      groupIds.has(groupId) && (allowTransient || !phrase.是否新建 && !phrase.是否引导演示)
    if (!valid) errors.push(`常用语[${index}]`)
    else if (phraseIds.has(id)) errors.push(`常用语[${index}].编号`)
    else phraseIds.add(id)
  })

  return { valid: errors.length === 0, errors, collections: normalized }
}

/** Remove invalid entities and every orphaned descendant in one pass. */
export function sanitizeCollections(collections, { allowTransient = false } = {}) {
  const normalized = normalizeCollections(collections)
  const isValidEntity = (kind, item) => {
    if (!isCanonicalEntity(kind, item)) return false
    const transient = allowTransient && (item.是否新建 || item.是否引导演示)
    if (!allowTransient && (item.是否新建 || item.是否引导演示)) return false
    const hasId = value => value !== undefined && value !== null && String(value).trim() !== ''
    const hasText = value => typeof value === 'string' && value.trim() !== ''
    const hasString = value => typeof value === 'string'
    if (kind === 'category') return hasId(item.编号) && (transient ? hasString(item.名称) : hasText(item.名称))
    if (kind === 'group') return hasId(item.编号) && (transient ? hasString(item.名称) : hasText(item.名称)) && hasId(item.所属分类编号)
    return hasId(item.编号) && (transient ? hasString(item.标题) && hasString(item.内容) : hasText(item.标题) && hasText(item.内容)) && hasId(item.所属分组编号)
  }
  const categories = uniqueById(normalized.分类.filter(item => isValidEntity('category', item)))
  const categoryIds = new Set(categories.map(item => entityId(item.编号)))
  const groups = uniqueById(normalized.分组.filter(item => (
    isValidEntity('group', item) && categoryIds.has(entityId(item.所属分类编号))
  )))
  const groupIds = new Set(groups.map(item => entityId(item.编号)))
  const phrases = uniqueById(normalized.常用语.filter(item => (
    isValidEntity('phrase', item) && groupIds.has(entityId(item.所属分组编号))
  )))
  return normalizeCollections({ 分类: categories, 分组: groups, 常用语: phrases })
}

function uniqueById(items) {
  const seen = new Set()
  let changed = false
  const uniqueItems = items.filter(item => {
    const id = String(item.编号 ?? '').trim()
    if (!id || seen.has(id)) { changed = true; return false }
    seen.add(id)
    return true
  })
  return changed ? uniqueItems : items
}

export function toPersistableCollections(collections) {
  const normalized = normalizeCollections(collections)
  const transientCategoryIds = new Set(normalized.分类.filter(item => item.是否新建 || item.是否引导演示).map(item => String(item.编号)))
  const categories = uniqueById(normalized.分类.filter(item => !transientCategoryIds.has(String(item.编号))))
  const categoryIds = new Set(categories.map(item => String(item.编号)))
  const groups = uniqueById(normalized.分组.filter(item => !item.是否新建 && !item.是否引导演示 && categoryIds.has(String(item.所属分类编号))))
  const groupIds = new Set(groups.map(item => String(item.编号)))
  const phrases = uniqueById(normalized.常用语.filter(item => !item.是否新建 && !item.是否引导演示 && groupIds.has(String(item.所属分组编号))))

  const stripRuntimeFields = item => {
    if (!Object.prototype.hasOwnProperty.call(item, '是否新建') && !Object.prototype.hasOwnProperty.call(item, '是否引导演示')) return item
    const persistable = { ...item }
    delete persistable.是否新建
    delete persistable.是否引导演示
    return persistable
  }

  return sanitizeCollections({
    分类: categories.map(stripRuntimeFields).filter(item => isValidPersistedEntity('category', item)),
    分组: groups.map(stripRuntimeFields).filter(item => isValidPersistedEntity('group', item)),
    常用语: phrases.map(stripRuntimeFields).filter(item => isValidPersistedEntity('phrase', item))
  })
}

export function normalizeEntity(kind, entity) {
  const normalizer = { category: normalizeCategory, group: normalizeGroup, phrase: normalizePhrase }[kind]
  return normalizer ? normalizer(entity) : null
}

export function isCanonicalEntity(kind, entity) {
  const fields = FIELD_MAPS[kind]
  if (!fields || !entity || typeof entity !== 'object' || Array.isArray(entity)) return false
  const allowedKeys = CANONICAL_KEY_SETS[kind]
  return Object.keys(entity).every(key => allowedKeys.has(key))
}

export function isValidPersistedEntity(kind, entity) {
  if (!isCanonicalEntity(kind, entity) || entity.是否新建 || entity.是否引导演示) return false
  const hasId = value => value !== undefined && value !== null && String(value).trim() !== ''
  const hasText = value => typeof value === 'string' && value.trim() !== ''
  if (kind === 'category') return hasId(entity.编号) && hasText(entity.名称)
  if (kind === 'group') return hasId(entity.编号) && hasText(entity.名称) && hasId(entity.所属分类编号)
  if (kind === 'phrase') return hasId(entity.编号) && hasText(entity.标题) && hasText(entity.内容) && hasId(entity.所属分组编号)
  return false
}
