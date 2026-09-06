// 字体处理工具：校验用户设置、生成 CSS 字体栈，并规范化宿主返回的本机字体列表。
export const DEFAULT_INTERFACE_FONT = 'system-ui'
export const DEFAULT_CONTENT_FONT = 'LXGW WenKai'

const FALLBACK_FONT_FAMILIES = [
  'PingFang SC',
  'Microsoft YaHei',
  'cursive',
  'sans-serif'
]

const GENERIC_FONT_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
  'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded',
  'emoji', 'math', 'fangsong'
])

function normalizeFont(value, fallback) {
  // 限制字体名称长度并拒绝控制字符，避免用户输入破坏 CSS 声明。
  if (typeof value !== 'string') return fallback
  const font = value.trim()
  if (!font || font.length > 120 || /[\u0000-\u001f\u007f]/.test(font)) {
    return fallback
  }
  return font
}

export function normalizeInterfaceFont(value) {
  return normalizeFont(value, DEFAULT_INTERFACE_FONT)
}

export function normalizeContentFont(value) {
  return normalizeFont(value, DEFAULT_CONTENT_FONT)
}

export function quoteFontFamily(value) {
  // 通用字体族无需引号，其他名称统一转义反斜杠和双引号。
  const font = normalizeInterfaceFont(value)
  if (GENERIC_FONT_FAMILIES.has(font.toLowerCase())) return font
  return `"${font.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function createFontStack(value, normalizer) {
  // 将用户选择的字体放在首位，再追加稳定的中文和通用字体回退项，并去重。
  const selectedFont = normalizer(value)
  const seen = new Set([selectedFont.toLocaleLowerCase()])
  const families = [quoteFontFamily(selectedFont)]

  FALLBACK_FONT_FAMILIES.forEach(font => {
    const key = font.toLocaleLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    families.push(quoteFontFamily(font))
  })

  return families.join(', ')
}

export function createInterfaceFontStack(value) {
  return createFontStack(value, normalizeInterfaceFont)
}

export function createContentFontStack(value) {
  return createFontStack(value, normalizeContentFont)
}

export function normalizeLocalFontFamilies(fonts, locale, requiredFonts = [], defaultFont = DEFAULT_INTERFACE_FONT) {
  // 默认字体和业务要求的字体固定排在前面，其余本机字体按当前语言排序。
  const uniqueFonts = new Map()
  const addFont = value => {
    const candidate = typeof value === 'string' ? value : value?.family
    if (typeof candidate !== 'string') return
    const font = candidate.trim()
    if (!font || font.length > 120 || /[\u0000-\u001f\u007f]/.test(font)) return
    const key = font.toLocaleLowerCase()
    if (!uniqueFonts.has(key)) uniqueFonts.set(key, font)
  }

  addFont(defaultFont)
  requiredFonts.forEach(addFont)
  if (Array.isArray(fonts)) fonts.forEach(addFont)

  const collator = new Intl.Collator(locale || undefined, { sensitivity: 'base', numeric: true })
  const defaultKey = defaultFont.toLocaleLowerCase()
  const pinnedKeys = new Set([defaultKey])
  const pinnedFonts = [defaultFont]
  requiredFonts.forEach(value => {
    const font = typeof value === 'string' ? value.trim() : value?.family?.trim()
    if (!font) return
    const key = font.toLocaleLowerCase()
    if (pinnedKeys.has(key) || !uniqueFonts.has(key)) return
    pinnedKeys.add(key)
    pinnedFonts.push(uniqueFonts.get(key))
  })
  const sortedFonts = Array.from(uniqueFonts.entries())
    .filter(([key]) => !pinnedKeys.has(key))
    .map(([, font]) => font)
    .sort(collator.compare)
  return [...pinnedFonts, ...sortedFonts]
}
