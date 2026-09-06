<div align="center">
  <img src="./public/logo.png" width="112" height="112" alt="Phrase Manager Logo">

  <h1>常用语管理 - Phrase Manager</h1>

  <p><strong>面向 uTools 的本地常用语、文本片段与知识条目管理插件</strong></p>

  <p>
    <a href="https://github.com/realSilasYang/phrase-manager/releases"><img src="https://img.shields.io/github/v/release/realSilasYang/phrase-manager?style=flat-square&amp;label=version" alt="最新版本"></a>
    <a href="https://github.com/realSilasYang/phrase-manager/releases"><img src="https://img.shields.io/github/downloads/realSilasYang/phrase-manager/total?style=flat-square&amp;label=downloads" alt="GitHub 下载量"></a>
    <a href="https://github.com/realSilasYang/phrase-manager/blob/main/LICENSE"><img src="https://img.shields.io/github/license/realSilasYang/phrase-manager?style=flat-square" alt="开源许可证"></a>
    <a href="https://github.com/realSilasYang/phrase-manager/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/realSilasYang/phrase-manager/ci.yml?branch=main&amp;style=flat-square&amp;label=CI" alt="CI 状态"></a>
  </p>

  <p>
    <a href="#功能概览">功能概览</a> ·
    <a href="#使用方式">使用方式</a> ·
    <a href="#开发与构建">开发与构建</a> ·
    <a href="https://github.com/realSilasYang/phrase-manager/releases">版本发布</a> ·
    <a href="https://github.com/realSilasYang/phrase-manager/issues">问题反馈</a>
  </p>
</div>

Phrase Manager 是一个运行在 uTools 中的本地常用语管理插件。它用“分组 → 分类 → 常用语”的结构整理可复用文本，适合管理客服回复、工作模板、提示词、代码片段和日常笔记。数据默认保存在 uTools 本地数据库，支持备份、恢复、批量操作和撤销重做。

# 功能概览

- 分组、分类和常用语的创建、重命名、删除与排序
- 拖拽移动、跨分组移动、复制和批量管理
- 搜索、预览、快捷键、撤销与重做
- JSON 备份恢复，以及兼容讯飞输入法的 CSV 导入导出
- 多语言界面，支持简体中文、繁体中文、英语、日语、韩语、越南语及更多语言
- 本地字体选择、深色模式和响应式编辑区
- 可选的 AI 内容生成、标题生成、内容优化和智能归类

# 使用方式

## 在 uTools 中运行

1. 从 [Releases](https://github.com/realSilasYang/phrase-manager/releases) 下载最新插件包，或按下方说明自行构建。
2. 在 uTools 开发者工具中加载构建目录中的 `dist/plugin.json`。
3. 通过 uTools 搜索“常用语”打开插件。

## 常用快捷键

| 快捷键 | 操作 |
| --- | --- |
| `Ctrl+N` | 新建常用语 |
| `Ctrl+Shift+N` | 新建分类 |
| `Ctrl+S` | 保存当前常用语 |
| `Ctrl+F` | 聚焦搜索框 |
| `F2` | 重命名悬停中的分组或分类 |
| `Delete` | 删除悬停中的条目 |
| `Ctrl+Z` / `Ctrl+Y` | 撤销 / 重做 |

## 数据与隐私

常用语数据通过 uTools 本地数据库保存，不会因安装插件自动上传到远程服务。AI 功能默认关闭；启用后，相关内容会发送到 uTools 中配置的 AI 服务。导出备份前请确认其中不包含不应分享的敏感信息。

# 开发与构建

环境要求：Node.js 18 或更高版本，以及 npm。

```bash
npm install
npm run dev
```

发布构建会先清理旧产物，再执行语言包检查、生产构建和发布包审计：

```bash
npm run release:build
```

构建产物位于 `dist/`，插件清单为 `dist/plugin.json`。发布审计会检查版本号一致性、清单引用、图标、发布目录白名单、敏感文件和常见密钥格式。

# 贡献代码

欢迎提交 Issue 和 Pull Request。提交前请：

1. 保持数据模型和本地存储边界不变，除非改动有明确迁移方案。
2. 为用户可见文本补齐所有语言包，并运行 `npm run verify-locales`。
3. 运行 `npm run release:build`，确认干净构建和发布审计通过。
4. 不要提交 `node_modules/`、`dist/`、本地数据、日志、密钥或其他生成文件。

# 许可证

本项目采用 [MIT License](./LICENSE) 开源。
