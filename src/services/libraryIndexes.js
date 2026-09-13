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

  // Index only entities that can participate in the canonical graph. This
  // keeps malformed or orphan records from becoming selectable if an
  // external source briefly provides incomplete data.
  ;(categories || []).forEach(category => {
    const id = idKey(category?.编号)
    const name = String(category?.名称 ?? '').trim()
    const runtimeEntity = Boolean(category?.是否新建 || category?.是否引导演示)
    // 瞬态编辑项可能暂时没有名称，但仍需要参与父子查找，才能在
    // 输入框聚焦和取消编辑时保持完整关系。动态命令会另行排除它们。
    if (id && (name || runtimeEntity)) indexFirst(categoriesById, id, category)
  })
  ;(groups || []).forEach(group => {
    const id = idKey(group?.编号)
    const categoryId = idKey(group?.所属分类编号)
    const name = String(group?.名称 ?? '').trim()
    const runtimeEntity = Boolean(group?.是否新建 || group?.是否引导演示)
    if (!id || (!name && !runtimeEntity) || !categoryId || !categoriesById.has(categoryId)) return
    indexFirst(groupsById, id, group)
    // Use the same first entity for duplicate identifiers in every index.
    const indexedGroup = groupsById.get(id)
    if (indexedGroup === group && idKey(indexedGroup?.所属分类编号) === categoryId) append(groupsByCategory, categoryId, indexedGroup)
  })
  ;(phrases || []).forEach(phrase => {
    const id = idKey(phrase?.编号)
    const groupId = idKey(phrase?.所属分组编号)
    const title = String(phrase?.标题 ?? '').trim()
    const content = String(phrase?.内容 ?? '').trim()
    const runtimeEntity = Boolean(phrase?.是否新建 || phrase?.是否引导演示)
    if (!id || ((!title || !content) && !runtimeEntity) || !groupId || !groupsById.has(groupId)) return
    indexFirst(phrasesById, id, phrase)
    // Keep duplicate identifiers consistent across the card indexes.
    const indexedPhrase = phrasesById.get(id)
    if (indexedPhrase === phrase && idKey(indexedPhrase?.所属分组编号) === groupId) append(phrasesByGroup, groupId, indexedPhrase)
  })

  return { categoriesById, groupsById, groupsByCategory, phrasesById, phrasesByGroup }
}
