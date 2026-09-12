<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Phrase Manager logo">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <strong>English</strong> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>Phrase Manager</h1>
  <p><strong>Manage reusable phrases, text snippets, and knowledge entries locally in uTools, with AI assistance and a multilingual interface</strong></p>
</div>

Phrase Manager is a local uTools plugin for organizing reusable text. It uses a Category → Group → Phrase hierarchy for support replies, work templates, prompts, code snippets, and notes. Data is stored in the uTools local database and can be backed up as JSON.

## Features

- Create, rename, delete, reorder, move, and copy categories, groups, and phrases
- Search, preview, keyboard shortcuts, batch actions, undo, and redo
- JSON backup and restore, iFlytek phrase CSV import/export, and AI-assisted import
- AI content generation, title generation, categorization, and content optimization
- Dark mode, local font selection, responsive editing, and local-first storage

## Quick start

1. Download and extract the [latest release](https://github.com/realSilasYang/phrase-manager/releases/latest).
2. Open the uTools developer tools and load `plugin.json` from the extracted folder.
3. Search for “常用语”, `Phrase Manager`, or `Phrases` in uTools.
4. Click “New category” or “New category…” in the dropdown. Categories are the top level; each category contains groups, and both names are customizable before creation.

## Shortcuts

| Key | Action |
| --- | --- |
| `Ctrl+N` | Create a phrase |
| `Ctrl+Shift+N` | Create a category |
| `Ctrl+F` | Focus search |
| `Ctrl+S` | Save the current phrase |
| `Ctrl+Z` / `Ctrl+Y` | Undo / redo |
| `F2` | Rename the hovered group or category |
| `Delete` | Delete the hovered item |
| `Space` | Toggle preview mode |

## Supported languages

The interface includes Simplified Chinese, Hong Kong Traditional Chinese, Taiwan Traditional Chinese, English, Japanese, Vietnamese, Korean, Spanish, French, Brazilian Portuguese, European Portuguese, Russian, German, and Italian. Automatic mode follows the system language and falls back to Simplified Chinese when no match is available.

## Development

```bash
npm ci
npm run dev
npm run release:build
```

`release:build` checks all locale bundles, creates the production build, and audits the plugin manifest and release directory. See the [full Simplified Chinese guide](../README.md) for the complete user and developer documentation.

## Privacy and license

Normal editing, search, import, and export stay local. Text is sent to the uTools-configured AI service only when an AI feature is used. The project is released under the [MIT License](../LICENSE).
