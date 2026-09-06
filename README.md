<div align="center">
  <img src="./public/logo.png" width="112" height="112" alt="Phrase Manager Logo">

  <p><strong>简体中文</strong> · <a href="./docs/README.zh-HK.md">繁體中文（香港）</a> · <a href="./docs/README.zh-TW.md">繁體中文（台灣）</a> · <a href="./docs/README.en.md">English</a> · <a href="./docs/README.ja.md">日本語</a> · <a href="./docs/README.vi.md">Tiếng Việt</a> · <a href="./docs/README.ko.md">한국어</a> · <a href="./docs/README.es.md">Español</a> · <a href="./docs/README.fr.md">Français</a> · <a href="./docs/README.pt-BR.md">Português (Brasil)</a> · <a href="./docs/README.pt-PT.md">Português (Portugal)</a> · <a href="./docs/README.ru.md">Русский</a> · <a href="./docs/README.de.md">Deutsch</a> · <a href="./docs/README.it.md">Italiano</a></p>

  <h1>常用语管理 - Phrase Manager</h1>

  <p><strong>在 uTools 中管理常用语、文本片段和知识条目，支持本地保存、AI 辅助与多语言界面</strong></p>

  <p>
    <a href="https://github.com/realSilasYang/phrase-manager/releases"><img src="https://img.shields.io/github/v/release/realSilasYang/phrase-manager?style=flat-square&amp;label=version" alt="最新版本"></a>
    <a href="https://github.com/realSilasYang/phrase-manager/releases"><img src="https://img.shields.io/github/downloads/realSilasYang/phrase-manager/total?style=flat-square&amp;label=downloads" alt="GitHub 下载量"></a>
    <a href="https://github.com/realSilasYang/phrase-manager/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/realSilasYang/phrase-manager/ci.yml?branch=main&amp;style=flat-square&amp;label=CI" alt="CI 状态"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/realSilasYang/phrase-manager?style=flat-square" alt="开源许可证"></a>
    <a href="https://u.tools/"><img src="https://img.shields.io/badge/uTools-plugin-5B8C5A?style=flat-square" alt="uTools 插件"></a>
  </p>

  <p>
    <a href="https://github.com/realSilasYang/phrase-manager/releases">插件下载</a> ·
    <a href="#界面概览">界面概览</a> ·
    <a href="#用户使用指南">用户指南</a> ·
    <a href="#开发者指南">开发者指南</a> ·
    <a href="https://github.com/realSilasYang/phrase-manager/issues">问题反馈</a>
  </p>
</div>

常用语管理（Phrase Manager）是一款运行在 uTools 中的本地文本管理插件。它使用“分组 → 分类 → 常用语”的结构整理可复用内容，适合管理客服回复、工作模板、提示词、代码片段和个人笔记。数据默认保存在 uTools 本地数据库，可通过 JSON 备份恢复；AI 功能用于生成内容、标题、分类和导入结构化数据。

# 界面概览

```text
┌────────────────┬────────────────────┬──────────────────────────────┐
│ 分组           │ 分类               │ 常用语                       │
│                │                    │                              │
│ 选择或新建分组 │ 选择或新建分类     │ 搜索、编辑、复制和预览内容   │
│ 拖拽调整顺序   │ 拖拽移动或复制条目 │ 批量操作、导入导出和 AI 工具 │
└────────────────┴────────────────────┴──────────────────────────────┘
```

左侧依次展示分组和分类，右侧展示当前分类中的常用语卡片。点击卡片可以复制内容，选中卡片后可编辑标题和正文；拖拽可以调整顺序，也可以在分组、分类之间移动或复制条目。顶部搜索框支持跨内容查找，底部工具栏提供设置、帮助、导入和导出入口。

---
**[用户使用指南](#用户使用指南)**<br>
[初次使用](#1-初次使用) · [数据层级与命名](#2-数据层级与命名) · [快捷键与基本操作](#3-快捷键与基本操作) · [搜索、批量操作与拖拽](#4-搜索批量操作与拖拽)<br>
[导入与导出](#5-导入与导出) · [AI 辅助](#6-ai-辅助) · [设置与多语言](#7-设置与多语言) · [数据、隐私与故障处理](#8-数据隐私与故障处理)

**[开发者指南](#开发者指南)**<br>
[目录结构与生成边界](#1-目录结构与生成边界) · [数据模型与持久化](#2-数据模型与持久化) · [本地化与语言包](#3-本地化与语言包) · [构建、验证与发布](#4-构建验证与发布)<br>
[贡献代码与安全报告](#5-贡献代码与安全报告)

# 捐赠

如果常用语管理为您节省了整理和查找常用语的时间，欢迎通过下方二维码打赏作者。请选择扶贫方式：

<p align="center">
  <img src="./public/donate/wechat-pay-light.png" width="220" alt="微信支付打赏二维码">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/donate/alipay-light.png" width="220" alt="支付宝打赏二维码">
</p>

# 用户使用指南

## 1. 初次使用

### ⚙️ 安装并打开插件

1. 从 [v1.0.5 Release](https://github.com/realSilasYang/phrase-manager/releases/tag/v1.0.5) 下载 `phrase-manager-1.0.5.zip` 并解压。
2. 打开 uTools 开发者工具，加载解压目录中的 `plugin.json`。
3. 在 uTools 中搜索“常用语”、`Phrase Manager` 或 `Phrases`，打开插件。
4. 第一次使用时，可以按照引导创建示例数据，也可以直接点击“新建分组”开始整理。

### 💾 了解数据保存范围

常用语、分组、分类和设置通过 uTools 的本地数据库保存，不会写入项目目录，也不会因安装插件自动上传到远程服务。删除插件前建议先使用“导出”保存 JSON 备份。

## 2. 数据层级与命名

### 🗂️ 分组、分类和常用语

| 层级 | 作用 | 示例 |
| --- | --- | --- |
| 分组 | 最大的主题容器 | 工作、生活、学习 |
| 分类 | 分组下的细分主题 | 客服回复、代码模板 |
| 常用语 | 可复制、编辑和搜索的文本 | 一段回复、提示词或笔记 |

### ✏️ 新建和重命名

- 点击分组或分类下拉框中的“新建分组…”或“新建分类…”，会先打开命名输入框；确认后才会创建条目。
- 新建分类时必须先存在一个分组；没有分组时，插件会先要求创建分组。
- 对悬停中的分组或分类按 `F2`，或在更多菜单中选择重命名。
- 名称会自动去除首尾空白；重复名称会自动追加序号，避免覆盖已有条目。
- 新建常用语时填写标题和内容，点击其他区域、切换卡片或按 `Ctrl+S` 保存。

## 3. 快捷键与基本操作

| 按键 | 使用位置 | 操作 |
| --- | --- | --- |
| `Ctrl+N` | 主界面 | 新建常用语 |
| `Ctrl+Shift+N` | 主界面 | 新建分类 |
| `Ctrl+F` | 主界面 | 聚焦搜索框 |
| `Ctrl+S` | 编辑器 | 保存当前常用语 |
| `Ctrl+Z` | 主界面 | 撤销上一步操作 |
| `Ctrl+Y` / `Ctrl+Shift+Z` | 主界面 | 重做已撤销操作 |
| `Ctrl+A` | 批量模式 | 选择当前视图中的条目 |
| `Ctrl+C` | 悬停条目 | 复制常用语内容 |
| `Ctrl+D` | 悬停条目 | 克隆常用语、分类或分组 |
| `F2` | 悬停分组/分类 | 重命名条目 |
| `Delete` | 悬停条目 | 删除条目 |
| `Esc` | 编辑器或对话框 | 退出编辑或取消操作 |
| `F11` | 编辑器 | 切换全屏编辑 |
| `Space` | 悬停常用语 | 切换预览模式 |
| `Ctrl` + 拖拽 | 拖拽条目 | 复制到目标分组或分类 |

快捷键速查中的说明行是静态帮助内容，不会因为鼠标悬停而改变背景。

## 4. 搜索、批量操作与拖拽

### 🔍 搜索和预览

搜索框会在当前数据范围内匹配标题、正文、分组和分类。点击搜索结果可以直接跳转到对应分类并选中常用语。悬停卡片后按 `Space` 可进入预览模式，再用上下方向键浏览相邻卡片。

### 📦 批量管理

点击搜索框旁的批量选择按钮进入批量模式。之后可以全选、删除、移动、导出或调整多个分类和常用语；批量操作作为一次完整操作写入撤销历史。

### 🖱️ 拖拽移动和复制

拖拽分组、分类或常用语可以调整同级顺序，也可以放到其他分组或分类。按住 `Ctrl` 拖拽会保留原条目并创建副本；普通拖拽会移动原条目。拖拽过程中会显示目标位置和移动方向，松开鼠标后才提交变更。

## 5. 导入与导出

### 📥 支持的导入格式

- **JSON 备份：** 用于完整备份和恢复分组、分类、常用语及排序信息。
- **讯飞输入法 CSV：** 表头必须为 `常用语分组,常用语内容`，每行包含两列；支持标准 CSV 引号和 UTF-8/GBK 文本。
- **AI 智能导入：** 可将 TXT、Markdown、TSV、YAML、XML 以及格式不规范的 JSON/CSV 转换为常用语。转换结果会先经过本地校验并显示预览，确认后才写入数据库。

一个最小 JSON 备份示例：

```json
{
  "分组": [{ "编号": "group-1", "名称": "工作" }],
  "分类": [{ "编号": "category-1", "名称": "回复模板", "所属分组编号": "group-1" }],
  "常用语": [{
    "编号": "phrase-1",
    "标题": "欢迎语",
    "内容": "你好，感谢你的咨询。",
    "所属分类编号": "category-1"
  }]
}
```

### 📤 导出和恢复

导出菜单可以生成 JSON、讯飞 CSV、Markdown、HTML 或纯文本。JSON 适合再次导入，其他格式适合阅读、打印或分享，不能作为完整备份恢复。导入前会检查字段、编号、归属关系和重复内容；无效记录会在预览中标出，不会静默写入。

## 6. AI 辅助

AI 功能使用 uTools 当前可用的 AI 服务和模型。打开设置后可以选择模型并编辑以下提示词：导入转换、智能归类、标题生成和内容生成。

| 功能 | 作用 |
| --- | --- |
| AI 生成内容 | 根据主题或已有内容生成常用语正文 |
| AI 优化内容 | 改写当前正文，保留用户确认后再保存 |
| AI 生成标题 | 根据正文生成简短标题 |
| AI 智能归类 | 推荐已有分组和分类，没有匹配时可以手动选择 |
| AI 智能导入 | 将非标准文本转换为可预览的结构化常用语 |

AI 结果始终在本地进行字段和归属校验，只有用户确认后才会保存。启用 AI 后，相关文本会发送到 uTools 配置的 AI 服务；敏感内容请先脱敏。

## 7. 设置与多语言

### 🌐 支持的界面语言

选择“自动”时，插件会根据系统语言选择最匹配的语言；无法匹配时回退到简体中文。当前提供 14 种完整界面语言：

| 语言 | 代码 | 语言包 |
| --- | --- | --- |
| 简体中文 | `zh-CN` | `src/locales/zh-CN.js` |
| 繁體中文（香港） | `zh-HK` | `src/locales/zh-HK.js` |
| 繁體中文（台灣） | `zh-TW` | `src/locales/zh-TW.js` |
| English | `en` | `src/locales/en.js` |
| 日本語 | `ja` | `src/locales/ja.js` |
| Tiếng Việt | `vi` | `src/locales/vi.js` |
| 한국어 | `ko` | `src/locales/ko.js` |
| Español | `es` | `src/locales/es.js` |
| Français | `fr` | `src/locales/fr.js` |
| Português (Brasil) | `pt-BR` | `src/locales/pt-BR.js` |
| Português (Portugal) | `pt-PT` | `src/locales/pt-PT.js` |
| Русский | `ru` | `src/locales/ru.js` |
| Deutsch | `de` | `src/locales/de.js` |
| Italiano | `it` | `src/locales/it.js` |

### 🎨 其他设置

设置页还可以调整浅色/深色/跟随系统主题、界面字体、内容字体、卡片预览行数以及启动时打开的位置。字体只影响显示，不会改变已保存的文本内容。

## 8. 数据、隐私与故障处理

### 🔒 数据和隐私

普通的创建、编辑、搜索、拖拽、导入和导出都在本地完成。插件不会自动上传常用语数据；只有使用 AI 生成或 AI 导入时，相关内容才会发送到 uTools 配置的服务。导出的 JSON、CSV 和日志可能包含原文，请妥善保管。

### ↩️ 撤销、重做和恢复

创建、编辑、删除、重命名、移动、复制、导入、导出前的整理以及 AI 结果确认都支持撤销和重做。保存采用本地数据库写入队列，应用关闭或切换条目时会先提交待保存内容。遇到异常时，优先重新打开插件并从最近一次 JSON 备份恢复。

# 开发者指南

## 1. 目录结构与生成边界

```text
PhraseManager/
├─ .github/workflows/ci.yml       GitHub Actions 构建、校验和生产依赖审计
├─ bridge/preload.js              uTools preload 桥接与导入文件处理
├─ public/                        插件清单、入口页面、图标和捐赠图片
├─ scripts/
│  ├─ clean.cjs                   清理构建产物
│  ├─ verify-locales.cjs          校验语言包覆盖率和占位符
│  └─ verify-release.cjs          校验发布目录、清单、图标和敏感文件
├─ src/
│  ├─ App.js                      主界面、编辑流程、拖拽、批量和快捷键
│  ├─ HelpDialog.js               使用说明和快捷键速查
│  ├─ components/                 引导和对话框组件
│  ├─ locales/                    运行时语言包与共享翻译
│  ├─ services/                   数据模型、导入导出、存储和同步服务
│  ├─ styles/                     MUI 主题和界面样式
│  └─ utils/                      ID、排序和视觉效果工具
├─ package.json                   npm 脚本和依赖声明
├─ package-lock.json              可复现的 npm 依赖锁定
└─ webpack.config.js              开发和生产构建配置
```

`dist/` 和 `node_modules/` 是生成或依赖目录，不应提交到仓库。发布包只从生产构建生成，仓库只保存源码、清单、脚本和必要的静态资源。

## 2. 数据模型与持久化

领域数据由三组集合组成：分组保存顶层顺序，分类通过 `所属分组编号` 关联分组，常用语通过 `所属分类编号` 关联分类。每条记录都有稳定的 `编号`、名称或内容、排序和时间字段。新建、导入、AI 结果和拖拽都会经过统一规范化，避免重复编号、孤儿分类和越界归属。

`src/services/libraryRepository.js` 负责 uTools 数据库读写，`libraryOperations.js` 负责集合变更，`librarySync.js` 负责内存状态和存储同步，`recovery.js` 负责异常恢复。备份导入使用 `transferSchema.js` 校验格式、字段和数量；外部数据不会绕过领域校验直接进入界面状态。

## 3. 本地化与语言包

运行时文案统一通过 `src/locales/index.js` 的 `t()` 获取。基础语言包位于 `src/locales/`，跨语言共用的界面、导入帮助和 AI 设置文案分别位于 `interfaceTranslations.js`、`importHelpTranslations.js` 和 `aiSettingsTranslations.js`。

新增或修改用户可见文案时，应在全部 14 个语言目录中补齐同一个键，并保持 `{name}`、`{count}` 等占位符集合一致。语言选项、系统语言解析和回退规则也必须同步检查。运行以下命令验证语言包：

```bash
npm run verify-locales
```

验证器会检查语言代码唯一性、语义键覆盖、空文案、复数形式、占位符和源码中的静态 `t()` 调用。新增语言不能只修改显示标签而不提供完整文案。

## 4. 构建、验证与发布

环境要求：Node.js 18 或更高版本，以及 npm。

```bash
npm ci
npm run dev
```

发布前执行完整流程：

```bash
npm run release:build
npm audit
```

`release:build` 会清理旧的 `dist/`，校验 14 个语言包，执行生产构建，并检查 `plugin.json` 版本、入口文件、图标、功能数量、发布目录白名单、敏感文件和常见密钥格式。构建成功后，插件清单位于 `dist/plugin.json`。

GitHub Actions 会在 `main` 推送和 Pull Request 中运行同样的构建与校验，并执行生产依赖审计。发布插件包时，将 `dist/` 内容压缩后上传到 GitHub Release；不要把 `dist/` 或本地数据库提交到 Git。

## 5. 贡献代码与安全报告

欢迎提交 Issue 和 Pull Request。提交前请：

1. 保持分组、分类、常用语的关联和持久化字段兼容；需要迁移时先补充校验和恢复路径。
2. 为用户可见文本补齐全部语言包，并运行 `npm run verify-locales`。
3. 运行 `npm run release:build` 和 `npm audit`，确认构建、发布审计和依赖安全检查通过。
4. 不要提交 `node_modules/`、`dist/`、本地数据库、导出文件、日志或任何密钥。

发现可能泄露密钥或影响用户数据安全的问题时，请先通过 GitHub 私密渠道联系维护者，不要在公开 Issue 中粘贴真实凭据或用户数据。

# Star 历史趋势

<div align="center">
  <a href="https://www.star-history.com/#realSilasYang/phrase-manager&amp;Date">
    <img src="https://api.star-history.com/svg?repos=realSilasYang/phrase-manager&amp;type=Date" alt="Phrase Manager Star 历史趋势图">
  </a>
</div>

# 许可证

本项目采用 [MIT License](./LICENSE) 开源。
