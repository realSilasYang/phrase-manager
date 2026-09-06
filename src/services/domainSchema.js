import { DEFAULT_CONTENT_FONT, DEFAULT_INTERFACE_FONT } from './localFonts'

const GROUP_FIELDS = [
  '编号',
  '名称',
  '排序',
  '创建时间',
  '是否新建',
  '是否引导演示'
]

const CATEGORY_FIELDS = [
  '编号',
  '名称',
  '所属分组编号',
  '排序',
  '创建时间',
  '是否新建',
  '是否引导演示'
]

const PHRASE_FIELDS = [
  '编号',
  '标题',
  '内容',
  '所属分类编号',
  '排序',
  '使用次数',
  '创建时间',
  '更新时间',
  '是否新建',
  '是否引导演示'
]

export const SETTING_FIELDS = [
  '主题模式',
  '卡片预览行数',
  '人工智能模型',
  '人工智能导入提示词',
  '人工智能归类提示词',
  '人工智能标题提示词',
  '人工智能内容提示词',
  '界面语言',
  '界面字体',
  '内容字体',
  '启动时打开',
  '上次分组编号',
  '上次分类编号'
]

export const DEFAULT_SETTINGS = Object.freeze({
  主题模式: 'auto',
  卡片预览行数: 3,
  人工智能模型: '',
  人工智能导入提示词: null,
  人工智能归类提示词: null,
  人工智能标题提示词: null,
  人工智能内容提示词: null,
  界面语言: 'auto',
  界面字体: DEFAULT_INTERFACE_FONT,
  内容字体: DEFAULT_CONTENT_FONT,
  启动时打开: 'last',
  上次分组编号: null,
  上次分类编号: null
})
const SUPPORTED_LANGUAGES = new Set([
  'auto', 'zh-CN', 'zh-HK', 'zh-TW', 'en', 'ja', 'vi', 'ko',
  'es', 'fr', 'pt-BR', 'pt-PT', 'ru', 'de', 'it'
])
const AI_PROMPT_FIELDS = [
  '人工智能导入提示词',
  '人工智能归类提示词',
  '人工智能标题提示词',
  '人工智能内容提示词'
]

const LEGACY_FIELDS = {
  group: ['id', 'name', 'order', 'createdAt', 'isNew', 'isGuideDemo'],
  category: ['id', 'name', 'parentCategoryId', 'order', 'createdAt', 'isNew', 'isGuideDemo'],
  phrase: ['id', 'title', 'content', 'categoryId', 'order', 'usageCount', 'createdAt', 'updatedAt', 'isNew', 'isGuideDemo'],
  settings: [
    'themeMode', 'previewLines', 'aiModel', 'aiImportPrompt', 'aiCategorizePrompt',
    'aiTitlePrompt', 'aiContentPrompt', 'language', 'startupSelection',
    'lastParentCategoryId', 'lastCategoryId'
  ],
  collections: ['parentCategories', 'categories', 'phrases']
}

const FIELD_MAPS = {
  group: GROUP_FIELDS,
  category: CATEGORY_FIELDS,
  phrase: PHRASE_FIELDS,
  settings: SETTING_FIELDS
}

const CANONICAL_KEY_SETS = Object.fromEntries(
  Object.entries(FIELD_MAPS).map(([kind, fields]) => [kind, new Set(fields)])
)
const IDENTIFIER_FIELDS = new Set(['编号', '所属分组编号', '所属分类编号'])
const NUMERIC_FIELDS = new Set(['排序', '使用次数', '创建时间', '更新时间'])

// 状态更新遵循不可变原则，因此已经规范化的对象和数组可以安全复用引用。
// 复用引用能避免每次渲染或保存都复制整套数据，降低大数据量下的开销。
const canonicalObjectRefs = new WeakSet()
const canonicalListRefs = new WeakSet()

function assertNoLegacyFields(source, kind) {
  const legacy = LEGACY_FIELDS[kind] || []
  const found = legacy.find(key => Object.prototype.hasOwnProperty.call(source, key))
  if (found) throw new TypeError(`不再支持英文字段：${found}`)
}

function normalizeObject(source, fields, kind) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null
  if (canonicalObjectRefs.has(source)) return source
  assertNoLegacyFields(source, kind)
  const allowedKeys = CANONICAL_KEY_SETS[kind]
  const sourceKeys = Object.keys(source)
  const hasCanonicalIdentifiers = sourceKeys.every(key => (
    !IDENTIFIER_FIELDS.has(key) || source[key] == null || typeof source[key] === 'string'
  ))
  const hasCanonicalNumbers = sourceKeys.every(key => (
    !NUMERIC_FIELDS.has(key) || source[key] == null || (
      typeof source[key] === 'number' && Number.isFinite(source[key]) &&
      (key !== '使用次数' || (Number.isInteger(source[key]) && source[key] >= 0))
    )
  ))
  if (allowedKeys && hasCanonicalIdentifiers && hasCanonicalNumbers && sourceKeys.every(key => allowedKeys.has(key))) {
    canonicalObjectRefs.add(source)
    return source
  }
  const normalized = {}
  fields.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(source, key)) return
    const value = source[key]
    if (IDENTIFIER_FIELDS.has(key) && value != null) {
      if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) {
        normalized[key] = String(value)
      }
    } else if (NUMERIC_FIELDS.has(key) && value != null) {
      const numericValue = typeof value === 'number'
        ? value
        : (typeof value === 'string' && value.trim() ? Number(value) : NaN)
      if (Number.isFinite(numericValue)) {
        normalized[key] = key === '使用次数' ? Math.max(0, Math.trunc(numericValue)) : numericValue
      }
    } else {
      normalized[key] = value
    }
  })
  const result = Object.isFrozen(source) ? Object.freeze(normalized) : normalized
  canonicalObjectRefs.add(result)
  return result
}

function normalizeList(items, normalizer) {
  if (!Array.isArray(items)) return []
  if (canonicalListRefs.has(items)) return items
  const normalized = []
  let unchanged = true
  items.forEach(item => {
    const next = normalizer(item)
    if (!next) {
      unchanged = false
      return
    }
    if (next !== item) unchanged = false
    normalized.push(next)
  })
  const result = unchanged && normalized.length === items.length
    ? items
    : (Object.isFrozen(items) ? Object.freeze(normalized) : normalized)
  canonicalListRefs.add(result)
  return result
}

export function normalizeGroup(group) {
  return normalizeObject(group, GROUP_FIELDS, 'group')
}

export function normalizeCategory(category) {
  return normalizeObject(category, CATEGORY_FIELDS, 'category')
}

export function normalizePhrase(phrase) {
  return normalizeObject(phrase, PHRASE_FIELDS, 'phrase')
}

export function normalizeGroups(groups) {
  return normalizeList(groups, normalizeGroup)
}

export function normalizeCategories(categories) {
  return normalizeList(categories, normalizeCategory)
}

export function normalizePhrases(phrases) {
  return normalizeList(phrases, normalizePhrase)
}

export function normalizeSettings(settings) {
  return normalizeObject(settings, SETTING_FIELDS, 'settings') || {}
}

export function mergeSettings(base, updates) {
  return normalizeSettings({ ...normalizeSettings(base), ...normalizeSettings(updates) })
}

export function isValidSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return false
  if (!isCanonicalEntity('settings', settings)) return false
  if (settings.主题模式 !== undefined && !['auto', 'light', 'dark'].includes(settings.主题模式)) return false
  if (settings.卡片预览行数 !== undefined && (
    !Number.isInteger(settings.卡片预览行数) || settings.卡片预览行数 < 1 || settings.卡片预览行数 > 10
  )) return false
  if (settings.人工智能模型 !== undefined && typeof settings.人工智能模型 !== 'string') return false
  if (AI_PROMPT_FIELDS.some(key => settings[key] !== undefined && settings[key] !== null && typeof settings[key] !== 'string')) return false
  if (settings.界面语言 !== undefined && !SUPPORTED_LANGUAGES.has(settings.界面语言)) return false
  for (const key of ['界面字体', '内容字体']) {
    if (settings[key] !== undefined && (
      typeof settings[key] !== 'string' || !settings[key].trim() ||
      settings[key] !== settings[key].trim() ||
      settings[key].length > 120 || /[\u0000-\u001f\u007f]/.test(settings[key])
    )) return false
  }
  if (settings.启动时打开 !== undefined && !['last', 'first'].includes(settings.启动时打开)) return false
  if (['上次分组编号', '上次分类编号'].some(key => (
    settings[key] !== undefined && settings[key] !== null &&
    !['string', 'number'].includes(typeof settings[key])
  ))) return false
  return true
}

export function loadSettings(settings) {
  const source = isValidSettings(settings) ? normalizeSettings(settings) : {}
  const loaded = mergeSettings(DEFAULT_SETTINGS, source)
  return mergeSettings(loaded, {
    上次分组编号: loaded.上次分组编号 == null ? null : String(loaded.上次分组编号),
    上次分类编号: loaded.上次分类编号 == null ? null : String(loaded.上次分类编号)
  })
}

export function normalizeCollections(collections) {
  const source = collections && typeof collections === 'object' && !Array.isArray(collections) ? collections : {}
  assertNoLegacyFields(source, 'collections')
  const normalized = {
    分组: normalizeGroups(source.分组),
    分类: normalizeCategories(source.分类),
    常用语: normalizePhrases(source.常用语)
  }
  return Object.isFrozen(source) ? Object.freeze(normalized) : normalized
}

export function toPersistableCollections(collections) {
  const normalized = normalizeCollections(collections)
  const transientGroupIds = new Set(normalized.分组
    .filter(group => group.是否新建 || group.是否引导演示)
    .map(group => String(group.编号)))
  const groups = transientGroupIds.size === 0
    ? normalized.分组
    : normalized.分组.filter(group => !transientGroupIds.has(String(group.编号)))

  const transientCategoryIds = new Set(normalized.分类
    .filter(category => (
      category.是否新建 || category.是否引导演示 ||
      transientGroupIds.has(String(category.所属分组编号))
    ))
    .map(category => String(category.编号)))
  const categories = transientCategoryIds.size === 0
    ? normalized.分类
    : normalized.分类.filter(category => !transientCategoryIds.has(String(category.编号)))
  const phrases = normalized.常用语.some(phrase => (
    phrase.是否新建 || phrase.是否引导演示 ||
    transientCategoryIds.has(String(phrase.所属分类编号))
  ))
    ? normalized.常用语.filter(phrase => (
      !phrase.是否新建 && !phrase.是否引导演示 &&
      !transientCategoryIds.has(String(phrase.所属分类编号))
    ))
    : normalized.常用语

  const uniqueById = items => {
    const seen = new Set()
    let changed = false
    const uniqueItems = items.filter(item => {
      const id = String(item.编号 ?? '').trim()
      if (!id || seen.has(id)) {
        changed = true
        return false
      }
      seen.add(id)
      return true
    })
    return changed ? uniqueItems : items
  }

  const uniqueGroups = uniqueById(groups)
  const groupIds = new Set(uniqueGroups.map(group => String(group.编号)))
  const relatedCategories = categories.some(category => !groupIds.has(String(category.所属分组编号)))
    ? categories.filter(category => groupIds.has(String(category.所属分组编号)))
    : categories
  const uniqueCategories = uniqueById(relatedCategories)
  const categoryIds = new Set(uniqueCategories.map(category => String(category.编号)))
  const relatedPhrases = phrases.some(phrase => !categoryIds.has(String(phrase.所属分类编号)))
    ? phrases.filter(phrase => categoryIds.has(String(phrase.所属分类编号)))
    : phrases

  const stripRuntimeFields = item => {
    if (!Object.prototype.hasOwnProperty.call(item, '是否新建') &&
      !Object.prototype.hasOwnProperty.call(item, '是否引导演示')) return item
    const persistable = { ...item }
    delete persistable.是否新建
    delete persistable.是否引导演示
    return persistable
  }
  const stripCollectionRuntimeFields = items => items.some(item => (
    Object.prototype.hasOwnProperty.call(item, '是否新建') ||
    Object.prototype.hasOwnProperty.call(item, '是否引导演示')
  )) ? items.map(stripRuntimeFields) : items

  const persistableGroups = stripCollectionRuntimeFields(uniqueGroups)
    .filter(group => isValidPersistedEntity('group', group))
  const persistableGroupIds = new Set(persistableGroups.map(group => String(group.编号)))
  const persistableCategories = stripCollectionRuntimeFields(uniqueCategories)
    .filter(category => (
      isValidPersistedEntity('category', category) &&
      persistableGroupIds.has(String(category.所属分组编号))
    ))
  const persistableCategoryIds = new Set(persistableCategories.map(category => String(category.编号)))
  const persistablePhrases = stripCollectionRuntimeFields(uniqueById(relatedPhrases))
    .filter(phrase => (
      isValidPersistedEntity('phrase', phrase) &&
      persistableCategoryIds.has(String(phrase.所属分类编号))
    ))

  return normalizeCollections({
    分组: persistableGroups,
    分类: persistableCategories,
    常用语: persistablePhrases
  })
}

export function normalizeEntity(kind, entity) {
  const normalizer = {
    group: normalizeGroup,
    category: normalizeCategory,
    phrase: normalizePhrase
  }[kind]
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

  if (kind === 'group') return hasId(entity.编号) && hasText(entity.名称)
  if (kind === 'category') {
    return hasId(entity.编号) && hasText(entity.名称) && hasId(entity.所属分组编号)
  }
  if (kind === 'phrase') {
    return hasId(entity.编号) && hasText(entity.标题) && hasText(entity.内容) && hasId(entity.所属分类编号)
  }
  return false
}
