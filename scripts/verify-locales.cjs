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

console.log(`Locale verification passed: ${localeCodes.length} locales, ${expectedKeys.size} semantic keys, ${staticTranslationKeys.size} static t() calls`)
