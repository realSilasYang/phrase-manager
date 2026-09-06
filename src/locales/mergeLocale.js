// 深度合并语言包的对象节点，同时保留数组和基础值的覆盖语义。
export function mergeLocale(base, overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return overrides ?? base
  const result = { ...base }
  Object.entries(overrides).forEach(([key, value]) => {
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && typeof base?.[key] === 'object'
      ? mergeLocale(base[key], value)
      : value
  })
  return result
}
