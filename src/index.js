import { createRoot } from 'react-dom/client'
import './index.less'
import ErrorBoundary from './ErrorBoundary'
import App from './App'
import { resolveLocale, setLocale } from './locales'
import { host } from './services/host'
import { loadSettings } from './services/domainSchema'

// 启动时先读取用户语言设置；读取失败时使用语言模块自己的系统语言回退逻辑。
try {
  const savedLanguage = loadSettings(host.dbStorage.getItem('app_settings')).界面语言
  const systemLanguage = navigator.languages?.[0] || navigator.language
  setLocale(resolveLocale(savedLanguage, systemLanguage))
} catch {
  setLocale(resolveLocale('auto'))
}

const root = createRoot(document.getElementById('root'))
// 错误边界包裹主应用，确保渲染异常仍能显示复制、诊断导出和数据恢复入口。
root.render(<ErrorBoundary><App /></ErrorBoundary>)
