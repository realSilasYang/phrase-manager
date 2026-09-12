import zhCN from './zh-CN'
import zhHK from './zh-HK'
import zhTW from './zh-TW'
import en from './en'
import ja from './ja'
import vi from './vi'
import ko from './ko'
import es from './es'
import fr from './fr'
import ptBR from './pt-BR'
import ptPT from './pt-PT'
import ru from './ru'
import de from './de'
import it from './it'
import { mergeLocale } from './mergeLocale'
import interfaceTranslations from './interfaceTranslations'
import importHelpTranslations from './importHelpTranslations'
import aiSettingsTranslations from './aiSettingsTranslations'
import hierarchyTranslations from './hierarchyTranslations'

// Each locale is authored with the canonical hierarchy: category -> group -> phrase.
export const buildLocale = (code, base) => {
  const merged = mergeLocale(
    mergeLocale(base, interfaceTranslations[code]),
    importHelpTranslations[code]
  )
  const withSettings = mergeLocale(merged, aiSettingsTranslations[code])
  const hierarchy = hierarchyTranslations[code] || {}
  // Apply the canonical hierarchy terminology while retaining each locale's
  // native wording for general interface text.
  const hierarchyPatch = {
    label: hierarchy.label,
    dynamic: hierarchy.dynamic,
    menu: hierarchy.menu,
    tooltip: hierarchy.tooltip,
    defaults: hierarchy.defaults,
    empty: hierarchy.empty,
    section: hierarchy.section,
    count: hierarchy.count,
    importPreview: hierarchy.importPreview,
    ai: {
      categorized: hierarchy.ai?.categorized,
      categorizedCategory: hierarchy.ai?.categorizedCategory,
      categoryNotFound: hierarchy.ai?.categoryNotFound,
      groupNotFound: hierarchy.ai?.groupNotFound,
      noSuggestion: hierarchy.ai?.noSuggestion,
      prompt: hierarchy.ai?.prompt
    },
    help: {
      hierarchyCategory: hierarchy.help?.hierarchyCategory,
      hierarchyCategoryDesc: hierarchy.help?.hierarchyCategoryDesc,
      hierarchyGroup: hierarchy.help?.hierarchyGroup,
      hierarchyGroupDesc: hierarchy.help?.hierarchyGroupDesc,
      featureDragDesc: hierarchy.help?.featureDragDesc,
      featureSearchDesc: hierarchy.help?.featureSearchDesc
    },
    guide: {
      steps: hierarchy.guide?.steps,
      demo: hierarchy.guide?.demo
        ? {
            ...(hierarchy.guide.demo.categoryName ? { categoryName: hierarchy.guide.demo.categoryName } : {}),
            ...(hierarchy.guide.demo.groupName ? { groupName: hierarchy.guide.demo.groupName } : {}),
            ...(hierarchy.guide.demo.phraseContent3 ? { phraseContent3: hierarchy.guide.demo.phraseContent3 } : {})
          }
        : undefined
    }
  }
  const result = mergeLocale(withSettings, hierarchyPatch)
  // Apply the canonical category → group terminology to all status messages.
  result.snackbar = mergeLocale(result.snackbar, hierarchy.snackbar)
  const category = result.label?.category || 'Category'
  const group = result.label?.group || 'Group'
  if (result.ai?.prompt) {
    if (typeof result.ai.prompt.categorizeSystem === 'string' && !result.ai.prompt.categorizeSystem.includes(`[${category}:TOP_LEVEL]`)) result.ai.prompt.categorizeSystem += `\n[${category}:TOP_LEVEL] > [${group}:NESTED]`
    if (typeof result.ai.prompt.importSystem === 'string' && !result.ai.prompt.importSystem.includes(`[${category}:TOP_LEVEL]`)) result.ai.prompt.importSystem += `\n[${category}:TOP_LEVEL] > [${group}:NESTED] > [常用语:ITEM]`
  }
  return result
}

const localeSources = {
  'zh-CN': zhCN, 'zh-HK': zhHK, 'zh-TW': zhTW, en, ja, vi, ko,
  es, fr, 'pt-BR': ptBR, 'pt-PT': ptPT, ru, de, it
}

const locales = Object.fromEntries(Object.entries(localeSources).map(([code, source]) => (
  [code, buildLocale(code, source)]
)))

export const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-HK', label: '繁體中文（香港）' },
  { value: 'zh-TW', label: '繁體中文（台灣）' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'pt-PT', label: 'Português (Portugal)' },
  { value: 'ru', label: 'Русский' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' }
]

const localeCodes = new Set(Object.keys(locales))
let activeLocaleCode = 'zh-CN'
const fallbackLocale = locales['zh-CN']
let locale = fallbackLocale
let pluralRules = null

export function resolveLocale(preference = 'auto', systemLanguage) {
  if (preference !== 'auto' && localeCodes.has(preference)) return preference

  const raw = String(systemLanguage || (typeof navigator !== 'undefined' ? navigator.language : '') || 'zh-CN')
  const normalized = raw.replace(/_/g, '-').toLowerCase()
  const parts = normalized.split('-')
  if (parts[0] === 'zh') {
    if (parts.includes('hk') || parts.includes('mo')) return 'zh-HK'
    if (parts.includes('tw') || parts.includes('hant')) return 'zh-TW'
    return 'zh-CN'
  }
  if (parts[0] === 'pt') return parts.includes('br') ? 'pt-BR' : 'pt-PT'

  const base = normalized.split('-')[0]
  return localeCodes.has(base) ? base : 'zh-CN'
}

export function setLocale(localeCode) {
  const resolved = resolveLocale(localeCode)
  if (resolved === activeLocaleCode) return resolved
  activeLocaleCode = resolved
  locale = locales[resolved] || fallbackLocale
  pluralRules = null
  return resolved
}

function readValue(source, key) {
  return key.split('.').reduce((value, part) => (
    value && typeof value === 'object' && part in value ? value[part] : undefined
  ), source)
}

function resolvePlural(value, params) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || params.count == null) return value
  const exact = value[`=${params.count}`]
  if (typeof exact === 'string') return exact
  if (!pluralRules) pluralRules = new Intl.PluralRules(activeLocaleCode)
  const category = pluralRules.select(Number(params.count))
  return value[category] ?? value.other
}

export function t(key, params = {}) {
  let value = readValue(locale, key)
  if (value === undefined) value = readValue(fallbackLocale, key)
  value = resolvePlural(value, params)
  if (typeof value === 'function') return value(params)
  if (typeof value !== 'string') {
    console.warn(`[i18n] Missing or invalid translation: ${activeLocaleCode}.${key}`)
    return key
  }
  return value.replace(/\{(\w+)\}/g, (match, paramKey) => (
    Object.prototype.hasOwnProperty.call(params, paramKey) ? String(params[paramKey]) : match
  ))
}

export function translateError(error, fallbackKey = 'error.unknown') {
  if (error?.i18nKey) return t(error.i18nKey, error.i18nParams || {})
  const message = String(error?.message || error || '').trim()
  return message || t(fallbackKey)
}
