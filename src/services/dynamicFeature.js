function idKey(value) { return String(value ?? '').trim() }

function canonicalCommandEntities(categories, groups, phrases) {
  const categoryIds = new Set()
  const groupIds = new Set()
  const phraseIds = new Set()
  const validCategories = []
  const validGroups = []
  const validPhrases = []

  ;(categories || []).forEach(category => {
    const id = idKey(category?.编号)
    const name = String(category?.名称 ?? '').trim()
    if (!id || !name || category?.是否新建 || category?.是否引导演示 || categoryIds.has(id)) return
    categoryIds.add(id)
    validCategories.push(category)
  })
  ;(groups || []).forEach(group => {
    const id = idKey(group?.编号)
    const categoryId = idKey(group?.所属分类编号)
    const name = String(group?.名称 ?? '').trim()
    if (!id || !name || group?.是否新建 || group?.是否引导演示 || !categoryId || !categoryIds.has(categoryId) || groupIds.has(id)) return
    groupIds.add(id)
    validGroups.push(group)
  })
  ;(phrases || []).forEach(phrase => {
    const id = idKey(phrase?.编号)
    const groupId = idKey(phrase?.所属分组编号)
    const name = String(phrase?.标题 ?? '').trim()
    const content = String(phrase?.内容 ?? '').trim()
    if (!id || !name || !content || phrase?.是否新建 || phrase?.是否引导演示 || !groupId || !groupIds.has(groupId) || phraseIds.has(id)) return
    phraseIds.add(id)
    validPhrases.push(phrase)
  })
  return { categories: validCategories, groups: validGroups, phrases: validPhrases }
}

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
  const valid = canonicalCommandEntities(categories, groups, phrases)
  valid.categories.forEach(item => append(entries, 'category', `[${labels.category}] `, item))
  valid.groups.forEach(item => append(entries, 'group', `[${labels.group}] `, item))
  valid.phrases.forEach(item => append(entries, 'phrase', `[${labels.phrase}] `, item))
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
  const valid = canonicalCommandEntities(categories, groups, phrases)
  valid.categories.forEach(item => add('c', item))
  valid.groups.forEach(item => add('g', item))
  valid.phrases.forEach(item => add('p', item))
  return `${count}:${hash >>> 0}`
}
