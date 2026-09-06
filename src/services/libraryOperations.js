// 常用语编辑和选中状态相关的纯函数；不直接读写 React 状态或宿主存储。
export function applyUsageIncrements(items, increments, now = Date.now()) {
  // 将待提交的使用次数增量一次性合并，并用同一时间戳标记更新时间。
  return items.map(phrase => {
    const increment = increments.get(phrase.编号)
    return increment ? {
      ...phrase,
      使用次数: (Number(phrase.使用次数) || 0) + increment,
      更新时间: now
    } : phrase
  })
}

export function phraseEditFieldsEqual(left, right) {
  // 只比较会影响常用语内容的字段，忽略编号、创建时间等元数据。
  if (!left || !right) return false
  return String(left.标题 ?? '') === String(right.标题 ?? '') &&
    String(left.内容 ?? '') === String(right.内容 ?? '') &&
    String(left.所属分类编号 ?? '') === String(right.所属分类编号 ?? '')
}

export function preparePhraseForSave(original, draft, now = Date.now()) {
  // 清理编辑草稿并生成可持久化对象；新建条目未填写标题时使用内容摘要作为标题。
  const content = String(draft.内容 ?? '').trim()
  let title = String(draft.标题 ?? '').trim()
  if (original?.是否新建 && title === String(original.标题 ?? '').trim() && content) {
    title = content.length > 10 ? `${content.slice(0, 10)}...` : content
  }

  const savedPhrase = {
    ...original,
    标题: title,
    内容: content,
    所属分类编号: draft.所属分类编号,
    更新时间: now
  }
  delete savedPhrase.是否新建
  return savedPhrase
}

export function resolveLibrarySelection(groups, categories, preferredGroupId, preferredCategoryId) {
  // 优先恢复用户上次选中的分组和分类；目标不存在时按排序后的第一项回退。
  const orderedGroups = [...(groups || [])]
    .sort((left, right) => (Number(left.排序) || 0) - (Number(right.排序) || 0))
  const preferredGroup = preferredGroupId == null
    ? null
    : orderedGroups.find(group => String(group.编号) === String(preferredGroupId))
  const selectedGroup = preferredGroup || orderedGroups[0] || null
  if (!selectedGroup) return { 所属分组编号: null, 所属分类编号: null }

  const orderedCategories = [...(categories || [])]
    .filter(category => String(category.所属分组编号) === String(selectedGroup.编号))
    .sort((left, right) => (Number(left.排序) || 0) - (Number(right.排序) || 0))
  const preferredCategory = preferredCategoryId == null
    ? null
    : orderedCategories.find(category => String(category.编号) === String(preferredCategoryId))

  return {
    所属分组编号: selectedGroup.编号,
    所属分类编号: (preferredCategory || orderedCategories[0] || null)?.编号 ?? null
  }
}
