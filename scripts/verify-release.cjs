const fs = require('node:fs')
const path = require('node:path')

// 发布校验脚本只读取 dist 和 package 元数据，不修改构建产物。
const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.resolve(projectRoot, 'dist')
const packageManifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
const lockManifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package-lock.json'), 'utf8'))

// 根目录只允许插件运行所需文件；依赖目录和捐赠图片目录单独列入白名单。
const ALLOWED_ROOT_FILES = new Set([
  'index.html',
  'index.js',
  'index.js.LICENSE.txt',
  'logo.png',
  'plugin.json',
  'preload.js'
])
const ALLOWED_ROOT_DIRECTORIES = new Set(['donate', 'node_modules'])
// 发布包中禁止出现备份、日志、密钥、调试和临时文件名。
const FORBIDDEN_RELEASE_FILE = /(?:^|[\\/])(?:\.env(?:\..*)?|.*\.(?:bak|backup|csv|db|dump|key|log|map|pem|sqlite\d?|temp|tmp))(?:$|[\\/])/i
const FORBIDDEN_RELEASE_NAME = /(?:^|[._-])(?:backup|debug|diagnostic|export|recovery|secret|temporary|test)(?:[._-]|$)/i
// 对文本产物执行常见密钥格式扫描，防止敏感凭据随包发布。
const SECRET_PATTERNS = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['OpenAI-style API key', /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}\b/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{30,}\b/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/]
]

function fail(message) {
  // 统一使用异常终止校验，避免部分检查失败后仍输出“通过”。
  throw new Error(`[release] ${message}`)
}

function requiredFile(relativePath) {
  // 解析清单引用时禁止跳出 dist，并确保目标是实际文件。
  const absolutePath = path.resolve(distRoot, relativePath)
  const relativeToDist = path.relative(distRoot, absolutePath)
  if (relativeToDist.startsWith('..') || path.isAbsolute(relativeToDist)) {
    fail(`manifest path escapes dist: ${relativePath}`)
  }
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    fail(`manifest file is missing: ${relativePath}`)
  }
  return absolutePath
}

// 先确认已经生成构建目录，再逐项校验插件清单。
if (!fs.existsSync(distRoot)) fail('dist does not exist; run npm run build first')

const manifestPath = requiredFile('plugin.json')
let manifest
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
} catch (error) {
  fail(`plugin.json is not valid JSON: ${error.message}`)
}

// 版本号和 plugin.json 必须一致，避免发布包标记错误版本。
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageManifest.version || '')) {
  fail(`package.json.version must be a valid semver value (got ${packageManifest.version || 'missing'})`)
}
if (lockManifest.packages?.['']?.version !== packageManifest.version) {
  fail(`version mismatch: package.json=${packageManifest.version}, package-lock.json=${lockManifest.packages?.['']?.version || 'missing'}`)
}
if (manifest.version !== packageManifest.version) {
  fail(`version mismatch: package.json=${packageManifest.version}, plugin.json=${manifest.version || 'missing'}`)
}

if (typeof manifest.main !== 'string' || !manifest.main.endsWith('.html')) {
  fail('plugin.json.main must be a relative .html path')
}
if (typeof manifest.logo !== 'string') fail('plugin.json.logo must be a relative path')
if (manifest.preload != null && (typeof manifest.preload !== 'string' || !manifest.preload.endsWith('.js'))) {
  fail('plugin.json.preload must be a relative .js path when present')
}
requiredFile(manifest.main)
const logoPath = requiredFile(manifest.logo)
if (manifest.preload) requiredFile(manifest.preload)

// 检查插件功能声明和命令数量，防止 uTools 无法加载动态功能。
if (!Array.isArray(manifest.features) || manifest.features.length === 0) {
  fail('plugin.json.features must contain at least one feature')
}
const featureCodes = new Set()
for (const feature of manifest.features) {
  if (!feature || typeof feature.code !== 'string' || !feature.code.trim()) {
    fail('every feature must have a non-empty code')
  }
  if (featureCodes.has(feature.code)) fail(`duplicate feature code: ${feature.code}`)
  featureCodes.add(feature.code)
  if (!Array.isArray(feature.cmds) || feature.cmds.length === 0) {
    fail(`feature ${feature.code} must contain at least one command`)
  }
  const functionCommandCount = feature.cmds.filter(command => typeof command === 'string').length
  if (functionCommandCount > 5) {
    fail(`feature ${feature.code} contains ${functionCommandCount} function commands; the recommended maximum is 5`)
  }
}

// 读取 PNG 头部，确保图标存在、为 PNG 且宽高相等。
const logo = fs.readFileSync(logoPath)
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
if (!logo.subarray(0, 8).equals(pngSignature)) fail('logo must be a PNG file')
const logoWidth = logo.readUInt32BE(16)
const logoHeight = logo.readUInt32BE(20)
if (logoWidth === 0 || logoHeight === 0 || logoWidth !== logoHeight) {
  fail(`logo must be a non-empty square PNG (got ${logoWidth}x${logoHeight})`)
}

// 预加载脚本若引用外置依赖，确认这些依赖也被复制进发布包。
if (manifest.preload) {
  const preload = fs.readFileSync(path.resolve(distRoot, manifest.preload), 'utf8')
  if (/require\(['"]iconv-lite['"]\)/.test(preload)) {
    requiredFile('node_modules/iconv-lite/package.json')
  }
  if (/require\(['"]safer-buffer['"]\)/.test(preload)) {
    requiredFile('node_modules/safer-buffer/package.json')
  }
}

// 生产主包不得包含开发阶段的启动日志标记。
const mainBundle = fs.readFileSync(requiredFile(manifest.main.replace(/\.html$/, '.js')), 'utf8')
for (const marker of ['[PhraseManager] Starting', '[PhraseManager] Root render']) {
  if (mainBundle.includes(marker)) fail(`development marker found in the production bundle: ${marker}`)
}

// 递归收集发布文件，供后续临时文件、敏感文件和密钥扫描复用。
const releaseFiles = []
function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) collectFiles(absolutePath)
    else releaseFiles.push(path.relative(distRoot, absolutePath))
  }
}
collectFiles(distRoot)
// 明确拦截历史审计和分析脚本，避免开发辅助文件混入发布目录。
const forbiddenReleaseFiles = releaseFiles.filter(file => /(?:ARCHITECTURE_AUDIT|build_log|analyze_colors)/i.test(file))
if (forbiddenReleaseFiles.length > 0) fail(`development files found in dist: ${forbiddenReleaseFiles.join(', ')}`)

// 校验根目录白名单；动态代码分块必须使用语义化的 *.chunk.js 命名。
const unexpectedRootEntries = fs.readdirSync(distRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory()
    ? !ALLOWED_ROOT_DIRECTORIES.has(entry.name)
    : !ALLOWED_ROOT_FILES.has(entry.name) && !/^.+\.chunk\.js$/.test(entry.name))
  .map(entry => entry.name)
if (unexpectedRootEntries.length > 0) {
  fail(`unexpected release entries found in dist: ${unexpectedRootEntries.join(', ')}`)
}

// 对路径名执行敏感文件检查，但允许 node_modules 内部保留依赖自身的合法名称。
const sensitiveFiles = releaseFiles.filter(file => (
  FORBIDDEN_RELEASE_FILE.test(file) ||
  (!file.startsWith(`node_modules${path.sep}`) && FORBIDDEN_RELEASE_NAME.test(path.basename(file)))
))
if (sensitiveFiles.length > 0) {
  fail(`sensitive or non-release files found in dist: ${sensitiveFiles.join(', ')}`)
}

// 只读取文本格式进行密钥扫描，图片和二进制依赖无需解码。
const textExtensions = new Set(['.html', '.js', '.json', '.txt'])
for (const file of releaseFiles) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue
  const content = fs.readFileSync(path.resolve(distRoot, file), 'utf8')
  for (const [label, pattern] of SECRET_PATTERNS) {
    if (pattern.test(content)) fail(`${label} found in dist/${file}`)
  }
}

console.log(`Release verification passed: ${releaseFiles.length} files, ${featureCodes.size} features, logo ${logoWidth}x${logoHeight}`)
