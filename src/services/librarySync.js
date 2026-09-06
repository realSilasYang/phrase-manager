import { normalizeCollections } from './domainSchema'

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
  // 先统一三份输入的数据格式，再按分组、分类、常用语顺序合并，最后补齐关联父项。
  const normalizedBase = normalizeCollections(base)
  const normalizedLocal = normalizeCollections(local)
  const normalizedRemote = normalizeCollections(remote)
  const groups = reconcileCollection(normalizedBase.分组, normalizedLocal.分组, normalizedRemote.分组)
  const categories = reconcileCollection(normalizedBase.分类, normalizedLocal.分类, normalizedRemote.分类)
  const phrases = reconcileCollection(
      normalizedBase.常用语,
      normalizedLocal.常用语,
      normalizedRemote.常用语,
      new Set([...protectedPhraseIds].map(String))
    )

  const groupById = new Map(groups.map(group => [String(group.编号), group]))
  const localGroupById = new Map(normalizedLocal.分组.map(group => [String(group.编号), group]))
  const categoryById = new Map(categories.map(category => [String(category.编号), category]))
  const localCategoryById = new Map(normalizedLocal.分类.map(category => [String(category.编号), category]))

  const ensureGroup = groupId => {
    const id = String(groupId)
    if (groupById.has(id)) return
    const localGroup = localGroupById.get(id)
    if (localGroup) {
      groups.push(localGroup)
      groupById.set(id, localGroup)
    }
  }
  categories.forEach(category => ensureGroup(category.所属分组编号))
  phrases.forEach(phrase => {
    const categoryId = String(phrase.所属分类编号)
    if (!categoryById.has(categoryId)) {
      const localCategory = localCategoryById.get(categoryId)
      if (localCategory) {
        categories.push(localCategory)
        categoryById.set(categoryId, localCategory)
      }
    }
    const category = categoryById.get(categoryId)
    if (category) ensureGroup(category.所属分组编号)
  })

  return normalizeCollections({ 分组: groups, 分类: categories, 常用语: phrases })
}
