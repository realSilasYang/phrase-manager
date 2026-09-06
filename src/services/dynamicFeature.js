function createDynamicCommandEntries(groups, categories, phrases, labels) {
  const usedCommands = new Set()
  const append = (entries, type, prefix, item) => {
    const name = String(item.名称 ?? item.标题 ?? '').trim()
    if (!name) return
    const base = `${prefix}${name}`
    let command = base
    let suffix = 2
    while (usedCommands.has(command)) command = `${base} #${suffix++}`
    usedCommands.add(command)
    entries.push({ command, type, id: String(item.编号), name })
  }
  const entries = []
  groups.forEach(item => append(entries, 'group', `[${labels.group}] `, item))
  categories.forEach(item => append(entries, 'category', `[${labels.category}] `, item))
  phrases.forEach(item => append(entries, 'phrase', `[${labels.phrase}] `, item))
  return entries
}

export function createDynamicCommands(groups, categories, phrases, labels) {
  return createDynamicCommandEntries(groups, categories, phrases, labels).map(entry => entry.command)
}

export function resolveDynamicCommand(targetName, groups, categories, phrases, labels) {
  const target = String(targetName || '').trim()
  const exact = createDynamicCommandEntries(groups, categories, phrases, labels)
    .find(entry => entry.command === target)
  if (exact) return exact

  // 在 uTools 刷新动态功能列表前，继续兼容旧版本生成的命令。
  // 新命令不再附加容易产生歧义的后缀，避免同名条目互相覆盖。
  const legacy = parseDynamicCommandTarget(target, labels)
  const sources = legacy.type
    ? [[legacy.type, legacy.type === 'group' ? groups : legacy.type === 'category' ? categories : phrases]]
    : [['phrase', phrases], ['category', categories], ['group', groups]]
  for (const [type, source] of sources) {
    const item = source.filter(candidate => String(candidate.名称 ?? candidate.标题 ?? '').trim() === legacy.name)[legacy.index]
    if (item) return { type, id: String(item.编号), name: legacy.name }
  }
  return null
}

export function parseDynamicCommandTarget(targetName, labels) {
  const types = [
    { type: 'group', prefix: `[${labels.group}] ` },
    { type: 'category', prefix: `[${labels.category}] ` },
    { type: 'phrase', prefix: `[${labels.phrase}] ` }
  ]
  const matchedType = types.find(item => targetName.startsWith(item.prefix))
  const rawName = matchedType ? targetName.slice(matchedType.prefix.length) : targetName
  const duplicateSuffix = /^(.*?)(?:\s+#(\d+))?$/.exec(rawName)
  return {
    type: matchedType?.type || null,
    name: duplicateSuffix?.[1] || rawName,
    index: Math.max(0, Number(duplicateSuffix?.[2] || 1) - 1)
  }
}

export function createDynamicCommandSignature(groups, categories, phrases) {
  let hash = 2166136261
  let count = 0
  const add = (prefix, item) => {
    const name = String(item.名称 ?? item.标题 ?? '').trim()
    if (!name) return
    const value = `${prefix}\u0001${String(item.编号 ?? '')}\u0001${name}\u0001${count}`
    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
    count++
  }
  groups.forEach(item => add('g', item))
  categories.forEach(item => add('c', item))
  phrases.forEach(item => add('p', item))
  return `${count}:${hash >>> 0}`
}
