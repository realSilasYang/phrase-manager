function createDynamicCommandEntries(categories, groups, phrases, labels) {
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
  categories.forEach(item => append(entries, 'category', `[${labels.category}] `, item))
  groups.forEach(item => append(entries, 'group', `[${labels.group}] `, item))
  phrases.forEach(item => append(entries, 'phrase', `[${labels.phrase}] `, item))
  return entries
}

export function createDynamicCommands(categories, groups, phrases, labels) {
  return createDynamicCommandEntries(categories, groups, phrases, labels).map(entry => entry.command)
}

export function resolveDynamicCommand(targetName, categories, groups, phrases, labels) {
  const target = String(targetName || '').trim()
  return createDynamicCommandEntries(categories, groups, phrases, labels)
    .find(entry => entry.command === target) || null
}

export function createDynamicCommandSignature(categories, groups, phrases) {
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
  categories.forEach(item => add('c', item))
  groups.forEach(item => add('g', item))
  phrases.forEach(item => add('p', item))
  return `${count}:${hash >>> 0}`
}
