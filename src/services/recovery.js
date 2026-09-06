import { host } from './host'
import { serviceError } from './errors'
import { readAllCollections, replaceCollections } from './libraryRepository'
import {
  deserializeCollections,
  deserializeSettings,
  serializeCollections,
  serializeSettings
} from './transferSchema'
import { isValidSettings, loadSettings } from './domainSchema'

export function createRecoveryBackup() {
  const storedSettings = host.dbStorage.getItem('app_settings')
  const collections = readAllCollections()
  return {
    ...serializeCollections(collections),
    设置: isValidSettings(storedSettings) ? serializeSettings(storedSettings) : null,
    恢复时间: new Date().toISOString()
  }
}

function validateBackup(data) {
  const allowedRootKeys = new Set(['分组', '分类', '常用语', '设置', '恢复时间'])
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
    Object.keys(data).some(key => !allowedRootKeys.has(key))) {
    throw serviceError('error.recoveryInvalidShape')
  }
  const collections = deserializeCollections(data)
  if (!collections) throw serviceError('error.recoveryInvalidShape')
  const validId = value => value !== undefined && value !== null && String(value).trim() !== ''
  const validText = value => typeof value === 'string' && value.trim() !== ''
  const groupIds = new Set(collections.分组.filter(group => (
    validId(group.编号) && validText(group.名称)
  )).map(group => String(group.编号)))
  const categoryIds = new Set(collections.分类.filter(category => (
    validId(category.编号) && validText(category.名称) && groupIds.has(String(category.所属分组编号))
  )).map(category => String(category.编号)))
  const phraseIds = new Set()
  const phrasesValid = collections.常用语.every(phrase => {
    const id = String(phrase.编号 ?? '')
    if (!validId(phrase.编号) || phraseIds.has(id) || !validText(phrase.标题) ||
      !validText(phrase.内容) || !categoryIds.has(String(phrase.所属分类编号))) return false
    phraseIds.add(id)
    return true
  })
  const entitiesValid = groupIds.size === collections.分组.length &&
    categoryIds.size === collections.分类.length &&
    phrasesValid
  const rawSettings = data?.设置
  const settingsValid = rawSettings == null || isValidSettings(rawSettings)
  if (!entitiesValid || !settingsValid) throw serviceError('error.recoveryInvalidShape')
  return collections
}

function parseRecoveryBackup(content) {
  let data
  try {
    data = JSON.parse(String(content || '').replace(/^\uFEFF/, ''))
  } catch (error) {
    throw serviceError('error.jsonParseFailed', {}, error)
  }
  validateBackup(data)
  return data
}

export function decodeRecoveryBackup(buffer) {
  let content
  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch (error) {
    throw serviceError('error.invalidEncoding', {}, error)
  }
  return parseRecoveryBackup(content)
}

export function restoreRecoveryBackup(data) {
  const collections = validateBackup(data)
  const settings = deserializeSettings(data)
  const storage = host.dbStorage
  const previousSettings = settings ? storage.getItem('app_settings') : null
  let settingsWriteAttempted = false

  try {
    // 数据仓库会回滚集合写入；设置文档也必须纳入同一恢复事务，
    // 因此发生异常时要把设置恢复为写入前的值。
    if (settings) {
      settingsWriteAttempted = true
      storage.setItem('app_settings', loadSettings(settings))
    }
    replaceCollections(collections)
  } catch (error) {
    if (settingsWriteAttempted) {
      try {
        if (previousSettings == null) storage.removeItem('app_settings')
        else storage.setItem('app_settings', previousSettings)
      } catch (rollbackError) {
        console.error('[Recovery] Failed to roll back settings:', rollbackError)
      }
    }
    throw error
  }
}
