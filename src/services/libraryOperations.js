// Pure functions for phrase editing and canonical category/group selection.
export function applyUsageIncrements(items, increments, now = Date.now()) {
  return items.map(phrase => {
    const increment = increments.get(phrase.编号)
    return increment ? { ...phrase, 使用次数: (Number(phrase.使用次数) || 0) + increment, 更新时间: now } : phrase
  })
}

export function phraseEditFieldsEqual(left, right) {
  if (!left || !right) return false
  return String(left.标题 ?? '') === String(right.标题 ?? '') &&
    String(left.内容 ?? '') === String(right.内容 ?? '') &&
    String(left.所属分组编号 ?? '') === String(right.所属分组编号 ?? '')
}

export function preparePhraseForSave(original, draft, now = Date.now()) {
  const content = String(draft.内容 ?? '').trim()
  let title = String(draft.标题 ?? '').trim()
  if (original?.是否新建 && title === String(original.标题 ?? '').trim() && content) {
    title = content.length > 10 ? `${content.slice(0, 10)}...` : content
  }
  const savedPhrase = { ...original, 标题: title, 内容: content, 所属分组编号: draft.所属分组编号, 更新时间: now }
  delete savedPhrase.是否新建
  return savedPhrase
}

export function resolveLibrarySelection(categories, groups, preferredCategoryId, preferredGroupId) {
  const orderedCategories = [...(categories || [])]
    .sort((left, right) => (Number(left.排序) || 0) - (Number(right.排序) || 0))
  const preferredCategory = preferredCategoryId == null
    ? null
    : orderedCategories.find(category => String(category.编号) === String(preferredCategoryId))
  const selectedCategory = preferredCategory || orderedCategories[0] || null
  if (!selectedCategory) return { categoryId: null, groupId: null }

  const orderedGroups = [...(groups || [])]
    .filter(group => String(group.所属分类编号) === String(selectedCategory.编号))
    .sort((left, right) => (Number(left.排序) || 0) - (Number(right.排序) || 0))
  const preferredGroup = preferredGroupId == null
    ? null
    : orderedGroups.find(group => String(group.编号) === String(preferredGroupId))
  return { categoryId: selectedCategory.编号, groupId: (preferredGroup || orderedGroups[0] || null)?.编号 ?? null }
}
