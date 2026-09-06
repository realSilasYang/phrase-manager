/**
 * 常用语排序辅助函数
 * @param {Object} a - 第一个常用语对象
 * @param {Object} b - 第二个常用语对象
 * @param {string} sortType - 排序类型
 * @returns {number} 排序比较结果
 */
export function sortPhrases(a, b, sortType) {
    switch (sortType) {
        case 'usage-desc':
            return (b.使用次数 || 0) - (a.使用次数 || 0)
        case 'usage-asc':
            return (a.使用次数 || 0) - (b.使用次数 || 0)
        case 'created-desc':
            return (b.创建时间 || 0) - (a.创建时间 || 0)
        case 'created-asc':
            return (a.创建时间 || 0) - (b.创建时间 || 0)
        case 'updated-desc':
            return (b.更新时间 || 0) - (a.更新时间 || 0)
        case 'updated-asc':
            return (a.更新时间 || 0) - (b.更新时间 || 0)
        case 'title-asc':
            return String(a.标题 || '').localeCompare(String(b.标题 || ''), 'zh')
        case 'title-desc':
            return String(b.标题 || '').localeCompare(String(a.标题 || ''), 'zh')
        default: // 未知类型按自定义顺序处理。
            return (a.排序 || 0) - (b.排序 || 0)
    }
}
