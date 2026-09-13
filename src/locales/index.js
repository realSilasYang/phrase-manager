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

// Every locale is a complete translation object with the canonical
// 分类 (top level) → 分组 (child) → 常用语 terminology.
const locales = {
  'zh-CN': zhCN, 'zh-HK': zhHK, 'zh-TW': zhTW, en, ja, vi, ko,
  es, fr, 'pt-BR': ptBR, 'pt-PT': ptPT, ru, de, it
}

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
