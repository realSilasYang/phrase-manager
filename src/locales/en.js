export default {
  app: { title: 'Phrase Manager' },
  snackbar: {
    selectParentCategoryFirst: 'Select a group first',
    categoryDeleted: 'Category deleted', categoryNameExists: 'A category with this name already exists', categoryCreated: 'Category created', categoryUpdated: 'Category updated',
    groupNameExists: 'A group with this name already exists', groupCreated: 'Group created', groupUpdated: 'Group updated', groupDeleted: 'Group deleted', noGroup: 'Create or select a group first',
    undone: 'Action undone',
    redone: 'Action redone',
    noChanges: 'No changes to save', duplicatePhrase: 'An identical phrase already exists', phraseCreated: 'Phrase created', phraseUpdated: 'Changes saved', phraseDeleted: 'Phrase deleted', titleEmpty: 'The title cannot be empty', contentEmpty: 'The content is empty', saveFailed: 'Saving failed. Please try again.', copiedToClipboard: 'Copied to the clipboard', createCategoryFirst: 'Create a category first',
    itemsDeleted: { one: '{count} item deleted', other: '{count} items deleted' },
    phrasesMoved: { one: '{count} phrase moved', other: '{count} phrases moved' },
    movedToTop: 'Moved to the top', movedToBottom: 'Moved to the bottom', batchMovedToTop: 'Selected items moved to the top', batchMovedToBottom: 'Selected items moved to the bottom',
    phraseCloned: 'Phrase duplicated', clonedToCategory: 'Copied to the new category', movedToCategory: 'Moved to the new category',
    categoryCopiedToGroup: 'Category copied to the new group', categoryMovedToGroup: 'Category moved to the new group',
    categoriesCopiedToGroup: { one: '{count} category copied to the new group', other: '{count} categories copied to the new group' },
    categoriesMovedToGroup: { one: '{count} category moved to the new group', other: '{count} categories moved to the new group' },
    copiedToUncategorized: 'Copied to “Uncategorized”', movedToUncategorized: 'Moved to “Uncategorized”',
    phrasesCopiedToUncategorized: { one: '{count} phrase copied to “Uncategorized”', other: '{count} phrases copied to “Uncategorized”' },
    phrasesMovedToUncategorized: { one: '{count} phrase moved to “Uncategorized”', other: '{count} phrases moved to “Uncategorized”' },
    exportSuccess: 'Export complete', exportFailed: 'Export failed: {error}',
    importSuccess: 'Import complete. Categories: {categories}; phrases: {phrases}', importFailed: 'Import failed: {error}',
    batchExportSuccess: 'Export complete. Categories: {categories}; phrases: {phrases}',
    iflytekImportSuccess: 'iFlytek import complete. Categories: {categories}; phrases: {phrases}',
    iflytekExportSuccess: 'Exported in iFlytek Input format',
    batchMovedToGroup: 'Moved to group. Categories: {categories}; phrases: {phrases}',
    guideCompleted: 'Tutorial complete! We added some sample data so you can explore the app.',
    cloudUpdatedDraftPreserved: 'Cloud data was updated. Your current draft has not been overwritten.'
  },
  tooltip: {
    newCategory: 'New category (Ctrl+Shift+N)', newPhrase: 'New phrase (Ctrl+N)', help: 'Help', switchToLight: 'Light theme', switchToDark: 'Dark theme',
    import: 'Import', export: 'Export', sort: 'Sort', batchMode: 'Select multiple', selectAll: 'Select all / Clear selection', moveToCategory: 'Move to category', moveToTop: 'Move to top', moveToBottom: 'Move to bottom', delete: 'Delete', exit: 'Exit', clone: 'Duplicate', edit: 'Edit', newGroup: 'New group', fullscreen: 'Full-screen editor', exitFullscreen: 'Exit full screen', exitEdit: 'Close editor', settings: 'Settings'
  },
  menu: {
    rename: 'Rename', moveToTop: 'Move to top', moveToBottom: 'Move to bottom', delete: 'Delete', copyContent: 'Copy content', clone: 'Duplicate', edit: 'Edit',
    sortCustom: 'Custom order', sortUsageDesc: 'Most used first', sortUsageAsc: 'Least used first', sortCreatedDesc: 'Newest first', sortCreatedAsc: 'Oldest first', sortUpdatedDesc: 'Recently edited first', sortUpdatedAsc: 'Least recently edited first', sortTitleAsc: 'Title (A–Z)', sortTitleDesc: 'Title (Z–A)',
    newGroup: 'New group…', newCategory: 'New category…', exportNative: 'Export as JSON', exportIflytek: 'Export for iFlytek Input'
  },
  label: { group: 'Group', category: 'Category', title: 'Title', content: 'Content' },
  placeholder: { searchPhrase: 'Search phrases…' },
  empty: { noCategories: 'No categories yet', quickJump: 'Jump to category', noResults: 'No matches', noPhrases: 'No phrases yet', noGroups: 'No groups yet', uncategorized: 'Uncategorized' },
  defaults: { groupName: 'New group', newGroup: 'New group', categoryName: 'New category', newCategory: 'New category', uncategorized: 'Uncategorized', newPhrase: 'New phrase', copySuffix: ' (copy)', iflytekGroupName: 'From iFlytek Input', importGroupName: 'Imported data' },
  dialog: { unsavedChanges: 'Unsaved changes', unsavedContent: 'This content has not been saved. Save your changes?', unsavedContentNote: 'Any unsaved changes will be lost.', discard: 'Discard', thinkAgain: 'Keep editing', save: 'Save', exportTitle: 'Export phrase backup', exportIflytekTitle: 'Export for iFlytek Input', importTitle: 'Import phrase backup', jsonFilter: 'JSON files', csvFilter: 'CSV files', allSupportedFilter: 'Supported files' },
  count: {
    categories: { one: '{count} category', other: '{count} categories' },
    characters: { one: '{count} character', other: '{count} characters' },
    selected: { one: '{count} item selected', other: '{count} items selected' },
    batchSelected: 'Selected — categories: {categories}; phrases: {phrases}'
  },
  section: { groups: 'Phrase groups' },
  file: { backupName: 'phrase-backup-{date}.json', iflytekBackupName: 'phrase-backup-{date}.csv' },
  common: { cancel: 'Cancel', apply: 'Apply', close: 'Close', copy: 'Copy', listSeparator: ', ', groupSeparator: '; ', labelSeparator: ': ' },
  settings: {
    title: 'Settings', language: 'Display language', languageAuto: 'Automatic (system language)', themeMode: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeAuto: 'Use system setting', startupSelection: 'Open at startup', startupLast: 'Last viewed location', startupFirst: 'First item in order', previewLinesLabel: 'Card preview lines', previewLines: 'Card preview lines: {count}', aiModel: 'AI model', defaultAiModel: 'Default model', aiPrompts: 'AI prompts', aiCategorizePrompt: 'Categorization prompt', aiTitlePrompt: 'Title prompt', aiContentPrompt: 'Content prompt', updated: 'Updated: {items}'
  },
  ai: {
    categorize: 'Categorize with AI', generateTitle: 'Generate title with AI', generateContent: 'Generate content with AI', optimizeContent: 'Improve content with AI', themeGeneration: 'Generate from a theme', newGeneration: 'Create new', optimizeExisting: 'Improve existing text', useAsTheme: 'Use as theme', optimizeDescription: 'AI will make the existing content clearer and more professional.', extraRequirementsLabel: 'Additional instructions (optional)', descriptionLabel: 'Describe the content you need', extraRequirementsPlaceholder: 'For example: use a more formal tone and add a thank-you…', descriptionPlaceholder: 'For example: an email declining overtime, or a note thanking a client…', contentApplied: 'Content applied', generating: 'Generating…', startOptimize: 'Improve', generate: 'Generate', inputRequired: 'Enter some content first', titleGenerated: 'Title generated', categorized: 'Categorized under {group} / {category}', categorizedCategory: 'Categorized under {category}', categoryNotFound: 'Category not found: {category}', groupNotFound: 'Group not found: {group}', noSuggestion: 'AI could not find a suitable category', callFailed: 'AI request failed',
    prompt: {
      optimizeSystem: 'You are a professional copy editor. Improve the user’s text so it is clear, polished, and well structured without changing its meaning. Output only the revised text, with no commentary.',
      themeSystem: 'You are a professional writing assistant. The user will provide existing text as a theme. Write a new, polished reusable phrase based on that theme. Output only the new text, with no commentary.',
      themeUser: 'Theme:\n{content}\n\nWrite new content based on this theme.{extra}',
      extraRequirements: '\nAdditional instructions: {prompt}',
      generateSystem: 'You are a professional writing assistant. Write a concise, polished reusable phrase based on the user’s description. Output only the generated text, with no commentary.',
      categorizeSystem: 'You are a classification assistant. Choose the most suitable category from the group and category structure below.\nStructure: {structure}\nReturn only JSON in this exact format: {"分组":"group name","分类":"category name"}',
      titleSystem: 'You are a title-writing assistant. Write a short, accurate title for the content, no longer than 15 words. Output only the title.'
    }
  },
  accessibility: { copyPhrase: '{title}. Press Enter to copy the content.' },
  dynamic: { group: 'Group', category: 'Category', phrase: 'Phrase', explain: 'Open or copy a phrase' },
  error: { emptyFile: 'The file is empty', uncaught: 'Uncaught error', unhandledPromise: 'Unhandled asynchronous error', renderTitle: 'React rendering error' },
  help: {
    sectionHierarchy: '📚 How your data is organized', hierarchyGroup: 'Group', hierarchyGroupDesc: 'Top level', hierarchyCategory: 'Category', hierarchyCategoryDesc: 'Organizing folder', hierarchyPhrase: 'Phrase', hierarchyPhraseDesc: 'Reusable content',
    sectionFeatures: '✨ Features', featureCopyTitle: 'Copy in one click', featureCopyDesc: 'Click any card to copy its content to the clipboard, ready to paste.', featureEditTitle: 'Quick editing', featureEditDesc: 'Hover over a card and press {key} to edit it immediately.', featureDeleteTitle: 'Delete and undo', featureDeleteDesc: 'While hovering, press {delKey} to delete or {ctrlKey}+{zKey} to undo.', featureDragTitle: 'Drag to move', featureDragDesc: 'Drag a card to another category. Hold {key} while dragging to copy it instead.', featureSearchTitle: 'Search everywhere', featureSearchDesc: 'Search across every group, then click a result to jump straight to it.', featureBatchTitle: 'Multiple selection', featureBatchDesc: 'Use the square icon beside the search box to select, delete, move, or export multiple items.', featurePreviewTitle: 'Preview mode', featurePreviewDesc: 'Hover over a card and press {key} once to toggle preview mode. Use the Up and Down arrow keys to move between cards.', featureAutoSaveTitle: 'Automatic saving', featureAutoSaveDesc: 'After editing, click outside the editor or switch cards to save automatically.', featureThemeTitle: 'Theme', featureThemeDesc: 'Open Settings to choose a light or dark theme, or follow the system setting.',
    sectionShortcuts: '⌨️ Keyboard shortcuts', shortcutNewPhrase: 'New phrase', shortcutNewCategory: 'New category', shortcutFocusSearch: 'Focus search', shortcutForceSave: 'Save now', shortcutUndo: 'Undo', shortcutRedo: 'Redo', shortcutSelectAll: 'Select all (selection mode)', shortcutClone: 'Duplicate hovered item', shortcutCopy: 'Copy hovered item', shortcutEdit: 'Edit hovered item', shortcutDelete: 'Delete hovered item', shortcutEscape: 'Exit / Cancel', shortcutFullscreen: 'Full-screen editor', shortcutPreview: 'Toggle preview mode', shortcutDragCopy: 'Copy to destination', dragAction: 'Drag', startGuide: 'Start tutorial'
  },
  guide: {
    steps: {
      step1Title: '🗂️ Groups (top level)',
      step1Message: 'Groups keep broad areas of work separate.\n\n• {bold:Create}: click the {key:+} button above.\n• {bold:Switch}: click a group to show its categories.\n• {bold:Reorder}: press and drag a group left or right.\n• {bold:More}: right-click a group to {bold:rename}, {bold:delete}, or change its position.',
      step2Title: '📂 Categories and their menu',
      step2Message: 'This column lists the categories in the current group.\n\n• {bold:Context menu}: right-click a category to {bold:rename}, {bold:move to top}, or {bold:delete} it.\n• {bold:Quick rename}: select a category and press {key:F2}.\n• {bold:Drag and drop}: drag up or down to reorder, or drop it on another group to move it there.',
      step3Title: '📝 Working with phrases',
      step3Message: 'This is your main workspace.\n\n• {bold:Copy}: click a card to copy its content.\n• {bold:Shortcuts}:\n   - {key:Ctrl} + {key:C} copies\n   - {key:Ctrl} + {key:D} duplicates\n   - {key:Del} deletes the selected item\n• {bold:Reorder}: drag cards up or down.\n• {bold:Move between categories}: drop a card on a category at the left; hold {key:Ctrl} while dragging to copy it instead.\n• {bold:Preview}: hover over a card and press {key:Space} once, then use the Up and Down arrow keys.',
      step4Title: '🔍 Search and multiple selection',
      step4Message: 'The top toolbar gives you access to everything.\n\n• {bold:Global search} ({key:Ctrl} + {key:F}): find content in every group and click a result to jump to it.\n• {bold:Multiple selection}: click the square icon on the right.\n   - Hold {key:Shift} to select a range\n   - Use the bottom toolbar to {bold:delete}, {bold:move}, or {bold:export} selected data.',
      step5Title: '⚙️ Backups and settings',
      step5Message: 'The bottom toolbar keeps essential tools close by.\n\n• {bold:Import / Export}: export a JSON backup regularly to protect your data.\n• {bold:Settings}: choose the language, theme, startup location, and number of preview lines.\n• {bold:Help}: click the question mark to open this tutorial again.'
    },
    controls: { skip: 'Skip', back: 'Back', next: 'Next', finish: 'Finish' },
    demo: { groupName: '✨ Tutorial group', categoryName: '📝 Sample category', phraseTitle: '👋 Welcome!', phraseContent: 'This is a sample phrase. Click it to copy, or try dragging it.', phraseTitle2: '⌨️ Keyboard shortcuts', phraseContent2: 'Select me, then press Ctrl+C to copy, Ctrl+D to duplicate, or Delete to remove.', phraseTitle3: '🖱️ Drag and move', phraseContent3: 'Press and drag me to reorder, or drop me on another category at the left.' }
  }
}
