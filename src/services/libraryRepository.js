import { host } from './host'
import {
  isCanonicalEntity,
  isValidPersistedEntity,
  normalizeCollections,
  normalizeEntity,
  toPersistableCollections
} from './domainSchema'

const STORAGE_LAYOUT_VERSION = 4
const STORAGE_NAMESPACE = 'phrase-manager/v4'

const COLLECTIONS = {
  分类: { prefix: `${STORAGE_NAMESPACE}/category`, kind: 'category' },
  分组: { prefix: `${STORAGE_NAMESPACE}/group`, kind: 'group' },
  常用语: { prefix: `${STORAGE_NAMESPACE}/phrase`, kind: 'phrase' }
}

// 状态更新遵循不可变原则，未变化的实体会保留原有引用。
// 写入缓存据此只提交发生变化的文档，避免每次保存都重写完整快照。
const collectionWriteCache = new Map()

function collectionItemKey(prefix, id) {
  return `${prefix}/${encodeURIComponent(String(id))}`
}

function readCollection(collection) {
  const db = host.dbStorage
  if (!db) return []

  const storedIds = db.getItem(`${collection.prefix}/index`)
  if (!Array.isArray(storedIds)) return []

  const items = storedIds
    .map(id => {
      const stored = db.getItem(collectionItemKey(collection.prefix, id))
      if (!stored || typeof stored !== 'object') return null
      if (!isCanonicalEntity(collection.kind, stored)) return null
      const normalized = normalizeEntity(collection.kind, stored)
      return isValidPersistedEntity(collection.kind, normalized) ? normalized : null
    })
    .filter(Boolean)

  collectionWriteCache.set(collection.prefix, {
    // 保留索引中已存在但当前读取不到的编号，让下一次写入能够清理对应的过期文档。
    ids: storedIds.map(id => String(id)),
    items: new Map(items.map(item => [String(item.编号), item]))
  })
  return items
}

function createWritePlan(collection, items) {
  const db = host.dbStorage
  const validItems = (Array.isArray(items) ? items : [])
    .map(item => normalizeEntity(collection.kind, item))
    .filter(item => isValidPersistedEntity(collection.kind, item))
  const indexKey = `${collection.prefix}/index`
  const cached = collectionWriteCache.get(collection.prefix)
  const previousIds = cached?.ids || db.getItem(indexKey)
  const ids = validItems.map(item => String(item.编号))
  const nextItems = new Map(validItems.map(item => [String(item.编号), item]))
  const documents = validItems.filter(item => {
    const id = String(item.编号)
    return !cached || cached.items.get(id) !== item
  })
  const indexChanged = !Array.isArray(previousIds) ||
    previousIds.length !== ids.length ||
    previousIds.some((id, index) => String(id) !== ids[index])
  const nextIdSet = new Set(ids)
  const staleIds = Array.isArray(previousIds)
    ? previousIds.filter(id => !nextIdSet.has(String(id)))
    : []

  return { collection, documents, ids, indexKey, indexChanged, nextItems, staleIds }
}

function executeWritePlans(plans) {
  const db = host.dbStorage
  if (!db) return

  const attemptedDocuments = []
  const attemptedIndexes = []
  try {
    // 实体编号稳定时，更新会覆盖旧索引引用的文档。
    // 在整批写入提交前保留旧值，发生异常时才能按原顺序回滚。
    plans.forEach(plan => {
      plan.documents.forEach(item => {
        const key = collectionItemKey(plan.collection.prefix, item.编号)
        attemptedDocuments.push({ key, previousValue: db.getItem(key) })
        db.setItem(key, item)
      })
    })
    plans.forEach(plan => {
      if (!plan.indexChanged) return
      const previousIds = db.getItem(plan.indexKey)
      attemptedIndexes.push({ plan, previousIds })
      db.setItem(plan.indexKey, plan.ids)
    })
  } catch (error) {
    attemptedIndexes.reverse().forEach(({ plan, previousIds }) => {
      try {
        if (Array.isArray(previousIds)) db.setItem(plan.indexKey, previousIds)
        else db.removeItem(plan.indexKey)
      } catch (rollbackError) {
        console.error('[LibraryRepository] Failed to roll back collection index:', rollbackError)
      }
    })
    attemptedDocuments.reverse().forEach(({ key, previousValue }) => {
      try {
        if (previousValue == null) db.removeItem(key)
        else db.setItem(key, previousValue)
      } catch (rollbackError) {
        console.error('[LibraryRepository] Failed to roll back collection document:', rollbackError)
      }
    })
    throw error
  }
  try {
    if (db.getItem(`${STORAGE_NAMESPACE}/storage-version`) !== STORAGE_LAYOUT_VERSION) {
      db.setItem(`${STORAGE_NAMESPACE}/storage-version`, STORAGE_LAYOUT_VERSION)
    }
  } catch (error) {
    console.warn('[LibraryRepository] Failed to update storage version:', error)
  }

  // 索引提交后，旧文档已无法从当前索引访问；此处清理即使失败，
  // 也不会影响已经提交的新快照，因此按尽力而为处理。
  plans.forEach(plan => {
    plan.staleIds.forEach(id => {
      try {
        db.removeItem(collectionItemKey(plan.collection.prefix, id))
      } catch (error) {
        console.warn('[LibraryRepository] Failed to remove stale document:', error)
      }
    })
    collectionWriteCache.set(plan.collection.prefix, { ids: plan.ids, items: plan.nextItems })
  })
}

export function readAllCollections() {
  const raw = normalizeCollections({
    分类: readCollection(COLLECTIONS.分类),
    分组: readCollection(COLLECTIONS.分组),
    常用语: readCollection(COLLECTIONS.常用语)
  })
  const collections = toPersistableCollections(raw)
  const incompleteIndex = Object.values(COLLECTIONS).some(collection => {
    const cached = collectionWriteCache.get(collection.prefix)
    return cached && cached.ids.length !== cached.items.size
  })
  const repaired = incompleteIndex || collections.分类 !== raw.分类 ||
    collections.分组 !== raw.分组 || collections.常用语 !== raw.常用语
  if (repaired) {
    try {
      writeCollections(collections)
    } catch (error) {
      console.warn('[LibraryRepository] Failed to repair stored collections:', error)
    }
  }
  return collections
}

export function writeCollections(data) {
  const collections = toPersistableCollections(data)
  executeWritePlans([
    createWritePlan(COLLECTIONS.分类, collections.分类),
    createWritePlan(COLLECTIONS.分组, collections.分组),
    createWritePlan(COLLECTIONS.常用语, collections.常用语)
  ])
  return collections
}

export function replaceCollections(data) {
  collectionWriteCache.clear()
  return writeCollections(data)
}
