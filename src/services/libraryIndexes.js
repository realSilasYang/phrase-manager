// 为分组、分类和常用语建立按编号及归属关系索引，减少渲染和拖拽过程中的重复遍历。
function append(index, key, value) {
  // 一对多索引按需创建数组，避免为没有子项的键预先分配空间。
  const items = index.get(key)
  if (items) items.push(value)
  else index.set(key, [value])
}

function indexFirst(index, key, value) {
  // 编号重复时保留第一条记录，保证索引结果与规范化数据的顺序一致。
  if (!index.has(key)) index.set(key, value)
}

export function buildLibraryIndexes(parentCategories, categories, phrases) {
  // 同时构建五类索引：分组、分类按编号查找，子项按父级归属聚合。
  const parentCategoriesById = new Map()
  const categoriesById = new Map()
  const categoriesByGroup = new Map()
  const phrasesById = new Map()
  const phrasesByCategory = new Map()

  parentCategories.forEach(group => indexFirst(parentCategoriesById, group.编号, group))
  categories.forEach(category => {
    indexFirst(categoriesById, category.编号, category)
    append(categoriesByGroup, category.所属分组编号, category)
  })
  phrases.forEach(phrase => {
    indexFirst(phrasesById, phrase.编号, phrase)
    append(phrasesByCategory, phrase.所属分类编号, phrase)
  })

  return {
    parentCategoriesById,
    categoriesById,
    categoriesByGroup,
    phrasesById,
    phrasesByCategory
  }
}
