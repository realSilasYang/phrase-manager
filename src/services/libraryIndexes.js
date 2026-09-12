// Build indexes for the canonical hierarchy: 分类 → 分组 → 常用语。
function append(index, key, value) {
  const items = index.get(key)
  if (items) items.push(value)
  else index.set(key, [value])
}

function indexFirst(index, key, value) {
  if (!index.has(key)) index.set(key, value)
}

function idKey(value) { return String(value ?? '').trim() }

export function buildLibraryIndexes(categories, groups, phrases) {
  const categoriesById = new Map()
  const groupsById = new Map()
  const groupsByCategory = new Map()
  const phrasesById = new Map()
  const phrasesByGroup = new Map()

  ;(categories || []).forEach(category => indexFirst(categoriesById, idKey(category.编号), category))
  ;(groups || []).forEach(group => {
    indexFirst(groupsById, idKey(group.编号), group)
    append(groupsByCategory, idKey(group.所属分类编号), group)
  })
  ;(phrases || []).forEach(phrase => {
    indexFirst(phrasesById, idKey(phrase.编号), phrase)
    append(phrasesByGroup, idKey(phrase.所属分组编号), phrase)
  })

  return { categoriesById, groupsById, groupsByCategory, phrasesById, phrasesByGroup }
}
