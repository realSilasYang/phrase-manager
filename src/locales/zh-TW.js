export default {
  app: { title: '常用語管理' },
  snackbar: {
    selectParentCategoryFirst: '請先選擇群組',
    categoryDeleted: '分類已刪除', categoryNameExists: '分類名稱已存在', categoryCreated: '分類已建立', categoryUpdated: '分類已更新',
    groupNameExists: '群組名稱已存在', groupCreated: '群組已建立', groupUpdated: '群組已更新', groupDeleted: '群組已刪除', noGroup: '請先建立或選擇群組',
    undone: '已復原操作',
    redone: '已重做操作',
    noChanges: '內容沒有變更', duplicatePhrase: '已有相同的常用語', phraseCreated: '常用語已建立', phraseUpdated: '變更已儲存', phraseDeleted: '常用語已刪除', titleEmpty: '標題不能留空', contentEmpty: '內容是空的', saveFailed: '儲存失敗，請再試一次', copiedToClipboard: '已複製到剪貼簿', createCategoryFirst: '請先建立分類',
    itemsDeleted: '已刪除 {count} 個項目', phrasesMoved: '已移動 {count} 則常用語', movedToTop: '已移到最上方', movedToBottom: '已移到最下方', batchMovedToTop: '已將選取項目移到最上方', batchMovedToBottom: '已將選取項目移到最下方',
    phraseCloned: '已建立常用語副本', clonedToCategory: '已複製到新分類', movedToCategory: '已移動到新分類',
    categoryCopiedToGroup: '分類已複製到新群組', categoryMovedToGroup: '分類已移動到新群組', categoriesCopiedToGroup: '已將 {count} 個分類複製到新群組', categoriesMovedToGroup: '已將 {count} 個分類移動到新群組',
    copiedToUncategorized: '已複製到「未分類」', movedToUncategorized: '已移動到「未分類」', phrasesCopiedToUncategorized: '已將 {count} 則常用語複製到「未分類」', phrasesMovedToUncategorized: '已將 {count} 則常用語移動到「未分類」',
    exportSuccess: '匯出完成', exportFailed: '匯出失敗：{error}', importSuccess: '匯入完成：{categories} 個分類、{phrases} 則常用語', importFailed: '匯入失敗：{error}', batchExportSuccess: '已匯出 {categories} 個分類、{phrases} 則常用語', iflytekImportSuccess: '已從訊飛輸入法匯入 {categories} 個分類、{phrases} 則常用語', iflytekExportSuccess: '已匯出為訊飛輸入法格式', batchMovedToGroup: '已將 {categories} 個分類、{phrases} 則常用語移到群組', guideCompleted: '新手教學完成！我們已準備好範例資料，現在就開始探索吧！', cloudUpdatedDraftPreserved: '雲端資料已更新，目前編輯中的內容不會被覆寫'
  },
  tooltip: {
    newCategory: '新增分類（Ctrl+Shift+N）', newPhrase: '新增常用語（Ctrl+N）', help: '使用說明', switchToLight: '明亮模式', switchToDark: '深色模式', import: '匯入', export: '匯出', sort: '排序', batchMode: '多選管理', selectAll: '全選／取消全選', moveToCategory: '移到分類', moveToTop: '移到最上方', moveToBottom: '移到最下方', delete: '刪除', exit: '離開', clone: '建立副本', edit: '編輯', newGroup: '新增群組', fullscreen: '全螢幕編輯', exitFullscreen: '離開全螢幕', exitEdit: '關閉編輯器', settings: '設定'
  },
  menu: {
    rename: '重新命名', moveToTop: '移到最上方', moveToBottom: '移到最下方', delete: '刪除', copyContent: '複製內容', clone: '建立副本', edit: '編輯',
    sortCustom: '自訂排序', sortUsageDesc: '使用次數（多到少）', sortUsageAsc: '使用次數（少到多）', sortCreatedDesc: '建立時間（新到舊）', sortCreatedAsc: '建立時間（舊到新）', sortUpdatedDesc: '修改時間（新到舊）', sortUpdatedAsc: '修改時間（舊到新）', sortTitleAsc: '標題（A–Z）', sortTitleDesc: '標題（Z–A）',
    newGroup: '新增群組…', newCategory: '新增分類…', exportNative: '匯出為 JSON', exportIflytek: '匯出為訊飛格式'
  },
  label: { group: '群組', category: '分類', title: '標題', content: '內容' },
  placeholder: { searchPhrase: '搜尋常用語…' },
  empty: { noCategories: '尚未建立分類', quickJump: '快速前往分類', noResults: '找不到符合的結果', noPhrases: '尚未建立常用語', noGroups: '尚未建立群組', uncategorized: '未分類' },
  defaults: { groupName: '新增群組', newGroup: '新增群組', categoryName: '新增分類', newCategory: '新增分類', uncategorized: '未分類', newPhrase: '新增常用語', copySuffix: '（副本）', iflytekGroupName: '來自訊飛輸入法', importGroupName: '匯入的資料' },
  dialog: { unsavedChanges: '尚未儲存的變更', unsavedContent: '目前內容尚未儲存。要儲存變更嗎？', unsavedContentNote: '未儲存的內容將會遺失。', discard: '不要儲存', thinkAgain: '繼續編輯', save: '儲存', exportTitle: '匯出常用語備份', exportIflytekTitle: '匯出為訊飛輸入法格式', importTitle: '匯入常用語備份', jsonFilter: 'JSON 檔案', csvFilter: 'CSV 檔案', allSupportedFilter: '支援的檔案' },
  count: { categories: '{count} 個分類', characters: '{count} 個字元', selected: '已選取 {count} 個項目', batchSelected: '已選取 {categories} 個分類、{phrases} 則常用語' },
  section: { groups: '常用語群組' },
  file: { backupName: '常用語備份-{date}.json', iflytekBackupName: '常用語備份-{date}.csv' },
  common: { cancel: '取消', apply: '套用', close: '關閉', copy: '複製', listSeparator: '、', groupSeparator: '；', labelSeparator: '：' },
  settings: { title: '設定', language: '介面語言', languageAuto: '自動（跟隨系統）', themeMode: '主題模式', themeLight: '明亮', themeDark: '柔和夜色', themeAuto: '跟隨系統', startupSelection: '啟動時開啟', startupLast: '上次瀏覽的位置', startupFirst: '排序最前的位置', previewLinesLabel: '卡片預覽行數', previewLines: '卡片預覽行數：{count}', aiModel: 'AI 模型', defaultAiModel: '預設模型', aiPrompts: 'AI 提示詞', aiCategorizePrompt: 'AI 分類提示詞', aiTitlePrompt: 'AI 標題提示詞', aiContentPrompt: 'AI 內容提示詞', updated: '已更新：{items}' },
  ai: {
    categorize: 'AI 自動分類', generateTitle: 'AI 產生標題', generateContent: 'AI 產生內容', optimizeContent: 'AI 優化內容', themeGeneration: 'AI 主題生成', newGeneration: '全新生成', optimizeExisting: '優化現有內容', useAsTheme: '以此為主題', optimizeDescription: 'AI 會讓現有內容更專業、清楚。', extraRequirementsLabel: '其他要求（選填）', descriptionLabel: '描述你需要的內容', extraRequirementsPlaceholder: '例如：使用更正式的語氣，並加入感謝語…', descriptionPlaceholder: '例如：一封婉拒加班的郵件，或一段感謝客戶的文字…', contentApplied: '內容已套用', generating: '生成中…', startOptimize: '開始優化', generate: '生成', inputRequired: '請先輸入內容', titleGenerated: '標題已生成', categorized: '已分類到：{group} / {category}', categorizedCategory: '已分類到：{category}', categoryNotFound: '找不到分類：{category}', groupNotFound: '找不到群組：{group}', noSuggestion: 'AI 找不到合適的分類', callFailed: 'AI 請求失敗',
    prompt: { optimizeSystem: '你是一名專業的文案編輯。請在不改變原意的前提下，讓使用者提供的文字更專業、清楚且有條理。只輸出修改後的內容，不要加入說明。', themeSystem: '你是一名專業的文案助手。使用者會提供一段現有內容作為主題，請依照該主題撰寫一段全新且專業的常用語。只輸出生成內容，不要加入說明。', themeUser: '主題內容：\n{content}\n\n請依照以上主題生成新內容。{extra}', extraRequirements: '\n其他要求：{prompt}', generateSystem: '你是一名專業的文案助手。請依照使用者的描述，撰寫簡潔且專業的常用語。只輸出生成內容，不要加入說明。', categorizeSystem: '你是一名分類助手。請依照內容，從以下群組與分類中選擇最合適的分類。\n群組結構：{structure}\n只輸出以下 JSON 格式，不要輸出其他內容：{"分组":"群組名稱","分类":"分類名稱"}', titleSystem: '你是一名標題助手。請依照內容產生簡短、準確的標題（不超過 15 個字）。只輸出標題，不要加入說明。' }
  },
  accessibility: { copyPhrase: '{title}，按 Enter 鍵複製內容' },
  dynamic: { group: '群組', category: '分類', phrase: '常用語', explain: '開啟或複製常用語' },
  error: { emptyFile: '檔案是空的', uncaught: '未攔截的錯誤', unhandledPromise: '未處理的非同步錯誤', renderTitle: 'React 轉譯錯誤' },
  help: {
    sectionHierarchy: '📚 資料層級', hierarchyGroup: '群組', hierarchyGroupDesc: '最上層', hierarchyCategory: '分類', hierarchyCategoryDesc: '整理用資料夾', hierarchyPhrase: '常用語', hierarchyPhraseDesc: '實際內容',
    sectionFeatures: '✨ 功能介紹', featureCopyTitle: '一鍵複製', featureCopyDesc: '按一下任何卡片，即可將內容複製到剪貼簿並直接貼上使用。', featureEditTitle: '快速編輯', featureEditDesc: '將滑鼠移到卡片上，按 {key} 即可立即編輯。', featureDeleteTitle: '刪除與復原', featureDeleteDesc: '滑鼠停留時按 {delKey} 刪除，或按 {ctrlKey}+{zKey} 復原。', featureDragTitle: '拖曳移動', featureDragDesc: '將卡片拖到目標分類；按住 {key} 拖曳則會複製。', featureSearchTitle: '全域搜尋', featureSearchDesc: '搜尋所有群組，按一下結果即可直接前往。', featureBatchTitle: '多選管理', featureBatchDesc: '按搜尋列右側的方框圖示，可選取多個項目後一起刪除、移動或匯出。', featurePreviewTitle: '預覽模式', featurePreviewDesc: '滑鼠移到卡片上時按一下 {key} 可切換預覽模式，再用上下方向鍵切換卡片。', featureAutoSaveTitle: '自動儲存', featureAutoSaveDesc: '編輯後按一下空白處或切換卡片，內容就會自動儲存。', featureThemeTitle: '主題模式', featureThemeDesc: '開啟設定，可選擇明亮、深色或跟隨系統的主題。',
    sectionShortcuts: '⌨️ 鍵盤快速鍵', shortcutNewPhrase: '新增常用語', shortcutNewCategory: '新增分類', shortcutFocusSearch: '移到搜尋列', shortcutForceSave: '立即儲存', shortcutUndo: '復原操作', shortcutRedo: '重做操作', shortcutSelectAll: '全選（多選模式）', shortcutClone: '建立指向項目的副本', shortcutCopy: '複製指向項目', shortcutEdit: '編輯指向項目', shortcutDelete: '刪除指向項目', shortcutEscape: '離開／取消', shortcutFullscreen: '全螢幕編輯', shortcutPreview: '切換預覽模式', shortcutDragCopy: '複製到目標', dragAction: '拖曳', startGuide: '開始新手教學'
  },
  guide: {
    steps: {
      step1Title: '🗂️ 群組管理（最上層）', step1Message: '群組可將不同類型的工作情境分開管理。\n\n• {bold:新增}：按一下上方的 {key:+} 按鈕。\n• {bold:切換}：按一下群組即可顯示其中的分類。\n• {bold:排序}：按住群組並左右拖曳。\n• {bold:更多}：在群組上按滑鼠右鍵，可{bold:重新命名}、{bold:刪除}或調整位置。',
      step2Title: '📂 分類導覽與選單', step2Message: '這裡會列出目前群組中的所有分類。\n\n• {bold:右鍵選單}：在分類上按滑鼠右鍵，可{bold:重新命名}、{bold:移到最上方}或{bold:刪除}。\n• {bold:快速重新命名}：選取分類後按 {key:F2}。\n• {bold:拖曳管理}：上下拖曳可排序；拖到其他群組上則可跨群組移動。',
      step3Title: '📝 常用語主要操作', step3Message: '這是主要工作區。\n\n• {bold:一鍵複製}：按一下卡片即可複製內容。\n• {bold:快速鍵}：\n   - {key:Ctrl} + {key:C} 複製\n   - {key:Ctrl} + {key:D} 建立副本\n   - {key:Del} 刪除選取項目\n• {bold:拖曳排序}：直接上下拖曳卡片。\n• {bold:跨分類移動}：把卡片拖到左側分類；按住 {key:Ctrl} 拖曳則會複製。\n• {bold:預覽}：滑鼠移到卡片上時按一下 {key:Space}，再用上下方向鍵切換。',
      step4Title: '🔍 搜尋與多選模式', step4Message: '頂端工具列可快速存取所有內容。\n\n• {bold:全域搜尋}（{key:Ctrl} + {key:F}）：搜尋所有群組，按一下結果即可前往。\n• {bold:多選管理}：按右側的方框圖示。\n   - 按住 {key:Shift} 可連續選取\n   - 使用底部工具列{bold:刪除}、{bold:移動}或{bold:匯出}選取的資料。',
      step5Title: '⚙️ 備份與設定', step5Message: '底部工具列提供重要功能。\n\n• {bold:匯入／匯出}：建議定期匯出 JSON 備份，避免資料遺失。\n• {bold:設定}：調整語言、主題、啟動位置與卡片預覽行數。\n• {bold:說明}：按問號可再次開啟本教學。'
    },
    controls: { skip: '略過', back: '上一步', next: '下一步', finish: '完成' },
    demo: { groupName: '✨ 新手教學群組', categoryName: '📝 範例分類', phraseTitle: '👋 歡迎使用！', phraseContent: '這是一則範例常用語。試著按一下複製，或拖曳看看！', phraseTitle2: '⌨️ 快速鍵技巧', phraseContent2: '選取我後按 Ctrl+C 複製、Ctrl+D 建立副本，或按 Delete 刪除。', phraseTitle3: '🖱️ 拖曳與移動', phraseContent3: '按住我可以排序，也可以拖到左側其他分類。' }
  }
}
