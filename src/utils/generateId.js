/**
 * 生成唯一ID
 * 使用时间戳+随机数组合，确保在单机环境下唯一
 * @returns {string} 唯一标识符
 */
export function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
