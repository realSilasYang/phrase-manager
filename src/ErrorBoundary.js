import React from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import { t, translateError } from './locales'
import { getHostDiagnostics, host } from './services/host'
import { createRecoveryBackup, decodeRecoveryBackup, restoreRecoveryBackup } from './services/recovery'

// 全局错误卡片使用固定容器，避免多个错误事件分别创建整套浮层。
const GLOBAL_ERROR_ID = 'global-error-' + Date.now()

// 将错误名称和消息转换为稳定编号，用于合并重复错误提示。
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'error-' + (hash >>> 0);
}

function showGlobalError(err, type) {
  // 非 Error 值也要转换为可读消息；序列化失败时退回 String，保证错误处理本身不会再次抛错。
  let fallbackMessage = ''
  try {
    fallbackMessage = typeof err === 'string' ? err : JSON.stringify(err)
  } catch {
    fallbackMessage = String(err)
  }
  const normalized = err instanceof Error ? err : new Error(fallbackMessage)
  if (!normalized.message) return
  const errorId = hashString((normalized.name || 'Error') + ':' + normalized.message)
  let cardEl = document.getElementById(errorId)
  if (cardEl) {
    let countEl = cardEl.querySelector('.global-error-count')
    if (!countEl) {
      countEl = document.createElement('span')
      countEl.className = 'global-error-count'
      countEl.textContent = '2'
      cardEl.querySelector('.global-error-title')?.prepend(countEl)
    } else {
      countEl.textContent = String(parseInt(countEl.textContent) + 1)
    }
    return
  }
  let containerEl = document.getElementById(GLOBAL_ERROR_ID)
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.id = GLOBAL_ERROR_ID
    containerEl.className = 'global-error'
    document.body.appendChild(containerEl)
  }
  const title = (type === 'global' ? t('error.uncaught'): (type === 'promise' ? t('error.unhandledPromise') : ''))
  const stack = normalized.stack?.replace(/file:\/\/\/.*?([^\/\\]+:\d+:\d+)/g, '$1') || normalized.message
  cardEl = document.createElement('div')
  cardEl.id = errorId
  cardEl.className = 'global-error-card'
  const titleEl = document.createElement('div')
  titleEl.className = 'global-error-title'
  titleEl.textContent = title
  const stackEl = document.createElement('pre')
  stackEl.className = 'global-error-stack'
  stackEl.textContent = stack
  const closeBtnEl = document.createElement('button')
  closeBtnEl.className = 'global-error-btn'
  closeBtnEl.textContent = t('common.close')
  closeBtnEl.onclick = () => { if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl) }
  const copyBtnEl = document.createElement('button')
  copyBtnEl.className = 'global-error-btn'
  copyBtnEl.textContent = t('common.copy')
  copyBtnEl.onclick = () => { host.copyText(title + '\n' + stack) }
  const headerEl = document.createElement('div')
  headerEl.className = 'global-error-header'
  const actionsEl = document.createElement('div')
  actionsEl.className = 'global-error-actions'
  actionsEl.appendChild(copyBtnEl)
  actionsEl.appendChild(closeBtnEl)
  headerEl.appendChild(titleEl)
  headerEl.appendChild(actionsEl)
  cardEl.appendChild(headerEl)
  if (stackEl) cardEl.appendChild(stackEl)
  containerEl.appendChild(cardEl)
}

export default class ErrorBoundary extends React.Component {
  state = {
    error: null,
    actionError: ''
  }

  static getDerivedStateFromError(error) {
    // 清理堆栈中的本地文件前缀，避免诊断信息带出无关的绝对路径。
    if (error && error.stack) {
      error.stack = error.stack.replace(/file:\/\/\/.*?([^\/\\]+:\d+:\d+)/g, '$1')
    }
    return { error }
  }

  componentDidMount () {
    // 监听渲染树之外的脚本错误和未处理的 Promise 拒绝，并复用统一错误浮层。
    this.handleWindowError = event => {
      if (event.error) showGlobalError(event.error, 'global')
    }
    this.handleUnhandledRejection = event => {
      if (event.reason) showGlobalError(event.reason, 'promise')
    }
    window.addEventListener('error', this.handleWindowError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentWillUnmount () {
    // 组件卸载时移除全局监听器，防止热更新或重新挂载造成重复提示。
    window.removeEventListener('error', this.handleWindowError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  handleCopyError = () => {
    // 复制当前渲染错误的完整堆栈，便于用户提交问题反馈。
    const error = this.state.error
    if (!error) return
    host.copyText(t('error.renderTitle') + '\n' + (error.stack || error.message || String(error)))
  }

  handleExportDiagnostics = async () => {
    // 导出宿主环境、错误堆栈和数据数量摘要，不直接导出用户内容。
    try {
      const error = this.state.error
      const diagnostics = getHostDiagnostics()
      const content = JSON.stringify({
        生成时间: diagnostics.generatedAt,
        宿主模式: diagnostics.hostMode,
        界面语言: diagnostics.language,
        用户代理: diagnostics.userAgent,
        页面地址: diagnostics.location,
        错误: error ? {
          名称: error.name,
          消息: error.message,
          堆栈: error.stack || String(error)
        } : null,
        数据摘要: (() => {
          const backup = createRecoveryBackup()
          return {
            分组: backup.分组.length,
            分类: backup.分类.length,
            常用语: backup.常用语.length
          }
        })()
      }, null, 2)
      await host.saveFile({
        content,
        filename: `phrase-manager-diagnostics-${Date.now()}.json`,
        title: t('error.exportDiagnostics'),
        filterName: t('dialog.jsonFilter'),
        extensions: ['json']
      })
    } catch (error) {
      this.setState({ actionError: translateError(error) })
    }
  }

  handleExportRecovery = async () => {
    // 导出可重新导入的完整恢复备份，供数据损坏时使用。
    try {
      await host.saveFile({
        content: JSON.stringify(createRecoveryBackup(), null, 2),
        filename: `phrase-manager-recovery-${Date.now()}.json`,
        title: t('error.exportRecovery'),
        filterName: t('dialog.jsonFilter'),
        extensions: ['json']
      })
    } catch (error) {
      this.setState({ actionError: translateError(error) })
    }
  }

  handleRestoreRecovery = async () => {
    // 读取并校验恢复备份；恢复成功后重新加载页面以重建全部状态。
    try {
      const file = await host.pickFile({
        extensions: ['json'],
        accept: '.json,application/json',
        title: t('error.restoreRecovery'),
        filterName: t('dialog.jsonFilter')
      })
      if (!file) return
      restoreRecoveryBackup(decodeRecoveryBackup(file.buffer))
      window.location.reload()
    } catch (error) {
      this.setState({ actionError: translateError(error) })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className='render-error-alert'>
          <Alert variant='filled' severity='error'>
            <AlertTitle>{t('error.renderTitle')}</AlertTitle>
            <pre>{this.state.error.stack || this.state.error.message || String(this.state.error)}</pre>
            {this.state.actionError && <div>{this.state.actionError}</div>}
            <div className='render-error-actions'>
              <Button onClick={() => window.location.reload()} color='inherit'>{t('error.reload')}</Button>
              <Button onClick={this.handleCopyError} color='inherit'>{t('common.copy')}</Button>
              <Button onClick={this.handleExportDiagnostics} color='inherit'>{t('error.exportDiagnostics')}</Button>
              <Button onClick={this.handleExportRecovery} color='inherit'>{t('error.exportRecovery')}</Button>
              <Button onClick={this.handleRestoreRecovery} color='inherit'>{t('error.restoreRecovery')}</Button>
            </div>
          </Alert>
        </div>
      )
    }
    return this.props.children
  }
}
