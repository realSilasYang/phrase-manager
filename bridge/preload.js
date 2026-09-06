/*
preload.js 说明
- 运行于 Electron 预加载环境（preload），可使用：Node.js API、Electron 渲染进程 API、Web API、第三方 Node.js 库。
- 在此编写 Node.js / Electron 相关逻辑。
- 通过 window.services 向前端 UI 暴露封装后的服务接口。

约束：
- 禁止将 Node.js 原生模块（如 fs、child_process、require 等）直接暴露给前端。
- 仅允许暴露函数形式的受控能力。
*/

const fs = require('fs')

function writeFile(filePath, content, encoding) {
  const normalizedEncoding = String(encoding || '').toLowerCase().replace(/[-_]/g, '')
  if (!normalizedEncoding || normalizedEncoding === 'utf8') {
    return fs.writeFileSync(filePath, content, 'utf8')
  }
  const iconv = require('iconv-lite')
  return fs.writeFileSync(filePath, iconv.encode(content, encoding))
}

function runFontCommand(command, args, timeout = 10000) {
  const { execFile } = require('child_process')
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      encoding: 'utf8',
      windowsHide: true,
      timeout,
      maxBuffer: 4 * 1024 * 1024
    }, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })
}

async function listLocalFonts() {
  if (process.platform === 'win32') {
    const script = [
      '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)',
      "@('HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts', 'HKCU:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts') | ForEach-Object {",
      "  if (Test-Path $_) { (Get-ItemProperty $_).PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object Name }",
      '}'
    ].join('; ')
    const output = await runFontCommand('powershell.exe', [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script
    ])
    const styleSuffix = /\s+(?:regular|normal|roman|book|medium|light|semilight|demilight|semibold|demibold|bold|extrabold|ultrabold|italic|oblique|condensed|narrow)(?:\s+(?:italic|oblique))?$/i
    const localizedStyleSuffix = /\s+(?:常规体|中黑体|中粗体|纤细体|极细体|超细体|粗体|斜体|细体)$/
    const families = output.split(/\r?\n/).flatMap(line => {
        const name = line
          .replace(/^@/, '')
          .replace(/\s+\((?:trueType|openType|type 1)\)(?:\(\d+\))?$/i, '')
          .trim()
        if (!name) return []
        return name.split(/\s+&+\s+/).map(font => {
          let family = font
          let previous
          do {
            previous = family
            family = family.replace(styleSuffix, '').replace(localizedStyleSuffix, '').trim()
          } while (family !== previous)
          return family
        }).filter(Boolean)
      })
    const uniqueFamilies = new Map()
    families.forEach(font => {
      const key = font.toLocaleLowerCase()
      if (!uniqueFamilies.has(key)) uniqueFamilies.set(key, font)
    })
    return Array.from(uniqueFamilies.values())
  }

  if (process.platform === 'darwin') {
    const data = JSON.parse(await runFontCommand('/usr/sbin/system_profiler', ['SPFontsDataType', '-json'], 15000))
    const families = []
    const collectFamilies = value => {
      if (!value || typeof value !== 'object') return
      if (typeof value.family === 'string') families.push(value.family)
      Object.values(value).forEach(collectFamilies)
    }
    collectFamilies(data)
    return families
  }

  return (await runFontCommand('fc-list', ['--format=%{family}\n']))
    .split(/\r?\n/)
    .flatMap(font => font.split(','))
    .map(font => font.trim())
    .filter(Boolean)
}

let localFontsPromise = null

function getLocalFonts() {
  if (!localFontsPromise) {
    localFontsPromise = listLocalFonts().catch(error => {
      localFontsPromise = null
      throw error
    })
  }
  return localFontsPromise
}

window.services = {
  // 写入文件
  writeFile,
  // 读取文件
  readFile: (filePath) => {
    return fs.readFileSync(filePath, 'utf-8')
  },
  // 读取文件二进制缓冲区。
  readFileBuffer: (filePath) => {
    return fs.readFileSync(filePath)
  },
  // 仅在用户打开字体选择菜单时枚举本机字体
  listLocalFonts: getLocalFonts
}
