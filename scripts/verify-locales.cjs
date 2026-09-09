const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const babel = require('@babel/core')

const projectRoot = path.resolve(__dirname, '..')
const localeRoot = path.resolve(projectRoot, 'src/locales')
const sourceRoot = path.resolve(projectRoot, 'src')
const pluralCategories = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])

function fail(message) {
  throw new Error(`[locales] ${message}`)
}

// 语言包使用 ES 模块，而本审计脚本以 CommonJS 运行，因此临时接管 .js 加载器，
// 先用 Babel 转换模块格式，再执行后续校验。
const previousLoader = Module._extensions['.js']
Module._extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(`${localeRoot}${path.sep}`)) {
    previousLoader(module, filename)
    return
  }

  const source = fs.readFileSync(filename, 'utf8')
  const transformed = babel.transformSync(source, {
    filename,
    presets: [['@babel/preset-env', { modules: 'commonjs', targets: { node: 'current' } }]]
  }).code
  module._compile(transformed, filename)
}

function loadDefault(filename) {
  const module = require(path.join(localeRoot, filename))
  if (!module || !module.default) fail(`${filename} must export a default locale object`)
  return module.default
}

const localeIndex = require(path.join(localeRoot, 'index.js'))
const localeCodes = localeIndex.LANGUAGE_OPTIONS.map(option => option.value)
if (new Set(localeCodes).size !== localeCodes.length || localeCodes.length === 0) {
  fail('LANGUAGE_OPTIONS must contain unique supported locale codes')
}

function mergeLocale(base, overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return overrides ?? base
  const result = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && typeof base?.[key] === 'object'
      ? mergeLocale(base[key], value)
      : value
  }
  return result
}

const rawLocales = Object.fromEntries(localeCodes.map(code => [code, loadDefault(`${code}.js`)]))
const interfaceTranslations = loadDefault('interfaceTranslations.js')
const importHelpTranslations = loadDefault('importHelpTranslations.js')
const aiSettingsTranslations = loadDefault('aiSettingsTranslations.js')
const locales = Object.fromEntries(localeCodes.map(code => [
  code,
  mergeLocale(
    mergeLocale(
      mergeLocale(rawLocales[code], interfaceTranslations[code]),
      importHelpTranslations[code]
    ),
    aiSettingsTranslations[code]
  )
]))

function isPluralObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every(key => pluralCategories.has(key))
}

function collectSemanticValues(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (isPluralObject(child)) result[fullKey] = Object.values(child)
    else if (child && typeof child === 'object' && !Array.isArray(child)) {
      collectSemanticValues(child, fullKey, result)
    } else result[fullKey] = [child]
  }
  return result
}

function readValue(source, key) {
  return key.split('.').reduce((value, part) => (
    value && typeof value === 'object' && part in value ? value[part] : undefined
  ), source)
}

function placeholderSet(values) {
  return new Set(values.flatMap(value => (
    typeof value === 'string' ? [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]) : []
  )))
}

const semanticLocales = Object.fromEntries(localeCodes.map(code => [
  code,
  collectSemanticValues(locales[code])
]))
const expectedKeys = new Set(Object.keys(semanticLocales['zh-CN']))

for (const code of localeCodes) {
  const values = semanticLocales[code]
  const missing = [...expectedKeys].filter(key => !(key in values))
  const extra = Object.keys(values).filter(key => !expectedKeys.has(key))
  if (missing.length || extra.length) {
    fail(`${code} key coverage mismatch; missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`)
  }

  for (const [key, entries] of Object.entries(values)) {
    const rawValue = readValue(locales[code], key)
    if (entries.some(value => typeof value !== 'string' || !value.trim())) {
      fail(`${code}.${key} contains an empty or non-string translation`)
    }
    if (isPluralObject(rawValue) && typeof rawValue.other !== 'string') {
      fail(`${code}.${key} plural translation is missing the other form`)
    }
  }
}

const referenceValues = semanticLocales['zh-CN']
for (const code of localeCodes) {
  for (const key of expectedKeys) {
    const expected = placeholderSet(referenceValues[key])
    const actual = placeholderSet(semanticLocales[code][key])
    const missing = [...expected].filter(token => !actual.has(token))
    const extra = [...actual].filter(token => !expected.has(token))
    if (missing.length || extra.length) {
      fail(`${code}.${key} placeholder mismatch; missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`)
    }
  }
}

const sourceFiles = []
function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) collectSourceFiles(absolutePath)
    else if (entry.name.endsWith('.js') && !absolutePath.startsWith(`${localeRoot}${path.sep}`)) sourceFiles.push(absolutePath)
  }
}
collectSourceFiles(sourceRoot)

const staticTranslationKeys = new Set()
const translationCall = /\bt\s*\(\s*(['"])([^'"\\]*(?:\\.[^'"\\]*)*)\1/g
for (const filename of sourceFiles) {
  const source = fs.readFileSync(filename, 'utf8')
  for (const match of source.matchAll(translationCall)) {
    staticTranslationKeys.add(match[2].replace(/\\(['"])/g, '$1'))
  }
}

for (const code of localeCodes) {
  const missingCalls = [...staticTranslationKeys].filter(key => readValue(locales[code], key) === undefined)
  if (missingCalls.length) fail(`${code} is missing translations used by t(): ${missingCalls.join(', ')}`)
}

// 运行时层级审计：语言包的内部键名仍保留历史命名，但用户可见语义必须始终是
// 分类（顶层）→ 分组（子级）。这些检查直接调用最终 t()，覆盖了交换和语言专属语法修复。
const hierarchyRuntimeKeys = [
  'snackbar.categoryCreated', 'snackbar.groupCreated', 'snackbar.importApplied',
  'guide.steps.step1Title', 'guide.steps.step2Title', 'guide.steps.step1Message', 'guide.steps.step2Message',
  'help.featureDragDesc', 'help.featureSearchDesc', 'ai.categoryNotFound', 'ai.groupNotFound'
]
const malformedHierarchyPatterns = {
  es: /\b(?:una Grupo|un Categoría|la Grupo|el Categoría|Grupo (?:eliminada|creada)|Categoría (?:eliminado|creado))\b/i,
  fr: /\b(?:une Groupe|un Catégorie|la Groupe|le Catégorie|Groupe (?:supprimée|créée)|Catégorie (?:supprimé|créé(?!e)))/i,
  'pt-BR': /\b(?:um Categoria|uma Grupo|novo Categoria|nova Grupo|Grupo (?:excluída|criada)|Categoria (?:excluído|criado))\b/i,
  'pt-PT': /\b(?:um Categoria|uma Grupo|novo Categoria|nova Grupo|Grupo (?:eliminada|criada)|Categoria (?:eliminado|criado))\b/i,
  it: /\b(?:un Categoria|una Gruppo|nuovo Categoria|nuova Gruppo|Gruppo (?:eliminata|creata)|Categoria (?:eliminato|creato))\b/i,
  ko: /카테고리(?:이|을|으로)|그룹(?:가|를|로)/,
}
for (const code of localeCodes) {
  localeIndex.setLocale(code)
  const top = localeIndex.t('label.group')
  const nested = localeIndex.t('label.category')
  const containsTermStem = (text, term) => {
    const normalize = value => String(value).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const stemLength = Math.min(normalize(term).length, Math.max(2, Math.ceil(normalize(term).length * 0.6)))
    return normalize(text).includes(normalize(term).slice(0, stemLength))
  }
  if (!top || !nested || top === nested) fail(`${code} has invalid hierarchy labels`)
  if (localeIndex.t('dynamic.group') !== top || localeIndex.t('dynamic.category') !== nested) {
    fail(`${code} dynamic command labels do not match the category-first hierarchy`)
  }
  if (!localeIndex.t('importPreview.groups') || !localeIndex.t('importPreview.categories')) {
    fail(`${code} import preview labels are empty`)
  }
  if (!containsTermStem(localeIndex.t('guide.steps.step1Title'), top) || !containsTermStem(localeIndex.t('guide.steps.step2Title'), nested)) {
    fail(`${code} onboarding titles do not describe the category-first hierarchy`)
  }
  const malformedPattern = malformedHierarchyPatterns[code]
  if (malformedPattern) {
    for (const key of hierarchyRuntimeKeys) {
      const value = localeIndex.t(key, { count: 2, groups: 2, categories: 2, phrases: 3, error: 'x' })
      if (malformedPattern.test(value)) fail(`${code}.${key} contains malformed hierarchy grammar: ${value}`)
    }
  }
}

console.log(`Locale verification passed: ${localeCodes.length} locales, ${expectedKeys.size} semantic keys, ${staticTranslationKeys.size} static t() calls`)
