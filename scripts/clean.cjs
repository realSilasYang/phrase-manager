const fs = require('node:fs')
const path = require('node:path')

// 仅清理构建输出目录；源码、依赖和用户数据都不在此脚本的操作范围内。
const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.resolve(projectRoot, 'dist')

// 在删除前确认目标确实是项目根目录下的 dist，避免路径配置错误造成误删。
if (path.dirname(distRoot) !== projectRoot) {
  throw new Error(`Refusing to clean outside the project output directory: ${distRoot}`)
}

if (fs.existsSync(distRoot)) {
  // 构建产物可随时由 webpack 重新生成，因此清理操作只针对 dist。
  fs.rmSync(distRoot, { recursive: true, force: true })
  console.log(`Removed ${path.relative(projectRoot, distRoot)}`)
} else {
  console.log('dist is already clean')
}
