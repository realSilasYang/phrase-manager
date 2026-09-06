<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Phrase Manager 標誌">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <strong>繁體中文（台灣）</strong> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <a href="./README.vi.md">Tiếng Việt</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>常用語管理 - Phrase Manager</h1>
  <p><strong>在 uTools 本機管理常用語、文字片段與知識條目，支援 AI 輔助與多語言介面</strong></p>
</div>

常用語管理是一款執行於 uTools 的本地文字管理外掛，使用「分組 → 分類 → 常用語」整理客服回覆、工作範本、提示詞、程式碼片段與筆記。資料預設儲存在 uTools 本地資料庫，可匯出 JSON 備份。

## 功能

- 建立、重新命名、刪除與排序分組、分類和常用語
- 搜尋、預覽、複製、拖曳移動、跨分組複製與批次管理
- JSON 備份還原、訊飛輸入法 CSV 匯入匯出與 AI 智慧匯入
- AI 生成內容、標題、分類和內容最佳化
- 深色模式、本機字型、復原重做與響應式編輯

## 快速開始

1. 從 [v1.0.5 Release](https://github.com/realSilasYang/phrase-manager/releases/tag/v1.0.5) 下載並解壓外掛包。
2. 在 uTools 開發者工具載入解壓目錄中的 `plugin.json`。
3. 在 uTools 搜尋「常用語」或 `Phrase Manager` 開啟外掛。
4. 點擊「新建分組」或下拉選單中的「新建分組…」開始整理；建立時會先讓你輸入自訂名稱。

## 常用快速鍵

| 按鍵 | 操作 |
| --- | --- |
| `Ctrl+N` | 新建常用語 |
| `Ctrl+Shift+N` | 新建分類 |
| `Ctrl+F` | 聚焦搜尋 |
| `Ctrl+S` | 儲存目前常用語 |
| `Ctrl+Z` / `Ctrl+Y` | 復原 / 重做 |
| `F2` | 重新命名懸停中的分組或分類 |
| `Delete` | 刪除懸停中的項目 |
| `Space` | 切換預覽模式 |

## 支援語言

介面支援簡體中文、香港繁體、台灣繁體、英語、日語、越南語、韓語、西班牙語、法語、巴西葡萄牙語、葡萄牙葡萄牙語、俄語、德語與義大利語。選擇「自動」時會跟隨系統語言，無法匹配時回退至簡體中文。

## 開發

```bash
npm ci
npm run dev
npm run release:build
```

`release:build` 會驗證語言包、建立生產版本並檢查外掛清單與發佈檔案。詳情請參閱[簡體中文完整指南](../README.md)。

## 隱私與授權

一般操作均在本機完成。只有使用 AI 時，相關文字才會傳送到 uTools 設定的 AI 服務。專案採用 [MIT License](../LICENSE) 開源。
