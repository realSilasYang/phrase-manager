import { serviceError } from './errors'

const memoryStore = new Map()
const memoryDbStorage = {
  getItem: key => memoryStore.has(key) ? memoryStore.get(key) : null,
  setItem: (key, value) => { memoryStore.set(key, value) },
  removeItem: key => { memoryStore.delete(key) }
}

function nativeApi() {
  if (typeof window !== 'undefined' && window.utools) return window.utools
  if (typeof utools !== 'undefined') return utools
  return null
}

function preloadServices() {
  return typeof window !== 'undefined' ? window.services : null
}

function downloadBlob(content, filename, type = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function pickBrowserFile(accept) {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.style.display = 'none'
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      input.remove()
      if (!file) {
        resolve(null)
        return
      }
      resolve({ name: file.name, buffer: new Uint8Array(await file.arrayBuffer()) })
    }, { once: true })
    input.addEventListener('cancel', () => {
      input.remove()
      resolve(null)
    }, { once: true })
    document.body.appendChild(input)
    input.click()
  })
}

export const host = {
  get mode() {
    return nativeApi() ? 'utools' : 'development-simulator'
  },

  get dbStorage() {
    return nativeApi()?.dbStorage || memoryDbStorage
  },

  onPluginEnter(callback) {
    const api = nativeApi()
    if (api?.onPluginEnter) return api.onPluginEnter(callback)
    const timer = setTimeout(() => callback({ code: 'phrase-manager-main', type: 'text', payload: '' }), 0)
    return () => clearTimeout(timer)
  },

  onPluginOut(callback) {
    return nativeApi()?.onPluginOut?.(callback)
  },

  onDbPull(callback) {
    return nativeApi()?.onDbPull?.(callback)
  },

  async copyText(text) {
    const api = nativeApi()
    if (api?.copyText) {
      const copied = await api.copyText(String(text ?? ''))
      if (copied === false) throw serviceError('error.unknown')
      return copied
    }
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(String(text ?? ''))
    const textarea = document.createElement('textarea')
    textarea.value = String(text ?? '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      if (!document.execCommand('copy')) throw serviceError('error.unknown')
    } finally {
      textarea.remove()
    }
  },

  ai(options, onChunk) {
    const api = nativeApi()
    if (!api?.ai) {
      const error = serviceError('ai.errorUnavailable')
      error.code = 'AI_UNAVAILABLE'
      return Promise.reject(error)
    }
    return api.ai(options, onChunk)
  },

  allAiModels() {
    return nativeApi()?.allAiModels?.() || Promise.resolve([])
  },

  openAiModelsSettings() {
    const api = nativeApi()
    if (typeof api?.redirectAiModelsSetting !== 'function') return false
    try {
      api.redirectAiModelsSetting()
      return true
    } catch {
      return false
    }
  },

  openExternal(url) {
    const target = String(url || '').trim()
    if (!target) return false

    const api = nativeApi()
    if (typeof api?.shellOpenExternal === 'function') {
      api.shellOpenExternal(target)
      return true
    }

    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      const popup = window.open(target, '_blank', 'noopener,noreferrer')
      return Boolean(popup)
    }

    return false
  },

  async allLocalFonts({ allowBrowserAccess = true } = {}) {
    const bridgeFonts = await preloadServices()?.listLocalFonts?.()
    if (bridgeFonts?.length) return bridgeFonts

    if (allowBrowserAccess && typeof window !== 'undefined' && typeof window.queryLocalFonts === 'function') {
      try {
        const fonts = await window.queryLocalFonts()
        if (fonts?.length) return fonts
      } catch {
        // 即使浏览器字体接口不可用，预加载桥接层仍可能提供本机字体列表。
      }
    }
    throw serviceError('settings.fontUnavailable')
  },

  getFeatures(codes) {
    return nativeApi()?.getFeatures?.(codes) || []
  },

  setFeature(feature) {
    return nativeApi()?.setFeature?.(feature)
  },

  removeFeature(code) {
    return nativeApi()?.removeFeature?.(code)
  },

  hideMainWindow() {
    return nativeApi()?.hideMainWindow?.()
  },

  outPlugin() {
    return nativeApi()?.outPlugin?.()
  },

  async pickFile({ extensions = ['json'], accept, title, filterName } = {}) {
    const api = nativeApi()
    if (!api?.showOpenDialog) return pickBrowserFile(accept || extensions.map(ext => `.${ext}`).join(','))
    const filePaths = api.showOpenDialog({
      ...(title ? { title } : {}),
      filters: [{ name: filterName || extensions.map(ext => ext.toUpperCase()).join(', '), extensions }],
      properties: ['openFile']
    })
    if (!filePaths?.[0]) return null
    const services = preloadServices()
    const raw = services?.readFileBuffer
      ? services.readFileBuffer(filePaths[0])
      : services?.readFile?.(filePaths[0])
    if (raw == null) throw serviceError('error.fileReadUnavailable')
    const buffer = typeof raw === 'string' ? new TextEncoder().encode(raw) : new Uint8Array(raw)
    return { name: String(filePaths[0]).split(/[\\/]/).pop(), path: filePaths[0], buffer }
  },

  async saveFile({ content, filename, title, filterName, extensions = ['json'], encoding = 'utf-8', type = 'application/json' }) {
    const api = nativeApi()
    if (!api?.showSaveDialog) {
      downloadBlob(content, filename, type)
      return true
    }
    const filePath = api.showSaveDialog({
      ...(title ? { title } : {}),
      defaultPath: filename,
      filters: [{ name: filterName || extensions.map(ext => ext.toUpperCase()).join(', '), extensions }]
    })
    if (!filePath) {
      api.showMainWindow?.()
      return false
    }
    const services = preloadServices()
    if (!services?.writeFile) throw serviceError('error.fileWriteUnavailable')
    services.writeFile(filePath, content, encoding)
    api.showMainWindow?.()
    return true
  }
}

export function getHostDiagnostics() {
  return {
    generatedAt: new Date().toISOString(),
    hostMode: host.mode,
    language: typeof navigator !== 'undefined' ? navigator.language : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    location: typeof window !== 'undefined' ? window.location.href : null
  }
}
