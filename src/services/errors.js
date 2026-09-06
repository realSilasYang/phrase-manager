// 创建带本地化键和参数的服务层错误，交由界面层统一翻译和展示。
export function serviceError(i18nKey, i18nParams = {}, cause) {
  const error = new Error(i18nKey)
  error.i18nKey = i18nKey
  error.i18nParams = i18nParams
  if (cause !== undefined) error.cause = cause
  return error
}
