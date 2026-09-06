import zhTW from './zh-TW'
import { mergeLocale } from './mergeLocale'

export default mergeLocale(zhTW, {
  app: { title: '常用語管理' },
  snackbar: {
    redone: '已重做操作',
    noChanges: '內容沒有變更', phraseCreated: '常用語已新增', titleEmpty: '標題不能留空', saveFailed: '儲存失敗，請再試一次', copiedToClipboard: '已複製到剪貼簿',
    phrasesMoved: '已移動 {count} 條常用語', phrasesCopiedToUncategorized: '已將 {count} 條常用語複製到「未分類」', phrasesMovedToUncategorized: '已將 {count} 條常用語移動到「未分類」',
    importSuccess: '匯入完成：{categories} 個分類、{phrases} 條常用語', batchExportSuccess: '已匯出 {categories} 個分類、{phrases} 條常用語', iflytekImportSuccess: '已從訊飛輸入法匯入 {categories} 個分類、{phrases} 條常用語', batchMovedToGroup: '已將 {categories} 個分類、{phrases} 條常用語移到群組', cloudUpdatedDraftPreserved: '雲端資料已更新，目前編輯中的內容不會被覆蓋'
  },
  tooltip: { fullscreen: '全螢幕編輯', exitFullscreen: '離開全螢幕', exitEdit: '關閉編輯器' },
  empty: { noCategories: '尚未新增分類', noPhrases: '尚未新增常用語', noGroups: '尚未新增群組' },
  defaults: { newPhrase: '新增常用語', copySuffix: '（複本）', importGroupName: '匯入資料' },
  dialog: { thinkAgain: '繼續編輯', allSupportedFilter: '支援的檔案' },
  count: { characters: '{count} 個字元', batchSelected: '已選取 {categories} 個分類、{phrases} 條常用語' },
  settings: { language: '界面語言', themeLight: '明亮', themeDark: '柔和夜色', startupFirst: '排序最前的位置', defaultAiModel: '預設模型', aiPrompts: 'AI 提示詞', aiCategorizePrompt: 'AI 分類提示詞', aiTitlePrompt: 'AI 標題提示詞', aiContentPrompt: 'AI 內容提示詞' },
  ai: {
    optimizeDescription: 'AI 會令現有內容更專業、清晰。', descriptionLabel: '描述你需要的內容', extraRequirementsPlaceholder: '例如：使用更正式的語氣，並加上感謝語…', descriptionPlaceholder: '例如：一封婉拒加班的電郵，或一段感謝客戶的文字…',
    prompt: { optimizeSystem: '你是一名專業的文案編輯。請在不改變原意的前提下，令用戶提供的文字更專業、清晰而有條理。只輸出修改後的內容，不要加入說明。', themeSystem: '你是一名專業的文案助手。用戶會提供一段現有內容作為主題，請按該主題撰寫一段全新而專業的常用語。只輸出生成內容，不要加入說明。', generateSystem: '你是一名專業的文案助手。請按用戶的描述，撰寫簡潔而專業的常用語。只輸出生成內容，不要加入說明。' }
  },
  error: { renderTitle: 'React 渲染錯誤' },
  help: {
    shortcutRedo: '重做操作',
    hierarchyCategoryDesc: '整理用文件夾', featureCopyDesc: '點擊任何卡片，即可將內容複製到剪貼簿並直接貼上使用。', featureEditDesc: '將滑鼠移到卡片上，按 {key} 即可立即編輯。', featureSearchDesc: '搜尋所有群組，點擊結果即可直接前往。', featureBatchDesc: '點擊搜尋列右側的方框圖示，可選取多個項目後一併刪除、移動或匯出。', featurePreviewDesc: '滑鼠移到卡片上時按一下 {key} 可切換預覽模式，再用上下方向鍵切換卡片。', featureAutoSaveDesc: '編輯後點擊空白位置或切換卡片，內容便會自動儲存。', shortcutFullscreen: '全螢幕編輯',
    sectionShortcuts: '⌨️ 鍵盤快捷鍵'
  },
  guide: {
    steps: {
      step1Message: '群組可將不同類型的工作情境分開管理。\n\n• {bold:新增}：點擊上方的 {key:+} 按鈕。\n• {bold:切換}：點擊群組即可顯示其中的分類。\n• {bold:排序}：按住群組並左右拖曳。\n• {bold:更多}：在群組上按滑鼠右鍵，可{bold:重新命名}、{bold:刪除}或調整位置。',
      step2Message: '此處會列出目前群組中的所有分類。\n\n• {bold:右鍵選單}：在分類上按滑鼠右鍵，可{bold:重新命名}、{bold:移到最上方}或{bold:刪除}。\n• {bold:快速重新命名}：選取分類後按 {key:F2}。\n• {bold:拖曳管理}：上下拖曳可排序；拖到其他群組上則可跨群組移動。',
      step3Message: '這是主要工作區。\n\n• {bold:一鍵複製}：點擊卡片即可複製內容。\n• {bold:快捷鍵}：\n   - {key:Ctrl} + {key:C} 複製\n   - {key:Ctrl} + {key:D} 建立複本\n   - {key:Del} 刪除選取項目\n• {bold:拖曳排序}：直接上下拖曳卡片。\n• {bold:跨分類移動}：把卡片拖到左側分類；按住 {key:Ctrl} 拖曳則會複製。\n• {bold:預覽}：滑鼠移到卡片上時按一下 {key:Space}，再用上下方向鍵切換。',
      step4Message: '頂部工具列可快速存取所有內容。\n\n• {bold:全域搜尋}（{key:Ctrl} + {key:F}）：搜尋所有群組，點擊結果即可前往。\n• {bold:多選管理}：點擊右側的方框圖示。\n   - 按住 {key:Shift} 可連續選取\n   - 使用底部工具列{bold:刪除}、{bold:移動}或{bold:匯出}選取的資料。'
    },
    demo: { phraseContent: '這是一條範例常用語。試試點擊複製，或拖曳看看！' }
  }
})
