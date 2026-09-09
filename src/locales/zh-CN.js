/**
 * 简体中文语言包
 * 集中管理所有 UI 字符串
 */

export default {
    app: { title: '常用语管理' },
    // ==================== 提示消息 ====================
    snackbar: {
        // 分类相关
        selectParentCategoryFirst: '请先选择一个分类',
        categoryDeleted: '分组已删除',
        categoryNameExists: '分组名称已存在',
        categoryCreated: '分组已创建',
        categoryUpdated: '分组已更新',

        // 分组相关
        groupNameExists: '分类名称已存在',
        groupCreated: '分类已创建',
        groupUpdated: '分类已更新',
        groupDeleted: '分类已删除',
        noGroup: '请先创建或选择一个分类',

        // 撤销
        undone: '已撤销操作',
        redone: '已重做操作',

        // 常用语相关
        noChanges: '内容没有变动喔~',
        duplicatePhrase: '已存在相同的常用语',
        phraseCreated: '常用语已创建',
        phraseUpdated: '修改成功！',
        phraseDeleted: '常用语已删除',
        titleEmpty: '标题不能为空',
        contentEmpty: '内容为空',
        saveFailed: '保存失败，请重试',
        copiedToClipboard: '已复制到剪贴板',
        createCategoryFirst: '请先创建分组',

        // 批量操作
        itemsDeleted: '已删除 {count} 项',
        phrasesMoved: '已移动 {count} 个常用语',
        movedToTop: '已置顶',
        movedToBottom: '已置底',
        batchMovedToTop: '已置顶选中的项目',
        batchMovedToBottom: '已置底选中的项目',

        // 克隆
        phraseCloned: '已克隆常用语',
        clonedToCategory: '已克隆到新分组',
        movedToCategory: '已移动到新分组',

        // 分类/分组拖拽
        categoryCopiedToGroup: '分组已复制到新分类',
        categoryMovedToGroup: '分组已移动到新分类',
        categoriesCopiedToGroup: '已复制 {count} 个分组到新分类',
        categoriesMovedToGroup: '已移动 {count} 个分组到新分类',
        copiedToUncategorized: '已复制到"未分组"',
        movedToUncategorized: '已移动到"未分组"',
        phrasesCopiedToUncategorized: '已复制 {count} 条常用语到"未分组"',
        phrasesMovedToUncategorized: '已移动 {count} 条常用语到"未分组"',

        // 导入导出
        exportSuccess: '导出成功',
        exportFailed: '导出失败: {error}',
        importSuccess: '导入了 {categories} 个分组，{phrases} 个常用语',
        importFailed: '导入失败: {error}',
        importApplied: '已导入 {groups} 个分类、{categories} 个分组、{phrases} 条常用语，跳过 {duplicates} 个重复项',
        batchExportSuccess: '已导出 {categories} 个分组，{phrases} 个常用语',
        iflytekImportSuccess: '从讯飞输入法导入了 {categories} 个分组，{phrases} 个常用语',
        iflytekExportSuccess: '已导出为讯飞输入法格式',
        batchMovedToGroup: '已移动 {categories} 个分组，{phrases} 个常用语到分类',
        guideCompleted: '新手引导已完成，演示数据已清除，您的真实数据未被修改。',
        cloudUpdatedDraftPreserved: '云端数据已更新，当前编辑内容暂未覆盖',
        guideDemoReadOnly: '这是隔离的只读演示数据，不会修改您的真实数据',
    },

    // ==================== 悬浮提示 ====================
    tooltip: {
        newCategory: '新建分组（Ctrl+Shift+N）',
        newPhrase: '新建常用语（Ctrl+N）',
        help: '使用说明',
        switchToLight: '天光大亮',
        switchToDark: '夜色温柔',
        import: '导入',
        export: '导出',
        sort: '排序',
        batchMode: '批量管理',
        selectAll: '全选/取消全选',
        moveToCategory: '移动到分类',
        moveToTop: '置顶',
        moveToBottom: '置底',
        delete: '删除',
        exit: '退出',
        clone: '克隆',
        edit: '编辑',
        newGroup: '新建分类',
        fullscreen: '全屏编辑',
        exitFullscreen: '退出全屏',
        exitEdit: '退出编辑',
        settings: '设置',
        more: '更多操作',
    },

    // ==================== 菜单项 ====================
    menu: {
        rename: '重命名',
        moveToTop: '置顶',
        moveToBottom: '置底',
        delete: '删除',
        copyContent: '复制内容',
        clone: '克隆',
        edit: '编辑',

        // 排序选项
        sortCustom: '自定义排序',
        sortUsageDesc: '使用次数（从多到少）',
        sortUsageAsc: '使用次数（从少到多）',
        sortCreatedDesc: '创建时间（从新到旧）',
        sortCreatedAsc: '创建时间（从旧到新）',
        sortUpdatedDesc: '修改时间（从新到旧）',
        sortUpdatedAsc: '修改时间（从旧到新）',
        sortTitleAsc: '首字母（A-Z）',
        sortTitleDesc: '首字母（Z-A）',

        // 下拉菜单
        newGroup: '新建分类...',
        newCategory: '新建分组...',
        exportNative: '导出为 JSON 格式',
        exportIflytek: '导出为讯飞格式',
    },

    // ==================== 表单标签 ====================
    label: {
        group: '分类',
        category: '分组',
        title: '标题',
        content: '内容',
    },

    // ==================== 占位符 ====================
    placeholder: {
        searchPhrase: '搜索常用语...',
    },

    // ==================== 空状态 ====================
    empty: {
        noCategories: '分组，居然是零诶！',
        quickJump: '快速跳转分组',
        noResults: '无匹配结果',
        noPhrases: '常用语，空空如也~',
        noGroups: '分类，居然是零诶！',
        uncategorized: '未分组',
    },

    // ==================== 默认名称 ====================
    defaults: {
        groupName: '新建分类',
        newGroup: '新建分类',
        categoryName: '新建分组',
        newCategory: '新建分组',
        uncategorized: '未分组',
        newPhrase: '新常用语',
        copySuffix: '（副本）',
        iflytekGroupName: '来自讯飞输入法',
        importGroupName: '导入数据',
    },

    // ==================== 对话框 ====================
    dialog: {
        unsavedChanges: '未保存的更改',
        unsavedContent: '当前内容尚未保存，是否保存修改？',
        unsavedContentNote: '未保存的内容将会丢失。',
        discard: '不保存',
        thinkAgain: '我再想想',
        save: '保存',
        exportTitle: '导出常用语备份',
        exportIflytekTitle: '导出为讯飞输入法格式',
        importTitle: '导入常用语备份',
        jsonFilter: 'JSON 文件',
        csvFilter: 'CSV 文件',
        allSupportedFilter: '支持的文件',
    },

    // ==================== 计数/单位 ====================
    count: {
        categories: '{count} 个分组',
        characters: '{count} 字符',
        selected: '已选 {count} 项',
        batchSelected: '已选 {categories} 个分组，{phrases} 条常用语',
    },

    // ==================== 区域标题 ====================
    section: {
        groups: '分类列表',
        categories: '常用语分组',
        phrases: '常用语列表',
    },

    // ==================== 文件名 ====================
    file: {
        backupName: '常用语备份-{date}.json',
        iflytekBackupName: '常用语备份-{date}.csv',
    },

    // ==================== 通用文本 ====================
    common: {
        cancel: '取消',
        apply: '应用',
        close: '关闭',
        copy: '复制',
        listSeparator: '、',
        groupSeparator: '；',
        labelSeparator: '：',
    },

    // ==================== 设置 ====================
    settings: {
        title: '设置',
        language: '界面语言',
        languageAuto: '自动（跟随系统）',
        themeMode: '主题模式',
        themeLight: '天光大亮',
        themeDark: '夜色温柔',
        themeAuto: '自动适应',
        startupSelection: '启动时打开',
        startupLast: '上次浏览的位置',
        startupFirst: '顺序最上的位置',
        previewLinesLabel: '卡片预览行数',
        previewLines: '卡片预览行数：{count}',
        aiModel: 'AI 模型',
        defaultAiModel: '默认模型',
        aiPrompts: 'AI 提示词',
        aiCategorizePrompt: 'AI 归类提示词',
        aiTitlePrompt: 'AI 标题提示词',
        aiContentPrompt: 'AI 内容提示词',
        updated: '已更新：{items}',
    },

    // ==================== AI ====================
    ai: {
        categorize: 'AI 归类',
        generateTitle: 'AI 生成标题',
        generateContent: 'AI 生成内容',
        optimizeContent: 'AI 优化内容',
        themeGeneration: 'AI 主题生成',
        newGeneration: '全新生成',
        optimizeExisting: '优化现有内容',
        useAsTheme: '以此为主题',
        optimizeDescription: '将对现有内容进行优化，使其更加专业、清晰。',
        extraRequirementsLabel: '额外要求（可选）',
        descriptionLabel: '描述你想要的内容',
        extraRequirementsPlaceholder: '例如：语气更加正式、增加感谢语...',
        descriptionPlaceholder: '例如：一封拒绝加班的邮件、一段感谢客户的话...',
        contentApplied: '内容已应用',
        generating: '生成中...',
        startOptimize: '开始优化',
        generate: '生成',
        inputRequired: '请先输入内容',
        titleGenerated: '标题已生成',
        categorized: '已归类到：{group} / {category}',
        categorizedCategory: '已归类到分组：{category}',
        categoryNotFound: '未找到分组：{category}',
        groupNotFound: '未找到分类：{group}',
        noSuggestion: 'AI 未能推荐合适的分组',
        callFailed: 'AI 调用失败',
        retry: '重试',
        currentModel: '当前模型：{model}',
        invalidFormat: '模型返回的格式不符合要求，请重试或检查提示词。',
        rawSummary: '原始结果摘要：{summary}',
        errorUnavailable: '当前环境未连接 AI 服务，请在 uTools 中重试。',
        errorRateLimit: 'AI 请求过于频繁或额度不足，请稍后重试。',
        errorNetwork: '无法连接 AI 服务，请检查网络后重试。',
        prompt: {
            optimizeSystem: '你是一名专业的文案优化助手。请在不改变原意的前提下，优化用户提供的文本，使其更加专业、清晰、有条理。只输出优化后的内容，不要添加说明。',
            themeSystem: '你是一名专业的文案助手。用户会提供一段现有内容作为主题背景，请围绕该主题生成一段新的、专业的常用语。只输出生成内容，不要添加说明。',
            themeUser: '主题背景：\n{content}\n\n请基于以上主题生成新内容。{extra}',
            extraRequirements: '\n额外要求：{prompt}',
            generateSystem: '你是一名专业的文案助手。请根据用户的描述生成简洁、专业的常用语。只输出生成内容，不要添加说明。',
            categorizeSystem: '你是一名分类助手。请根据内容，从以下分类及其分组中选择最合适的分类和分组。\n结构：{structure}\n只按以下 JSON 格式输出，不要输出其他内容：{"分类":"分类名","分组":"分组名"}',
            titleSystem: '你是一名标题助手。请根据内容生成一个简短、准确的标题（不超过 15 个汉字）。只输出标题，不要添加说明。',
        },
    },

    accessibility: {
        copyPhrase: '{title}，按回车键复制内容',
    },

    dynamic: {
        group: '分类',
        category: '分组',
        phrase: '常用语',
        explain: '跳转或复制常用语',
    },

    error: {
        reload: '重新载入',
        exportDiagnostics: '导出诊断',
        exportRecovery: '导出数据备份',
        restoreRecovery: '从备份恢复',
        emptyFile: '文件为空',
        uncaught: '未捕获的错误',
        unhandledPromise: '未处理的异步错误',
        renderTitle: 'React 渲染错误',
    },

    importPreview: {
        title: '导入预览',
        groups: '分类',
        categories: '分组',
        phrases: '常用语',
        duplicates: '重复项',
        invalidRows: '无效行',
        strategy: '导入方式',
        merge: '合并',
        copies: '保留副本',
        overwrite: '覆盖',
        mergeDescription: '复用同名分类和分组，并跳过内容完全相同的常用语。',
        copiesDescription: '创建独立的导入分类，所有有效常用语都作为副本保留。',
        overwriteDescription: '用预览中的有效数据替换当前全部分类、分组和常用语。',
        apply: '确认导入',
        applying: '正在导入…',
    },

    // ==================== 帮助对话框 ====================
    help: {
        // 数据层级
        sectionHierarchy: '📚 数据层级',
        hierarchyGroup: '分类',
        hierarchyGroupDesc: '最高层级',
        hierarchyCategory: '分组',
        hierarchyCategoryDesc: '分类下的归档文件夹',
        hierarchyPhrase: '常用语',
        hierarchyPhraseDesc: '具体内容',

        // 功能介绍
        sectionFeatures: '✨ 功能介绍',
        featureCopyTitle: '一键复制',
        featureCopyDesc: '点击任意卡片，内容立即复制到剪贴板，可直接粘贴使用！',
        featureEditTitle: '快速编辑',
        featureEditDesc: '鼠标悬停在卡片上，按 {key} 立即进入编辑。',
        featureDeleteTitle: '删除与撤销',
        featureDeleteDesc: '悬停时按 {delKey} 删除，按 {ctrlKey}+{zKey} 撤销。',
        featureDragTitle: '拖拽移动',
        featureDragDesc: '直接拖拽卡片到目标分组；按住 {key} 拖拽可复制。',
        featureSearchTitle: '全局搜索',
        featureSearchDesc: '搜索框会在所有分类中查找，点击结果自动跳转定位。',
        featureBatchTitle: '批量管理',
        featureBatchDesc: '点击搜索栏右侧方框图标，可多选后批量删除、移动、导出。',
        featurePreviewTitle: '预览模式',
        featurePreviewDesc: '悬停卡片时按一下 {key} 切换预览模式，使用上下方向键切换卡片。',
        featureAutoSaveTitle: '自动保存',
        featureAutoSaveDesc: '编辑后点击空白处或切换卡片，自动保存。',
        featureThemeTitle: '主题切换',
        featureThemeDesc: '打开设置可选择浅色、深色或跟随系统的主题模式。',

        // 快捷键速查
        sectionShortcuts: '⌨️ 快捷键速查',
        shortcutNewPhrase: '新建常用语',
        shortcutNewCategory: '新建分组',
        shortcutFocusSearch: '聚焦搜索框',
        shortcutForceSave: '强制保存',
        shortcutUndo: '撤销操作',
        shortcutRedo: '重做操作',
        shortcutSelectAll: '全选（批量模式）',
        shortcutClone: '克隆悬停项',
        shortcutCopy: '复制悬停项',
        shortcutEdit: '编辑悬停项',
        shortcutDelete: '删除悬停项',
        shortcutEscape: '退出/取消',
        shortcutFullscreen: '全屏编辑',
        shortcutPreview: '切换预览模式',
        shortcutDragCopy: '复制到目标',
        dragAction: '拖拽',
        startGuide: '开启新手引导',
    },

    // ==================== 新手引导 ====================
    guide: {
        steps: {
            step1Title: '🗂️ 分类管理（最高层级）',
            step1Message: '分类用于管理不同的大类业务场景。\n\n• {bold:新建分类}：打开上方分类下拉菜单，选择“新建分类…”，在弹出的输入框中填写自定义名称并确认。\n• {bold:切换}：点击分类标签切换显示的分组。\n• {bold:排序}：长按分类标签上下拖拽可调整顺序。\n• {bold:更多}：右键点击分类标签，可{bold:重命名}、{bold:删除}或调整顺序。\n• {bold:名称规则}：名称不能为空；重复名称会提示，修改名称后再确认。',

            step2Title: '📂 分组导航（右键菜单）',
            step2Message: '这里列出当前分类下的所有分组。\n\n• {bold:新建分组}：打开分组下拉菜单，选择“新建分组…”，在弹出的输入框中填写自定义名称并确认；新建分组前请先创建或选择一个分类。\n• {bold:右键菜单}：在分组上右键，可进行{bold:重命名}、{bold:置顶}或{bold:删除}。\n• {bold:快速重命名}：选中分组后按 {key:F2} 即可直接编辑。\n• {bold:拖拽管理}：上下拖拽调整顺序；将其拖到其他分类标签上，可跨分类移动。\n• {bold:名称规则}：名称不能为空；重复名称会提示，修改名称后再确认。',

            step3Title: '📝 常用语核心操作',
        step3Message: '这是您的主要效率区域：\n\n• {bold:一键复制}：单击卡片即可复制内容。\n• {bold:悬停快捷操作}：鼠标停在卡片上时，按 {key:Ctrl}+{key:C} 复制、按 {key:Ctrl}+{key:D} 克隆，或按 {key:Del} 删除。\n• {bold:拖拽排序}：直接拖动卡片上下排序。\n• {bold:调整归属}：将卡片向左拖到其他分组可移动，也可继续拖到其他分类中的分组；按住 {key:Ctrl} 拖拽则保留副本。\n• {bold:预览}：悬停卡片时按一下 {key:Space} 切换预览模式，使用上下方向键切换卡片。\n\n引导中的演示数据仅存在内存中，不会写入您的真实数据。',

            step4Title: '🔍 搜索与批量模式',
            step4Message: '顶部工具栏助您掌控全局：\n\n• {bold:全局搜索}（{key:Ctrl} + {key:F}）：每次按下都会聚焦搜索框并全选当前搜索词。\n• {bold:批量管理}：点击右侧"方框"图标进入批量模式。\n   - 支持 {key:Shift} 连选\n   - 顶部批量工具栏可一键{bold:删除}、{bold:移动}或{bold:导出}数据。',

            step5Title: '⚙️ 备份与设置',
            step5Message: '底部功能区保障数据安全：\n\n• {bold:导入/导出}：建议定期导出 JSON 备份，防止数据丢失。\n• {bold:设置}：可调整语言、主题、启动位置和卡片预览行数。\n• {bold:帮助}：点击问号可再次查看此教程。',
        },
        controls: {
            skip: '跳过',
            back: '上一步',
            next: '下一步',
            finish: '完成',
        },
        demo: {
        groupName: '✨ 新手引导分类',
        categoryName: '📝 示例分组',
            phraseTitle: '👋 欢迎使用！',
            phraseContent: '这是一条演示常用语。试着点击复制，或拖动我！',
            phraseTitle2: '⌨️ 快捷键技巧',
            phraseContent2: '鼠标悬停后按 Ctrl+C 复制、Ctrl+D 克隆，或 Delete 删除。',
            phraseTitle3: '🖱️ 拖拽与移动',
        phraseContent3: '长按我可以进行排序，也可以将我拖到左侧的其他分组中。',
        }
    },
}
