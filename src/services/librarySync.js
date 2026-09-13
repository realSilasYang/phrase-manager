import { normalizeCollections, sanitizeCollections } from './domainSchema'

// 按“基线—本地—远端”三方快照合并云端数据，保留本地未提交的修改。
function entitiesEqual(left, right) {
  // 对象字段和值都相同才视为未发生变化；引用不同不影响判断。
  if (left === right) return true
  if (!left || !right) return false
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  return leftKeys.length === rightKeys.length && leftKeys.every(key => left[key] === right[key])
}

function reconcileCollection(baseItems, localItems, remoteItems, protectedIds = new Set()) {
  // 先以远端为基础，再根据本地相对基线的变化覆盖或删除对应实体。
  const baseById = new Map(baseItems.map(item => [String(item.编号), item]))
  const localById = new Map(localItems.map(item => [String(item.编号), item]))
  const resolvedById = new Map(remoteItems.map(item => [String(item.编号), item]))

  baseById.forEach((baseItem, id) => {
    const localItem = localById.get(id)
    if (!localItem) {
      resolvedById.delete(id)
    } else if (!entitiesEqual(localItem, baseItem) || (protectedIds.has(id) && !resolvedById.has(id))) {
      resolvedById.set(id, localItem)
    }
  })
  localById.forEach((localItem, id) => {
    if (!baseById.has(id)) resolvedById.set(id, localItem)
  })

  const localIds = new Set(localById.keys())
  return [
    ...localItems.map(item => resolvedById.get(String(item.编号))).filter(Boolean),
    ...remoteItems.filter(item => !localIds.has(String(item.编号)) && resolvedById.has(String(item.编号)))
  ]
}

export function reconcilePendingCollections(base, local, remote, { protectedPhraseIds = new Set() } = {}) {
  // 先统一三份输入的数据格式，再按分类、分组、常用语顺序合并，最后补齐关联父项。
  const normalizedBase = normalizeCollections(base)
  const normalizedLocal = normalizeCollections(local)
  const normalizedRemote = normalizeCollections(remote)
  const categories = reconcileCollection(normalizedBase.分类, normalizedLocal.分类, normalizedRemote.分类)
  const groups = reconcileCollection(normalizedBase.分组, normalizedLocal.分组, normalizedRemote.分组)
  const phrases = reconcileCollection(
      normalizedBase.常用语,
      normalizedLocal.常用语,
      normalizedRemote.常用语,
      new Set([...protectedPhraseIds].map(String))
    )

  const categoryById = new Map(categories.map(category => [String(category.编号), category]))
  const localCategoryById = new Map(normalizedLocal.分类.map(category => [String(category.编号), category]))
  const groupById = new Map(groups.map(group => [String(group.编号), group]))
  const localGroupById = new Map(normalizedLocal.分组.map(group => [String(group.编号), group]))

  const ensureCategory = categoryId => {
    const id = String(categoryId)
    if (categoryById.has(id)) return
    const localCategory = localCategoryById.get(id)
    if (localCategory) {
      categories.push(localCategory)
      categoryById.set(id, localCategory)
    }
  }
  groups.forEach(group => ensureCategory(group.所属分类编号))
  phrases.forEach(phrase => {
    const groupId = String(phrase.所属分组编号)
    if (!groupById.has(groupId)) {
      const localGroup = localGroupById.get(groupId)
      if (localGroup) {
        groups.push(localGroup)
        groupById.set(groupId, localGroup)
      }
    }
    const group = groupById.get(groupId)
    if (group) ensureCategory(group.所属分类编号)
  })

  // 云端快照可能在不同设备上同时发生父级删除。最终统一从分类向下收紧，
  // 丢弃不存在父级的分组和常用语，避免孤儿节点进入运行态。
  // 本地集合可能包含尚未落盘的新建分类、分组或常用语；同步结果保留
  // 这些瞬态节点，并继续清理缺失父级的孤儿节点。
  return sanitizeCollections({ 分类: categories, 分组: groups, 常用语: phrases }, { allowTransient: true })
}
