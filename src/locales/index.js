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

// 交换所有语言中的层级术语。内部字段仍沿用旧名称，用户界面统一显示“分类 → 分组”。
function swapHierarchyText(value, groupTerm, categoryTerm) {
  if (typeof value === 'string') {
    const protectedValues = []
    const protectedText = value.replace(/\{\w+\}/g, token => {
      protectedValues.push(token)
      return `\u0000${protectedValues.length - 1}\u0000`
    })
    const replaceTerm = (source, term, replacement) => {
      const makePlural = value => {
        if (/y$/i.test(value)) return `${value.slice(0, -1)}ies`
        if (/ía$/i.test(value)) return `${value}s`
        return `${value}s`
      }
      const plural = makePlural(term)
      const escaped = [term, plural]
        .sort((left, right) => right.length - left.length)
        .map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|')
      const boundary = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(term) ? '\\b' : ''
      const pluralReplacement = makePlural(replacement)
      return source.replace(new RegExp(`${boundary}(${escaped})${boundary}`, 'gi'), match => (
        match.toLocaleLowerCase() === plural.toLocaleLowerCase() ? pluralReplacement : replacement
      ))
    }
    const swapped = replaceTerm(
      replaceTerm(protectedText, groupTerm, '\u0001GROUP\u0001'),
      categoryTerm,
      groupTerm
    ).split('\u0001GROUP\u0001').join(categoryTerm)
    return swapped.replace(/\u0000(\d+)\u0000/g, (_, index) => protectedValues[Number(index)])
  }
  if (Array.isArray(value)) return value.map(item => swapHierarchyText(item, groupTerm, categoryTerm))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      // AI 输出字段固定使用中文键名，但提示词中的层级说明仍需反映新语义。
      key === 'prompt'
        ? Object.fromEntries(Object.entries(child).map(([promptKey, promptValue]) => [
          promptKey,
          promptKey === 'categorizeSystem' && typeof promptValue === 'string'
            ? `${promptValue}\n${categoryTerm} 为顶层，${groupTerm} 属于分类之下；返回 JSON 时使用“分类”表示顶层、“分组”表示子级。`
            : promptValue
        ]))
        : swapHierarchyText(child, groupTerm, categoryTerm)
    ]))
  }
  return value
}

function applyHierarchySemantics(code, locale) {
  if (code === 'zh-CN') {
    const prompt = locale?.ai?.prompt
    if (!prompt?.categorizeSystem) return locale
    return {
      ...locale,
      ai: {
        ...locale.ai,
        prompt: {
          ...prompt,
          categorizeSystem: `${prompt.categorizeSystem}\n分类为顶层，分组属于分类之下；返回 JSON 时使用“分类”表示顶层、“分组”表示子级。`
        }
      }
    }
  }
  const groupTerm = locale?.label?.group
  const categoryTerm = locale?.label?.category
  if (!groupTerm || !categoryTerm || groupTerm === categoryTerm) return locale
  return swapHierarchyText(locale, groupTerm, categoryTerm)
}

// 将基础语言包与跨语言共用的界面、导入和 AI 文案合并为最终语言包。
const buildLocale = (code, base) => mergeLocale(
  mergeLocale(
    mergeLocale(base, interfaceTranslations[code]),
    importHelpTranslations[code]
  ),
  aiSettingsTranslations[code]
)

const localeSources = {
  'zh-CN': zhCN, 'zh-HK': zhHK, 'zh-TW': zhTW, en, ja, vi, ko,
  es, fr, 'pt-BR': ptBR, 'pt-PT': ptPT, ru, de, it
}
const locales = Object.fromEntries(Object.entries(localeSources).map(([code, source]) => {
  const merged = buildLocale(code, source)
  return [code, applyHierarchySemantics(code, merged)]
}))

// 设置页使用的语言选项；label 是用户可见名称，value 是内部语言代码。
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

// 将“自动”或浏览器语言代码解析为项目支持的具体语言。
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
  // 切换语言时清空复数规则缓存，避免继续使用上一语言的复数分类器。
  const resolved = resolveLocale(localeCode)
  if (resolved === activeLocaleCode) return resolved
  activeLocaleCode = resolved
  locale = locales[resolved] || fallbackLocale
  pluralRules = null
  return resolved
}

function readValue(source, key) {
  // 按点号路径读取嵌套文案；任一层不存在时返回 undefined，由调用方执行回退。
  return key.split('.').reduce((value, part) => (
    value && typeof value === 'object' && part in value ? value[part] : undefined
  ), source)
}

function resolvePlural(value, params) {
  // 支持 one、other 以及“=具体数字”三种复数文案形式。
  if (!value || typeof value !== 'object' || Array.isArray(value) || params.count == null) return value
  const exact = value[`=${params.count}`]
  if (typeof exact === 'string') return exact
  if (!pluralRules) pluralRules = new Intl.PluralRules(activeLocaleCode)
  const category = pluralRules.select(Number(params.count))
  return value[category] ?? value.other
}

export function t(key, params = {}) {
  // 先查当前语言，再回退到简体中文；占位符只替换调用方明确提供的参数。
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
  // 服务层错误携带 i18nKey 时走本地化文案，否则保留原始错误消息作为诊断信息。
  if (error?.i18nKey) return t(error.i18nKey, error.i18nParams || {})
  const message = String(error?.message || error || '').trim()
  return message || t(fallbackKey)
}
