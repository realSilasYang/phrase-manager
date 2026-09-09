import zhCN from './zh-CN'
import zhHK from './zh-HK'
import zhTW from './zh-TW'
import en from './en'
import ja from './ja'
import vi from './vi'
import ko from './ko'
import es from './es'
import fr from './fr'
import ptBR from './pt-BR'
import ptPT from './pt-PT'
import ru from './ru'
import de from './de'
import it from './it'
import { mergeLocale } from './mergeLocale'
import interfaceTranslations from './interfaceTranslations'
import importHelpTranslations from './importHelpTranslations'
import aiSettingsTranslations from './aiSettingsTranslations'

// 交换所有语言中的层级术语。内部字段仍沿用旧名称，用户界面统一显示“分类 → 分组”。
function swapHierarchyText(value, groupTerm, categoryTerm) {
  if (typeof value === 'string') {
    const protectedValues = []
    const protectedText = value.replace(/\{\w+\}/g, token => {
      protectedValues.push(token)
      return `\u0000${protectedValues.length - 1}\u0000`
    })
    const makePlural = value => {
      if (/y$/i.test(value)) return `${value.slice(0, -1)}ies`
      if (/ía$/i.test(value)) return `${value}s`
      return `${value}s`
    }
    const replaceTerm = (source, term, replacement, pluralReplacement = makePlural(replacement)) => {
      if (!term || !replacement) return source
      const plural = makePlural(term)
      const escaped = [term, plural]
        .sort((left, right) => right.length - left.length)
        .map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|')
      const boundary = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(term) ? '\\b' : ''
      return source.replace(new RegExp(`${boundary}(${escaped})${boundary}`, 'gi'), match => (
        match.toLocaleLowerCase() === plural.toLocaleLowerCase() ? pluralReplacement : replacement
      ))
    }
    const groupSingularMarker = '\u0001GROUP_SINGULAR\u0001'
    const groupPluralMarker = '\u0001GROUP_PLURAL\u0001'
    const swapped = replaceTerm(
      replaceTerm(protectedText, groupTerm, groupSingularMarker, groupPluralMarker),
      categoryTerm,
      groupTerm,
      makePlural(groupTerm)
    )
      .split(groupSingularMarker).join(categoryTerm)
      .split(groupPluralMarker).join(makePlural(categoryTerm))
    return swapped.replace(/\u0000(\d+)\u0000/g, (_, index) => protectedValues[Number(index)])
  }
  if (Array.isArray(value)) return value.map(item => swapHierarchyText(item, groupTerm, categoryTerm))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key,
      // AI 输出字段固定使用中文键名，但提示词中的层级说明仍需反映新语义。
      key === 'prompt'
        ? Object.fromEntries(Object.entries(child).map(([promptKey, promptValue]) => [
          promptKey,
          promptKey === 'categorizeSystem' && typeof promptValue === 'string'
            ? `${promptValue}\n[${categoryTerm}:TOP_LEVEL] > [${groupTerm}:NESTED]. JSON keys: "分类"=TOP_LEVEL, "分组"=NESTED.`
            : promptKey === 'importSystem' && typeof promptValue === 'string'
              ? `${promptValue}\n[${categoryTerm}:TOP_LEVEL] > [${groupTerm}:NESTED] > [常用语:ITEM]. Return only this structure.`
            : promptValue
        ]))
        : swapHierarchyText(child, groupTerm, categoryTerm)
    ]))
  }
  return value
}

// 术语互换不能只靠逐词替换：西语、法语、葡语和意大利语的冠词/形容词会随名词性别变化，
// 韩语助词也会随词尾变化。这里只修复互换后会明显破坏语法的最终文案，避免影响内部字段和 AI JSON 键名。
function repairHierarchyLanguage(code, value, path = '') {
  if (typeof value === 'string') {
    let text = value
    if (code === 'es') {
      text = text
        .replace(/\b[Nn]ueva Grupo\b/g, match => match[0] === 'N' ? 'Nuevo Grupo' : 'nuevo Grupo')
        .replace(/\b[Nn]uevo Categoría\b/g, match => match[0] === 'N' ? 'Nueva Categoría' : 'nueva Categoría')
        .replace(/\b[uU]n Categoría\b/g, match => match[0] === 'U' ? 'Una Categoría' : 'una Categoría')
        .replace(/\b[eE]l Categoría\b/g, match => match[0] === 'E' ? 'La Categoría' : 'la Categoría')
        .replace(/\b[lL]a Grupo\b/g, match => match[0] === 'L' ? 'El Grupo' : 'el Grupo')
        .replace(/\b[lL]os Categorías\b/g, match => match[0] === 'L' ? 'Las Categorías' : 'las Categorías')
        .replace(/\b[eE]stos Categorías\b/g, match => match[0] === 'E' ? 'Estas Categorías' : 'estas Categorías')
        .replace(/\b[uU]na Grupo\b/g, match => match[0] === 'U' ? 'Un Grupo' : 'un Grupo')
        .replace(/Grupo eliminada/g, 'Grupo eliminado').replace(/Grupo creada/g, 'Grupo creado')
        .replace(/Categoría eliminado/g, 'Categoría eliminada').replace(/Categoría creado/g, 'Categoría creada')
        .replace(/\ba el\b/g, 'al').replace(/\buna Grupo nueva\b/g, 'un Grupo nuevo')
        .replace(/\bel Categoría nuevo\b/g, 'la Categoría nueva').replace(/\bdel Categoría\b/g, 'de la Categoría')
        .replace(/\blas Grupos\b/g, 'los Grupos')
    } else if (code === 'fr') {
      text = text
        .replace(/\b[uU]n Catégorie\b/g, match => match[0][0] === 'U' ? 'Une Catégorie' : 'une Catégorie')
        .replace(/\b[lL]e Catégorie\b/g, match => match[0][0] === 'L' ? 'La Catégorie' : 'la Catégorie')
        .replace(/\b[uU]ne Groupe\b/g, match => match[0][0] === 'U' ? 'Un Groupe' : 'un Groupe')
        .replace(/\b[lL]a Groupe\b/g, match => match[0][0] === 'L' ? 'Le Groupe' : 'le Groupe')
        .replace(/\b[nN]ouveau Catégorie\b/g, match => match[0][0] === 'N' ? 'Nouvelle Catégorie' : 'nouvelle Catégorie')
        .replace(/\b[nN]ouvelle Groupe\b/g, match => match[0][0] === 'N' ? 'Nouveau Groupe' : 'nouveau Groupe')
        .replace(/Groupe supprimée/g, 'Groupe supprimé').replace(/Groupe créée/g, 'Groupe créé')
        .replace(/Catégorie supprimé/g, 'Catégorie supprimée').replace(/Catégorie créé/g, 'Catégorie créée')
        .replace(/\bune Groupe\b/g, 'un Groupe').replace(/\bla nouveau\b/g, 'le nouveau')
        .replace(/\bdans la nouveau\b/g, 'dans le nouveau').replace(/\bdans le nouvelle\b/g, 'dans la nouvelle')
        .replace(/\btous les Catégories\b/g, 'toutes les Catégories').replace(/\bdu Catégorie\b/g, 'de la Catégorie')
    } else if (code === 'pt-BR' || code === 'pt-PT') {
      text = text
        .replace(/\b[uU]m Categoria\b/g, match => match[0][0] === 'U' ? 'Uma Categoria' : 'uma Categoria')
        .replace(/\b[uU]ma Grupo\b/g, match => match[0][0] === 'U' ? 'Um Grupo' : 'um Grupo')
        .replace(/\b[nN]ovo Categoria\b/g, match => match[0][0] === 'N' ? 'Nova Categoria' : 'nova Categoria')
        .replace(/\b[nN]ova Grupo\b/g, match => match[0][0] === 'N' ? 'Novo Grupo' : 'novo Grupo')
        .replace(/\b[oO] Categoria\b/g, match => match[0][0] === 'O' ? 'A Categoria' : 'a Categoria')
        .replace(/\b[oO] Grupo\b/g, match => match[0][0] === 'O' ? 'O Grupo' : 'o Grupo')
        .replace(/Grupo excluída/g, 'Grupo excluído').replace(/Grupo criada/g, 'Grupo criado')
        .replace(/Categoria excluído/g, 'Categoria excluída').replace(/Categoria criado/g, 'Categoria criada')
        .replace(/\bpara a novo Grupo\b/g, 'para o novo Grupo').replace(/\bpara o nova Categoria\b/g, 'para a nova Categoria')
        .replace(/\bOs Categorias\b/g, 'As Categorias').replace(/\bos Categorias\b/g, 'as Categorias')
        .replace(/\bdo Categoria\b/g, 'da Categoria').replace(/\bdos Categorias\b/g, 'das Categorias')
    } else if (code === 'it') {
      text = text
        .replace(/\b[uU]n Categoria\b/g, match => match[0][0] === 'U' ? 'Una Categoria' : 'una Categoria')
        .replace(/\b[uU]na Gruppo\b/g, match => match[0][0] === 'U' ? 'Un Gruppo' : 'un Gruppo')
        .replace(/\b[nN]uovo Categoria\b/g, match => match[0][0] === 'N' ? 'Nuova Categoria' : 'nuova Categoria')
        .replace(/\b[nN]uova Gruppo\b/g, match => match[0][0] === 'N' ? 'Nuovo Gruppo' : 'nuovo Gruppo')
        .replace(/\b[iI]l Categoria\b/g, match => match[0][0] === 'I' ? 'La Categoria' : 'la Categoria')
        .replace(/\b[lL]a Gruppo\b/g, match => match[0][0] === 'L' ? 'Il Gruppo' : 'il Gruppo')
        .replace(/Gruppo eliminata/g, 'Gruppo eliminato').replace(/Gruppo creata/g, 'Gruppo creato')
        .replace(/Categoria eliminato/g, 'Categoria eliminata').replace(/Categoria creato/g, 'Categoria creata')
    } else if (code === 'ko') {
      text = text
        .replace(/카테고리이/g, '카테고리가')
        .replace(/카테고리을/g, '카테고리를')
        .replace(/카테고리와/g, '카테고리와')
        .replace(/그룹가/g, '그룹이')
        .replace(/그룹를/g, '그룹을')
        .replace(/그룹와/g, '그룹과')
        .replace(/그룹는/g, '그룹은')
        .replace(/그룹로/g, '그룹으로')
        .replace(/카테고리으로/g, '카테고리로')
    }

    // 德语和俄语的复数/格变化无法通过英文式加 s 推导，关键引导文案直接使用正确的自然表达。
    if (code === 'de' && path === 'guide.steps.step1Title') text = '🗂️ Kategorien (oberste Ebene)'
    if (code === 'de' && path === 'guide.steps.step1Message') text = 'Kategorien trennen große Arbeitsbereiche voneinander.\n\n• {bold:Kategorie erstellen}: Öffnen Sie die Kategorienliste, wählen Sie „Neue Kategorie…“, geben Sie einen eigenen Namen ein und bestätigen Sie.\n• {bold:Wechseln}: Klicken Sie auf eine Kategorie, um ihre Gruppen anzuzeigen.\n• {bold:Sortieren}: Halten Sie eine Kategorie gedrückt und ziehen Sie sie nach oben oder unten.\n• {bold:Mehr}: Klicken Sie mit der rechten Maustaste auf eine Kategorie, um sie {bold:umzubenennen}, zu {bold:löschen} oder ihre Reihenfolge zu ändern.\n• {bold:Namensregeln}: Der Name darf nicht leer sein; doppelte Namen werden gemeldet.'
    if (code === 'de' && path === 'guide.steps.step2Title') text = '📂 Gruppen und Kontextmenü'
    if (code === 'de' && path === 'guide.steps.step2Message') text = 'Diese Spalte zeigt die Gruppen der aktuellen Kategorie.\n\n• {bold:Gruppe erstellen}: Öffnen Sie die Gruppenliste, wählen Sie „Neue Gruppe…“, geben Sie einen eigenen Namen ein und bestätigen Sie; erstellen oder wählen Sie zuerst eine Kategorie.\n• {bold:Kontextmenü}: Klicken Sie mit der rechten Maustaste auf eine Gruppe, um sie {bold:umzubenennen}, {bold:an den Anfang zu verschieben} oder zu {bold:löschen}.\n• {bold:Schnell umbenennen}: Wählen Sie eine Gruppe und drücken Sie {key:F2}.\n• {bold:Ziehen und ablegen}: Ziehen Sie nach oben oder unten, um die Reihenfolge zu ändern, oder legen Sie die Gruppe auf einer anderen Kategorie ab, um sie dorthin zu verschieben.\n• {bold:Namensregeln}: Der Name darf nicht leer sein; doppelte Namen werden gemeldet.'
    if (code === 'ru' && path === 'guide.steps.step1Title') text = '🗂️ Категории (верхний уровень)'
    if (code === 'ru' && path === 'guide.steps.step1Message') text = 'Категории разделяют крупные области работы.\n\n• {bold:Создать категорию}: откройте список категорий, выберите «Новая категория…», введите своё название и подтвердите.\n• {bold:Переключить}: щёлкните категорию, чтобы показать её группы.\n• {bold:Изменить порядок}: удерживайте категорию и перетащите её вверх или вниз.\n• {bold:Дополнительно}: щёлкните категорию правой кнопкой, чтобы {bold:переименовать}, {bold:удалить} или изменить её порядок.\n• {bold:Правила названий}: название не может быть пустым; при совпадении появится предупреждение.'
    if (code === 'ru' && path === 'guide.steps.step2Title') text = '📂 Группы и контекстное меню'
    if (code === 'ru' && path === 'guide.steps.step2Message') text = 'В этом столбце показаны группы текущей категории.\n\n• {bold:Создать группу}: откройте список групп, выберите «Новая группа…», введите своё название и подтвердите; сначала создайте или выберите категорию.\n• {bold:Контекстное меню}: щёлкните группу правой кнопкой, чтобы {bold:переименовать}, {bold:переместить в начало} или {bold:удалить}.\n• {bold:Быстрое переименование}: выберите группу и нажмите {key:F2}.\n• {bold:Перетаскивание}: перетащите группу вверх или вниз для изменения порядка либо бросьте её на другую категорию, чтобы переместить.\n• {bold:Правила названий}: название не может быть пустым; при совпадении появится предупреждение.'
    return text
  }
  if (Array.isArray(value)) return value.map((item, index) => repairHierarchyLanguage(code, item, `${path}[${index}]`))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    repairHierarchyLanguage(code, child, path ? `${path}.${key}` : key)
  ]))
  return value
}

const hierarchyOverrides = {
  'zh-HK': {
    ai: { categorized: '已分類到：{group} / {category}', categorizedCategory: '已分類到：{category}', categoryNotFound: '找不到群組：{category}', groupNotFound: '找不到分類：{group}', noSuggestion: 'AI 找不到合適的群組' },
    guide: { demo: { groupName: '✨ 新手教學分類', categoryName: '📝 範例群組' } }
  },
  'zh-TW': {
    ai: { categorized: '已分類到：{group} / {category}', categorizedCategory: '已分類到：{category}', categoryNotFound: '找不到群組：{category}', groupNotFound: '找不到分類：{group}', noSuggestion: 'AI 找不到合適的群組' },
    guide: { demo: { groupName: '✨ 新手教學分類', categoryName: '📝 範例群組' } }
  },
  es: {
    label: { group: 'Categoría', category: 'Grupo' },
    tooltip: { newCategory: 'Nuevo grupo (Ctrl+Mayús+N)', newGroup: 'Nueva categoría' },
    menu: { newGroup: 'Nueva categoría…', newCategory: 'Nuevo grupo…' },
    empty: { noCategories: 'Todavía no hay grupos', quickJump: 'Ir a un grupo', noGroups: 'Todavía no hay categorías', uncategorized: 'Sin grupo' },
    defaults: { groupName: 'Nueva categoría', newGroup: 'Nueva categoría', categoryName: 'Nuevo grupo', newCategory: 'Nuevo grupo', uncategorized: 'Sin grupo' },
    count: { categories: { one: '{count} grupo', other: '{count} grupos' }, batchSelected: 'Selección: {categories} grupos; {phrases} frases' },
    section: { groups: 'Lista de categorías', categories: 'Grupos de frases' },
    snackbar: {
      selectParentCategoryFirst: 'Selecciona primero una categoría', categoryDeleted: 'Grupo eliminado', categoryNameExists: 'Ya existe un grupo con este nombre', categoryCreated: 'Grupo creado', categoryUpdated: 'Grupo actualizado',
      groupNameExists: 'Ya existe una categoría con este nombre', groupCreated: 'Categoría creada', groupUpdated: 'Categoría actualizada', groupDeleted: 'Categoría eliminada', noGroup: 'Crea o selecciona primero una categoría', createCategoryFirst: 'Crea primero un grupo',
      clonedToCategory: 'Copiado al nuevo grupo', movedToCategory: 'Movido al nuevo grupo', categoryCopiedToGroup: 'Grupo copiado a la nueva categoría', categoryMovedToGroup: 'Grupo movido a la nueva categoría',
      categoriesCopiedToGroup: { one: 'Se ha copiado {count} grupo a la nueva categoría', other: 'Se han copiado {count} grupos a la nueva categoría' },
      categoriesMovedToGroup: { one: 'Se ha movido {count} grupo a la nueva categoría', other: 'Se han movido {count} grupos a la nueva categoría' },
      copiedToUncategorized: 'Copiado a «Sin grupo»', movedToUncategorized: 'Movido a «Sin grupo»',
      phrasesCopiedToUncategorized: { one: 'Se ha copiado {count} frase a «Sin grupo»', other: 'Se han copiado {count} frases a «Sin grupo»' },
      phrasesMovedToUncategorized: { one: 'Se ha movido {count} frase a «Sin grupo»', other: 'Se han movido {count} frases a «Sin grupo»' },
      importSuccess: 'Importación completada. Grupos: {categories}; frases: {phrases}', batchExportSuccess: 'Exportación completada. Grupos: {categories}; frases: {phrases}',
      iflytekImportSuccess: 'Importación desde el método de entrada iFlytek completada. Grupos: {categories}; frases: {phrases}', batchMovedToGroup: 'Se han movido {categories} grupos a la categoría; frases: {phrases}',
      importApplied: 'Se han importado {groups} categorías, {categories} grupos y {phrases} frases; se han omitido {duplicates} duplicados'
    },
    ai: { categorized: 'Clasificado en {group} / {category}', categorizedCategory: 'Clasificado en {category}', categoryNotFound: 'No se encuentra el grupo: {category}', groupNotFound: 'No se encuentra la categoría: {group}', noSuggestion: 'La IA no ha encontrado un grupo adecuado' },
    dynamic: { group: 'Categoría', category: 'Grupo' },
    help: { hierarchyGroup: 'Categoría', hierarchyGroupDesc: 'Nivel superior', hierarchyCategory: 'Grupo', hierarchyCategoryDesc: 'Carpeta dentro de una categoría', featureDragDesc: 'Arrastra una tarjeta a otro grupo. Mantén {key} al arrastrar para copiarla.', featureSearchDesc: 'Busca en todas las categorías y haz clic en un resultado para ir directamente a él.', shortcutNewCategory: 'Nuevo grupo' },
    guide: { steps: {
      step1Title: '🗂️ Categorías (nivel superior)', step1Message: 'Las categorías separan grandes áreas de trabajo.\n\n• {bold:Crear una categoría}: abre el desplegable de categorías, elige «Nueva categoría…», escribe un nombre personalizado y confirma.\n• {bold:Cambiar}: haz clic en una categoría para mostrar sus grupos.\n• {bold:Ordenar}: mantén pulsada una categoría y arrástrala hacia arriba o abajo.\n• {bold:Más}: haz clic con el botón derecho en una categoría para {bold:cambiarle el nombre}, {bold:eliminarla} o cambiar su orden.\n• {bold:Reglas de nombres}: el nombre no puede estar vacío; los duplicados muestran un aviso.',
      step2Title: '📂 Grupos y menú contextual', step2Message: 'Esta columna muestra los grupos de la categoría actual.\n\n• {bold:Crear un grupo}: abre el desplegable de grupos, elige «Nuevo grupo…», escribe un nombre personalizado y confirma; primero crea o selecciona una categoría.\n• {bold:Menú contextual}: haz clic con el botón derecho en un grupo para {bold:cambiarle el nombre}, {bold:moverlo al principio} o {bold:eliminarlo}.\n• {bold:Cambio de nombre rápido}: selecciona un grupo y pulsa {key:F2}.\n• {bold:Arrastrar y soltar}: arrastra arriba o abajo para ordenar, o suelta el grupo sobre otra categoría para moverlo allí.\n• {bold:Reglas de nombres}: el nombre no puede estar vacío; los duplicados muestran un aviso.',
      step3Message: 'Este es tu espacio de trabajo principal.\n\n• {bold:Copiar}: haz clic en una tarjeta para copiar su contenido.\n• {bold:Atajos al pasar el puntero}: mientras apuntas a una tarjeta, pulsa {key:Ctrl}+{key:C} para copiar, {key:Ctrl}+{key:D} para duplicar o {key:Del} para eliminarla.\n• {bold:Ordenar}: arrastra las tarjetas arriba o abajo.\n• {bold:Cambiar de ubicación}: arrastra una tarjeta hacia la izquierda hasta otro grupo o continúa hasta un grupo de otra categoría; mantén {key:Ctrl} al arrastrar para conservar una copia.\n• {bold:Vista previa}: coloca el puntero sobre una tarjeta, pulsa {key:Espacio} una vez y usa las flechas Arriba y Abajo.\n\nLos datos del tutorial solo existen en la memoria y nunca se guardan en tus datos reales.',
      step4Message: 'La barra superior permite gestionar rápidamente todo el contenido.\n\n• {bold:Búsqueda global} ({key:Ctrl} + {key:F}): cada pulsación enfoca el cuadro de búsqueda y selecciona el texto actual.\n• {bold:Selección múltiple}: haz clic en el icono cuadrado de la derecha.\n   - Mantén {key:Shift} para seleccionar un intervalo\n   - Usa la barra superior para {bold:eliminar}, {bold:mover} o {bold:exportar} datos.'
    } },
    demo: { groupName: '✨ Categoría del tutorial', categoryName: '📝 Grupo de ejemplo' },
    importPreview: { groups: 'Categorías', categories: 'Grupos', mergeDescription: 'Reutiliza las categorías y los grupos con el mismo nombre y omite las frases con contenido idéntico.', copiesDescription: 'Crea una categoría independiente para la importación y conserva cada frase válida como copia.', overwriteDescription: 'Sustituye todas las categorías, grupos y frases actuales por los datos válidos de esta vista previa.' }
  },
  fr: {
    label: { group: 'Catégorie', category: 'Groupe' }, tooltip: { newCategory: 'Nouveau groupe (Ctrl+Maj+N)', newGroup: 'Nouvelle catégorie' }, menu: { newGroup: 'Nouvelle catégorie…', newCategory: 'Nouveau groupe…' },
    empty: { noCategories: 'Aucun groupe pour le moment', quickJump: 'Accéder à un groupe', noGroups: 'Aucune catégorie pour le moment', uncategorized: 'Sans groupe' }, defaults: { groupName: 'Nouvelle catégorie', newGroup: 'Nouvelle catégorie', categoryName: 'Nouveau groupe', newCategory: 'Nouveau groupe', uncategorized: 'Sans groupe' },
    count: { categories: { one: '{count} groupe', other: '{count} groupes' }, batchSelected: 'Sélection : {categories} groupes ; phrases : {phrases}' }, section: { groups: 'Liste des catégories', categories: 'Groupes de phrases' },
    snackbar: { selectParentCategoryFirst: 'Sélectionnez d’abord une catégorie', categoryDeleted: 'Groupe supprimé', categoryNameExists: 'Un groupe porte déjà ce nom', categoryCreated: 'Groupe créé', categoryUpdated: 'Groupe mis à jour', groupNameExists: 'Une catégorie porte déjà ce nom', groupCreated: 'Catégorie créée', groupUpdated: 'Catégorie mise à jour', groupDeleted: 'Catégorie supprimée', noGroup: 'Créez ou sélectionnez d’abord une catégorie', createCategoryFirst: 'Créez d’abord un groupe', clonedToCategory: 'Copié dans le nouveau groupe', movedToCategory: 'Déplacé dans le nouveau groupe', categoryCopiedToGroup: 'Groupe copié dans la nouvelle catégorie', categoryMovedToGroup: 'Groupe déplacé dans la nouvelle catégorie', categoriesCopiedToGroup: { one: '{count} groupe copié dans la nouvelle catégorie', other: '{count} groupes copiés dans la nouvelle catégorie' }, categoriesMovedToGroup: { one: '{count} groupe déplacé dans la nouvelle catégorie', other: '{count} groupes déplacés dans la nouvelle catégorie' }, copiedToUncategorized: 'Copié dans « Sans groupe »', movedToUncategorized: 'Déplacé dans « Sans groupe »', importSuccess: 'Importation terminée. Groupes : {categories} ; phrases : {phrases}', batchExportSuccess: 'Exportation terminée. Groupes : {categories} ; phrases : {phrases}', iflytekImportSuccess: 'Importation depuis la méthode de saisie iFlytek terminée. Groupes : {categories} ; phrases : {phrases}', batchMovedToGroup: 'Groupes déplacés vers la catégorie : {categories} ; phrases : {phrases}', importApplied: '{groups} catégories, {categories} groupes et {phrases} phrases importés ; {duplicates} doublons ignorés' },
    ai: { categoryNotFound: 'Groupe introuvable : {category}', groupNotFound: 'Catégorie introuvable : {group}', noSuggestion: 'L’IA n’a trouvé aucun groupe adapté' }, dynamic: { group: 'Catégorie', category: 'Groupe' },
    help: { hierarchyGroup: 'Catégorie', hierarchyGroupDesc: 'Niveau supérieur', hierarchyCategory: 'Groupe', hierarchyCategoryDesc: 'Dossier d’une catégorie', featureDragDesc: 'Faites glisser une carte vers un autre groupe. Maintenez {key} pendant le glissement pour la copier.', featureSearchDesc: 'Recherchez dans toutes les catégories, puis cliquez sur un résultat pour y accéder.', shortcutNewCategory: 'Nouveau groupe' },
    guide: { steps: { step1Title: '🗂️ Catégories (niveau supérieur)', step1Message: 'Les catégories séparent les grands domaines de travail.\n\n• {bold:Créer une catégorie} : ouvrez la liste des catégories, choisissez « Nouvelle catégorie… », saisissez un nom personnalisé, puis confirmez.\n• {bold:Changer} : cliquez sur une catégorie pour afficher ses groupes.\n• {bold:Réorganiser} : maintenez une catégorie et faites-la glisser vers le haut ou le bas.\n• {bold:Plus} : faites un clic droit sur une catégorie pour la {bold:renommer}, la {bold:supprimer} ou changer son ordre.\n• {bold:Règles de nommage} : le nom ne peut pas être vide ; les doublons sont signalés.', step2Title: '📂 Groupes et menu contextuel', step2Message: 'Cette colonne affiche les groupes de la catégorie actuelle.\n\n• {bold:Créer un groupe} : ouvrez la liste des groupes, choisissez « Nouveau groupe… », saisissez un nom personnalisé, puis confirmez ; créez ou sélectionnez d’abord une catégorie.\n• {bold:Menu contextuel} : faites un clic droit sur un groupe pour le {bold:renommer}, le {bold:placer en haut} ou le {bold:supprimer}.\n• {bold:Renommage rapide} : sélectionnez un groupe et appuyez sur {key:F2}.\n• {bold:Glisser-déposer} : faites glisser vers le haut ou le bas pour réorganiser, ou déposez le groupe sur une autre catégorie pour le déplacer.\n• {bold:Règles de nommage} : le nom ne peut pas être vide ; les doublons sont signalés.', step3Message: 'Voici votre espace de travail principal.\n\n• {bold:Copier} : cliquez sur une carte pour copier son contenu.\n• {bold:Raccourcis au survol} : survolez une carte et appuyez sur {key:Ctrl}+{key:C} pour la copier, {key:Ctrl}+{key:D} pour la dupliquer ou {key:Suppr} pour la supprimer.\n• {bold:Réorganiser} : faites glisser les cartes vers le haut ou le bas.\n• {bold:Changer d’emplacement} : faites glisser une carte vers un autre groupe à gauche, ou jusqu’à un groupe d’une autre catégorie ; maintenez {key:Ctrl} pour conserver une copie.\n• {bold:Aperçu} : survolez une carte, appuyez une fois sur {key:Espace}, puis utilisez les flèches Haut et Bas.\n\nLes données du tutoriel restent en mémoire et ne sont jamais enregistrées dans vos données réelles.', step4Message: 'La barre d’outils supérieure permet de gérer rapidement tout le contenu.\n\n• {bold:Recherche globale} ({key:Ctrl} + {key:F}) : chaque pression place le curseur dans la recherche et sélectionne le texte actuel.\n• {bold:Sélection multiple} : cliquez sur l’icône carrée à droite.\n   - Maintenez {key:Maj} pour sélectionner une plage\n   - Utilisez la barre supérieure pour {bold:supprimer}, {bold:déplacer} ou {bold:exporter} les données.' } },
    demo: { groupName: '✨ Catégorie du tutoriel', categoryName: '📝 Groupe exemple' }, importPreview: { groups: 'Catégories', categories: 'Groupes', mergeDescription: 'Réutilise les catégories et groupes portant le même nom et ignore les phrases au contenu identique.', copiesDescription: 'Crée une catégorie d’importation distincte et conserve chaque phrase valide comme copie.', overwriteDescription: 'Remplace les catégories, groupes et phrases actuels par les données valides de cet aperçu.' }
  },
  'pt-BR': {
    label: { group: 'Categoria', category: 'Grupo' }, tooltip: { newCategory: 'Novo grupo (Ctrl+Shift+N)', newGroup: 'Nova categoria' }, menu: { newGroup: 'Nova categoria…', newCategory: 'Novo grupo…' },
    empty: { noCategories: 'Ainda não há grupos', quickJump: 'Ir para um grupo', noGroups: 'Ainda não há categorias', uncategorized: 'Sem grupo' }, defaults: { groupName: 'Nova categoria', newGroup: 'Nova categoria', categoryName: 'Novo grupo', newCategory: 'Novo grupo', uncategorized: 'Sem grupo' },
    count: { categories: { one: '{count} grupo', other: '{count} grupos' }, batchSelected: 'Selecionados: {categories} grupos; {phrases} frases' }, section: { groups: 'Lista de categorias', categories: 'Grupos de frases' },
    snackbar: { selectParentCategoryFirst: 'Selecione primeiro uma categoria', categoryDeleted: 'Grupo excluído', categoryNameExists: 'Já existe um grupo com este nome', categoryCreated: 'Grupo criado', categoryUpdated: 'Grupo atualizado', groupNameExists: 'Já existe uma categoria com este nome', groupCreated: 'Categoria criada', groupUpdated: 'Categoria atualizada', groupDeleted: 'Categoria excluída', noGroup: 'Crie ou selecione primeiro uma categoria', createCategoryFirst: 'Crie primeiro um grupo', clonedToCategory: 'Copiado para o novo grupo', movedToCategory: 'Movido para o novo grupo', categoryCopiedToGroup: 'Grupo copiado para a nova categoria', categoryMovedToGroup: 'Grupo movido para a nova categoria', categoriesCopiedToGroup: { one: '{count} grupo copiado para a nova categoria', other: '{count} grupos copiados para a nova categoria' }, categoriesMovedToGroup: { one: '{count} grupo movido para a nova categoria', other: '{count} grupos movidos para a nova categoria' }, copiedToUncategorized: 'Copiado para “Sem grupo”', movedToUncategorized: 'Movido para “Sem grupo”', importSuccess: 'Importação concluída. Grupos: {categories}; frases: {phrases}', batchExportSuccess: 'Exportação concluída. Grupos: {categories}; frases: {phrases}', iflytekImportSuccess: 'Importação do método de introdução iFlytek concluída. Grupos: {categories}; frases: {phrases}', batchMovedToGroup: 'Grupos movidos para a categoria: {categories}; frases: {phrases}', importApplied: '{groups} categorias, {categories} grupos e {phrases} frases importados; {duplicates} itens duplicados ignorados' },
    ai: { categoryNotFound: 'Grupo não encontrado: {category}', groupNotFound: 'Categoria não encontrada: {group}', noSuggestion: 'A IA não encontrou um grupo adequado' }, dynamic: { group: 'Categoria', category: 'Grupo' },
    help: { hierarchyGroup: 'Categoria', hierarchyGroupDesc: 'Nível superior', hierarchyCategory: 'Grupo', hierarchyCategoryDesc: 'Pasta dentro de uma categoria', featureDragDesc: 'Arraste um cartão para outro grupo. Mantenha {key} pressionada ao arrastar para copiá-lo.', featureSearchDesc: 'Pesquise em todas as categorias e clique em um resultado para ir diretamente até ele.', shortcutNewCategory: 'Novo grupo' },
    guide: { steps: { step1Title: '🗂️ Categorias (nível superior)', step1Message: 'As categorias separam as principais áreas de trabalho.\n\n• {bold:Criar uma categoria}: abra a lista de categorias, escolha “Nova categoria…”, digite um nome personalizado e confirme.\n• {bold:Mudar}: clique em uma categoria para mostrar seus grupos.\n• {bold:Reordenar}: mantenha uma categoria pressionada e arraste-a para cima ou para baixo.\n• {bold:Mais}: clique com o botão direito em uma categoria para {bold:renomear}, {bold:excluir} ou alterar a ordem.\n• {bold:Regras de nomes}: o nome não pode ficar vazio; nomes duplicados exibem um aviso.', step2Title: '📂 Grupos e menu de contexto', step2Message: 'Esta coluna mostra os grupos da categoria atual.\n\n• {bold:Criar um grupo}: abra a lista de grupos, escolha “Novo grupo…”, digite um nome personalizado e confirme; crie ou selecione primeiro uma categoria.\n• {bold:Menu de contexto}: clique com o botão direito em um grupo para {bold:renomear}, {bold:mover para o topo} ou {bold:excluir}.\n• {bold:Renomear rapidamente}: selecione um grupo e pressione {key:F2}.\n• {bold:Arrastar e soltar}: arraste para cima ou para baixo para reordenar, ou solte o grupo em outra categoria para movê-lo.\n• {bold:Regras de nomes}: o nome não pode ficar vazio; nomes duplicados exibem um aviso.', step3Message: 'Esta é a área de trabalho principal.\n\n• {bold:Copiar}: clique em um cartão para copiar o conteúdo.\n• {bold:Atalhos ao passar o mouse}: enquanto aponta para um cartão, pressione {key:Ctrl}+{key:C} para copiar, {key:Ctrl}+{key:D} para duplicar ou {key:Del} para excluir.\n• {bold:Reordenar}: arraste os cartões para cima ou para baixo.\n• {bold:Mudar de local}: arraste um cartão para outro grupo à esquerda ou para um grupo de outra categoria; mantenha {key:Ctrl} pressionada ao arrastar para preservar uma cópia.\n• {bold:Visualizar}: passe o mouse sobre um cartão, pressione {key:Espaço} uma vez e use as setas para cima e para baixo.\n\nOs dados do guia existem somente na memória e nunca são gravados nos seus dados reais.', step4Message: 'A barra superior permite gerenciar rapidamente todo o conteúdo.\n\n• {bold:Busca global} ({key:Ctrl} + {key:F}): cada acionamento coloca o foco no campo de busca e seleciona o texto atual.\n• {bold:Seleção múltipla}: clique no ícone quadrado à direita.\n   - Mantenha {key:Shift} pressionada para selecionar um intervalo\n   - Use a barra superior para {bold:excluir}, {bold:mover} ou {bold:exportar} dados.' } },
    demo: { groupName: '✨ Categoria do tutorial', categoryName: '📝 Grupo de exemplo' }, importPreview: { groups: 'Categorias', categories: 'Grupos', mergeDescription: 'Reutiliza categorias e grupos com o mesmo nome e ignora frases com conteúdo idêntico.', copiesDescription: 'Cria uma categoria de importação independente e mantém cada frase válida como cópia.', overwriteDescription: 'Substitui todas as categorias, grupos e frases atuais pelos dados válidos desta prévia.' }
  },
  'pt-PT': {
    label: { group: 'Categoria', category: 'Grupo' }, tooltip: { newCategory: 'Novo grupo (Ctrl+Shift+N)', newGroup: 'Nova categoria' }, menu: { newGroup: 'Nova categoria…', newCategory: 'Novo grupo…' },
    empty: { noCategories: 'Ainda não existem grupos', quickJump: 'Ir para um grupo', noGroups: 'Ainda não existem categorias', uncategorized: 'Sem grupo' }, defaults: { groupName: 'Nova categoria', newGroup: 'Nova categoria', categoryName: 'Novo grupo', newCategory: 'Novo grupo', uncategorized: 'Sem grupo' },
    count: { categories: { one: '{count} grupo', other: '{count} grupos' }, batchSelected: 'Selecionados: {categories} grupos; frases: {phrases}' }, section: { groups: 'Lista de categorias', categories: 'Grupos de frases' },
    snackbar: { selectParentCategoryFirst: 'Selecione primeiro uma categoria', categoryDeleted: 'Grupo eliminado', categoryNameExists: 'Já existe um grupo com este nome', categoryCreated: 'Grupo criado', categoryUpdated: 'Grupo atualizado', groupNameExists: 'Já existe uma categoria com este nome', groupCreated: 'Categoria criada', groupUpdated: 'Categoria atualizada', groupDeleted: 'Categoria eliminada', noGroup: 'Crie ou selecione primeiro uma categoria', createCategoryFirst: 'Crie primeiro um grupo', clonedToCategory: 'Copiado para o novo grupo', movedToCategory: 'Movido para o novo grupo', categoryCopiedToGroup: 'Grupo copiado para a nova categoria', categoryMovedToGroup: 'Grupo movido para a nova categoria', categoriesCopiedToGroup: { one: '{count} grupo copiado para a nova categoria', other: '{count} grupos copiados para a nova categoria' }, categoriesMovedToGroup: { one: '{count} grupo movido para a nova categoria', other: '{count} grupos movidos para a nova categoria' }, copiedToUncategorized: 'Copiado para «Sem grupo»', movedToUncategorized: 'Movido para «Sem grupo»', importSuccess: 'Importação concluída. Grupos: {categories}; frases: {phrases}', batchExportSuccess: 'Exportação concluída. Grupos: {categories}; frases: {phrases}', iflytekImportSuccess: 'Importação do método de introdução iFlytek concluída. Grupos: {categories}; frases: {phrases}', batchMovedToGroup: 'Grupos movidos para a categoria: {categories}; frases: {phrases}', importApplied: '{groups} categorias, {categories} grupos e {phrases} frases importados; {duplicates} duplicados ignorados' },
    ai: { categoryNotFound: 'Grupo não encontrado: {category}', groupNotFound: 'Categoria não encontrada: {group}', noSuggestion: 'A IA não encontrou um grupo adequado' }, dynamic: { group: 'Categoria', category: 'Grupo' },
    help: { hierarchyGroup: 'Categoria', hierarchyGroupDesc: 'Nível superior', hierarchyCategory: 'Grupo', hierarchyCategoryDesc: 'Pasta dentro de uma categoria', featureDragDesc: 'Arraste um cartão para outro grupo. Mantenha {key} premida ao arrastar para o copiar.', featureSearchDesc: 'Pesquise em todas as categorias e clique num resultado para ir diretamente até ele.', shortcutNewCategory: 'Novo grupo' },
    guide: { steps: { step1Title: '🗂️ Categorias (nível superior)', step1Message: 'As categorias separam as principais áreas de trabalho.\n\n• {bold:Criar uma categoria}: abra a lista de categorias, escolha “Nova categoria…”, introduza um nome personalizado e confirme.\n• {bold:Mudar}: clique numa categoria para mostrar os respetivos grupos.\n• {bold:Reordenar}: mantenha uma categoria premida e arraste-a para cima ou para baixo.\n• {bold:Mais}: clique com o botão direito numa categoria para {bold:mudar o nome}, {bold:eliminar} ou alterar a ordem.\n• {bold:Regras de nomes}: o nome não pode ficar vazio; os nomes duplicados mostram um aviso.', step2Title: '📂 Grupos e menu de contexto', step2Message: 'Esta coluna apresenta os grupos da categoria atual.\n\n• {bold:Criar um grupo}: abra a lista de grupos, escolha “Novo grupo…”, introduza um nome personalizado e confirme; crie ou selecione primeiro uma categoria.\n• {bold:Menu de contexto}: clique com o botão direito num grupo para {bold:mudar o nome}, {bold:mover para o início} ou {bold:eliminar}.\n• {bold:Mudar o nome rapidamente}: selecione um grupo e prima {key:F2}.\n• {bold:Arrastar e largar}: arraste para cima ou para baixo para reordenar, ou largue o grupo noutra categoria para o mover.\n• {bold:Regras de nomes}: o nome não pode ficar vazio; os nomes duplicados mostram um aviso.', step3Message: 'Esta é a área de trabalho principal.\n\n• {bold:Copiar}: clique num cartão para copiar o conteúdo.\n• {bold:Atalhos ao passar o rato}: enquanto aponta para um cartão, prima {key:Ctrl}+{key:C} para copiar, {key:Ctrl}+{key:D} para duplicar ou {key:Del} para eliminar.\n• {bold:Reordenar}: arraste os cartões para cima ou para baixo.\n• {bold:Mudar de localização}: arraste um cartão para outro grupo à esquerda ou para um grupo de outra categoria; mantenha {key:Ctrl} premida ao arrastar para conservar uma cópia.\n• {bold:Pré-visualizar}: passe o rato sobre um cartão, prima {key:Espaço} uma vez e use as setas Cima e Baixo.\n\nOs dados do guia existem apenas na memória e nunca são guardados nos seus dados reais.', step4Message: 'A barra superior permite gerir rapidamente todo o conteúdo.\n\n• {bold:Pesquisa global} ({key:Ctrl} + {key:F}): cada pressão coloca o foco na pesquisa e seleciona o texto atual.\n• {bold:Seleção múltipla}: clique no ícone quadrado à direita.\n   - Mantenha {key:Shift} premida para selecionar um intervalo\n   - Use a barra superior para {bold:eliminar}, {bold:mover} ou {bold:exportar} dados.' } },
    demo: { groupName: '✨ Categoria do tutorial', categoryName: '📝 Grupo de exemplo' }, importPreview: { groups: 'Categorias', categories: 'Grupos', mergeDescription: 'Reutiliza categorias e grupos com o mesmo nome e ignora frases com conteúdo idêntico.', copiesDescription: 'Cria uma categoria de importação independente e mantém cada frase válida como cópia.', overwriteDescription: 'Substitui todas as categorias, grupos e frases atuais pelos dados válidos desta pré-visualização.' }
  },
  it: {
    label: { group: 'Categoria', category: 'Gruppo' }, tooltip: { newCategory: 'Nuovo gruppo (Ctrl+Maiusc+N)', newGroup: 'Nuova categoria' }, menu: { newGroup: 'Nuova categoria…', newCategory: 'Nuovo gruppo…' },
    empty: { noCategories: 'Non ci sono ancora gruppi', quickJump: 'Vai a un gruppo', noGroups: 'Non ci sono ancora categorie', uncategorized: 'Senza gruppo' }, defaults: { groupName: 'Nuova categoria', newGroup: 'Nuova categoria', categoryName: 'Nuovo gruppo', newCategory: 'Nuovo gruppo', uncategorized: 'Senza gruppo' },
    count: { categories: { one: '{count} gruppo', other: '{count} gruppi' }, batchSelected: 'Selezione — gruppi: {categories}; frasi: {phrases}' }, section: { groups: 'Elenco categorie', categories: 'Gruppi di frasi' },
    snackbar: { selectParentCategoryFirst: 'Seleziona prima una categoria', categoryDeleted: 'Gruppo eliminato', categoryNameExists: 'Esiste già un gruppo con questo nome', categoryCreated: 'Gruppo creato', categoryUpdated: 'Gruppo aggiornato', groupNameExists: 'Esiste già una categoria con questo nome', groupCreated: 'Categoria creata', groupUpdated: 'Categoria aggiornata', groupDeleted: 'Categoria eliminata', noGroup: 'Crea o seleziona prima una categoria', createCategoryFirst: 'Crea prima un gruppo', clonedToCategory: 'Copiato nel nuovo gruppo', movedToCategory: 'Spostato nel nuovo gruppo', categoryCopiedToGroup: 'Gruppo copiato nella nuova categoria', categoryMovedToGroup: 'Gruppo spostato nella nuova categoria', categoriesCopiedToGroup: { one: '{count} gruppo copiato nella nuova categoria', other: '{count} gruppi copiati nella nuova categoria' }, categoriesMovedToGroup: { one: '{count} gruppo spostato nella nuova categoria', other: '{count} gruppi spostati nella nuova categoria' }, copiedToUncategorized: 'Copiato in “Senza gruppo”', movedToUncategorized: 'Spostato in “Senza gruppo”', importSuccess: 'Importazione completata. Gruppi: {categories}; frasi: {phrases}', batchExportSuccess: 'Esportazione completata. Gruppi: {categories}; frasi: {phrases}', iflytekImportSuccess: 'Importazione dal metodo di input iFlytek completata. Gruppi: {categories}; frasi: {phrases}', batchMovedToGroup: 'Gruppi spostati nella categoria: {categories}; frasi: {phrases}', importApplied: 'Importate {groups} categorie, {categories} gruppi e {phrases} frasi; ignorati {duplicates} duplicati' },
    ai: { categoryNotFound: 'Gruppo non trovato: {category}', groupNotFound: 'Categoria non trovata: {group}', noSuggestion: 'L’IA non ha trovato un gruppo adatto' }, dynamic: { group: 'Categoria', category: 'Gruppo' },
    help: { hierarchyGroup: 'Categoria', hierarchyGroupDesc: 'Livello principale', hierarchyCategory: 'Gruppo', hierarchyCategoryDesc: 'Cartella della categoria', featureDragDesc: 'Trascina una scheda in un altro gruppo. Tieni premuto {key} mentre trascini per copiarla.', featureSearchDesc: 'Cerca in tutte le categorie e fai clic su un risultato per raggiungerlo direttamente.', shortcutNewCategory: 'Nuovo gruppo' },
    guide: { steps: { step1Title: '🗂️ Categorie (livello principale)', step1Message: 'Le categorie separano le grandi aree di lavoro.\n\n• {bold:Crea una categoria}: apri l’elenco delle categorie, scegli «Nuova categoria…», inserisci un nome personalizzato e conferma.\n• {bold:Cambia}: fai clic su una categoria per mostrarne i gruppi.\n• {bold:Riordina}: tieni premuta una categoria e trascinala verso l’alto o il basso.\n• {bold:Altro}: fai clic con il tasto destro su una categoria per {bold:rinominarla}, {bold:eliminarla} o cambiarne l’ordine.\n• {bold:Regole dei nomi}: il nome non può essere vuoto; i duplicati mostrano un avviso.', step2Title: '📂 Gruppi e menu contestuale', step2Message: 'Questa colonna mostra i gruppi della categoria corrente.\n\n• {bold:Crea un gruppo}: apri l’elenco dei gruppi, scegli «Nuovo gruppo…», inserisci un nome personalizzato e conferma; prima crea o seleziona una categoria.\n• {bold:Menu contestuale}: fai clic con il tasto destro su un gruppo per {bold:rinominarlo}, {bold:spostarlo all’inizio} o {bold:eliminarlo}.\n• {bold:Rinomina rapida}: seleziona un gruppo e premi {key:F2}.\n• {bold:Trascina e rilascia}: trascina in alto o in basso per riordinare oppure rilascia il gruppo su un’altra categoria per spostarlo.\n• {bold:Regole dei nomi}: il nome non può essere vuoto; i duplicati mostrano un avviso.', step3Message: 'Questa è l’area di lavoro principale.\n\n• {bold:Copia}: fai clic su una scheda per copiarne il contenuto.\n• {bold:Scorciatoie al passaggio del mouse}: mentre indichi una scheda, premi {key:Ctrl}+{key:C} per copiarla, {key:Ctrl}+{key:D} per duplicarla o {key:Canc} per eliminarla.\n• {bold:Riordina}: trascina le schede in alto o in basso.\n• {bold:Cambia posizione}: trascina una scheda verso un altro gruppo a sinistra o verso un gruppo di un’altra categoria; tieni premuto {key:Ctrl} per conservarne una copia.\n• {bold:Anteprima}: posiziona il puntatore su una scheda, premi {key:Spazio} una volta e usa le frecce Su e Giù.\n\nI dati del tutorial esistono solo in memoria e non vengono mai scritti nei dati reali.', step4Message: 'La barra superiore permette di gestire rapidamente tutti i contenuti.\n\n• {bold:Ricerca globale} ({key:Ctrl} + {key:F}): a ogni pressione viene attivato il campo di ricerca e selezionato tutto il testo corrente.\n• {bold:Selezione multipla}: fai clic sull’icona quadrata a destra.\n   - Tieni premuto {key:Maiusc} per selezionare un intervallo\n   - Usa la barra superiore per {bold:eliminare}, {bold:spostare} o {bold:esportare} i dati.' } },
    demo: { groupName: '✨ Categoria del tutorial', categoryName: '📝 Gruppo di esempio' }, importPreview: { groups: 'Categorie', categories: 'Gruppi', mergeDescription: 'Riutilizza categorie e gruppi con lo stesso nome e ignora le frasi con contenuto identico.', copiesDescription: 'Crea una categoria separata per l’importazione e conserva ogni frase valida come copia.', overwriteDescription: 'Sostituisce tutte le categorie, i gruppi e le frasi attuali con i dati validi di questa anteprima.' }
  },
  ko: {
    label: { group: '카테고리', category: '그룹' }, tooltip: { newCategory: '새 그룹 (Ctrl+Shift+N)', newGroup: '새 카테고리' }, menu: { newGroup: '새 카테고리…', newCategory: '새 그룹…' },
    empty: { noCategories: '아직 그룹이 없습니다', quickJump: '그룹으로 이동', noGroups: '아직 카테고리가 없습니다', uncategorized: '그룹 없음' }, defaults: { groupName: '새 카테고리', newGroup: '새 카테고리', categoryName: '새 그룹', newCategory: '새 그룹', uncategorized: '그룹 없음' },
    count: { categories: '{count}개 그룹', batchSelected: '그룹 {categories}개, 상용구 {phrases}개 선택됨' }, section: { groups: '카테고리 목록', categories: '상용구 그룹' },
    snackbar: { selectParentCategoryFirst: '먼저 카테고리를 선택하세요', categoryDeleted: '그룹을 삭제했습니다', categoryNameExists: '같은 이름의 그룹이 이미 있습니다', categoryCreated: '그룹을 만들었습니다', categoryUpdated: '그룹을 수정했습니다', groupNameExists: '같은 이름의 카테고리가 이미 있습니다', groupCreated: '카테고리를 만들었습니다', groupUpdated: '카테고리를 수정했습니다', groupDeleted: '카테고리를 삭제했습니다', noGroup: '먼저 카테고리를 만들거나 선택하세요', createCategoryFirst: '먼저 그룹을 만드세요', clonedToCategory: '새 그룹으로 복사했습니다', movedToCategory: '새 그룹으로 이동했습니다', categoryCopiedToGroup: '그룹을 새 카테고리로 복사했습니다', categoryMovedToGroup: '그룹을 새 카테고리로 이동했습니다', categoriesCopiedToGroup: '그룹 {count}개를 새 카테고리로 복사했습니다', categoriesMovedToGroup: '그룹 {count}개를 새 카테고리로 이동했습니다', copiedToUncategorized: '그룹 없음으로 복사했습니다', movedToUncategorized: '그룹 없음으로 이동했습니다', importSuccess: '그룹 {categories}개와 상용구 {phrases}개를 가져왔습니다', batchExportSuccess: '그룹 {categories}개와 상용구 {phrases}개를 내보냈습니다', iflytekImportSuccess: 'iFlytek 입력기에서 그룹 {categories}개와 상용구 {phrases}개를 가져왔습니다', batchMovedToGroup: '그룹 {categories}개와 상용구 {phrases}개를 카테고리로 이동했습니다', importApplied: '카테고리 {groups}개, 그룹 {categories}개, 상용구 {phrases}개를 가져오고 중복 항목 {duplicates}개를 건너뛰었습니다' },
    ai: { categoryNotFound: '그룹을 찾을 수 없습니다: {category}', groupNotFound: '카테고리를 찾을 수 없습니다: {group}', noSuggestion: 'AI가 적절한 그룹을 찾지 못했습니다' }, dynamic: { group: '카테고리', category: '그룹' },
    help: { hierarchyGroup: '카테고리', hierarchyGroupDesc: '최상위', hierarchyCategory: '그룹', hierarchyCategoryDesc: '카테고리 안의 폴더', featureDragDesc: '카드를 다른 그룹으로 끌어 놓으세요. {key} 키를 누른 채 끌면 복사됩니다.', featureSearchDesc: '모든 카테고리에서 검색하고 결과를 클릭하면 해당 위치로 바로 이동합니다.', shortcutNewCategory: '새 그룹' },
    guide: { steps: { step1Title: '🗂️ 카테고리 (최상위)', step1Message: '카테고리를 사용하면 큰 업무 영역별로 내용을 나눠 관리할 수 있습니다.\n\n• {bold:카테고리 만들기}: 위쪽 카테고리 목록을 열고 “새 카테고리…”를 선택한 뒤 원하는 이름을 입력하고 확인하세요.\n• {bold:전환}: 카테고리를 클릭하면 해당 카테고리의 그룹이 표시됩니다.\n• {bold:정렬}: 카테고리를 길게 눌러 위아래로 끄세요.\n• {bold:더보기}: 카테고리를 마우스 오른쪽 버튼으로 클릭해 {bold:이름 바꾸기}, {bold:삭제}, 순서 변경을 할 수 있습니다.\n• {bold:이름 규칙}: 이름은 비워 둘 수 없으며 중복 이름은 경고됩니다.', step2Title: '📂 그룹과 메뉴', step2Message: '현재 카테고리의 모든 그룹이 여기에 표시됩니다.\n\n• {bold:그룹 만들기}: 그룹 목록을 열고 “새 그룹…”을 선택한 뒤 원하는 이름을 입력하고 확인하세요. 먼저 카테고리를 만들거나 선택해야 합니다.\n• {bold:상황에 맞는 메뉴}: 그룹을 마우스 오른쪽 버튼으로 클릭해 {bold:이름 바꾸기}, {bold:맨 위로 이동}, {bold:삭제}를 할 수 있습니다.\n• {bold:빠른 이름 바꾸기}: 그룹을 선택하고 {key:F2} 키를 누르세요.\n• {bold:끌어서 관리}: 위아래로 끌어 정렬하거나 다른 카테고리에 놓아 이동할 수 있습니다.\n• {bold:이름 규칙}: 이름은 비워 둘 수 없으며 중복 이름은 경고됩니다.', step3Message: '이곳이 기본 작업 공간입니다.\n\n• {bold:복사}: 카드를 클릭하면 내용을 복사합니다.\n• {bold:마우스를 올린 상태의 단축키}: 카드에 마우스를 올린 상태에서 {key:Ctrl}+{key:C}로 복사하고, {key:Ctrl}+{key:D}로 복제하거나 {key:Del}로 삭제할 수 있습니다.\n• {bold:정렬}: 카드를 위아래로 끄세요.\n• {bold:위치 변경}: 카드를 왼쪽의 다른 그룹이나 다른 카테고리의 그룹으로 끌어 이동할 수 있습니다. {key:Ctrl} 키를 누른 채 끌면 사본이 남습니다.\n• {bold:미리보기}: 카드에 마우스를 올리고 {key:Space} 키를 한 번 누른 다음 위아래 방향키로 전환하세요.\n\n안내용 예제 데이터는 메모리에만 있으며 실제 데이터에는 기록되지 않습니다.', step4Message: '위쪽 도구 모음에서 모든 내용을 빠르게 관리할 수 있습니다.\n\n• {bold:전체 검색} ({key:Ctrl} + {key:F}): 누를 때마다 검색창으로 이동하고 현재 검색어 전체를 선택합니다.\n• {bold:여러 항목 선택}: 오른쪽 사각형 아이콘을 클릭하세요.\n   - {key:Shift} 키를 누른 채 범위 선택\n   - 위쪽 선택 도구 모음에서 데이터를 {bold:삭제}, {bold:이동}, {bold:내보내기}할 수 있습니다.' } },
    demo: { groupName: '✨ 사용 안내 카테고리', categoryName: '📝 예제 그룹' }, importPreview: { groups: '카테고리', categories: '그룹', mergeDescription: '같은 이름의 카테고리와 그룹을 재사용하고 내용이 완전히 같은 상용구는 건너뜁니다.', copiesDescription: '가져오기용 카테고리를 별도로 만들고 유효한 상용구를 모두 복사본으로 보관합니다.', overwriteDescription: '현재 카테고리, 그룹, 상용구를 미리 보기의 유효한 데이터로 모두 바꿉니다.' }
  },
  de: {
    label: { group: 'Kategorie', category: 'Gruppe' }, tooltip: { newCategory: 'Neue Gruppe (Strg+Umschalt+N)', newGroup: 'Neue Kategorie' }, menu: { newGroup: 'Neue Kategorie…', newCategory: 'Neue Gruppe…' },
    empty: { noCategories: 'Noch keine Gruppen', quickJump: 'Zu einer Gruppe springen', noGroups: 'Noch keine Kategorien', uncategorized: 'Ohne Gruppe' }, defaults: { groupName: 'Neue Kategorie', newGroup: 'Neue Kategorie', categoryName: 'Neue Gruppe', newCategory: 'Neue Gruppe', uncategorized: 'Ohne Gruppe' },
    count: { categories: { one: '{count} Gruppe', other: '{count} Gruppen' }, batchSelected: 'Ausgewählt — Gruppen: {categories}; Textbausteine: {phrases}' }, section: { groups: 'Kategorienliste', categories: 'Textbaustein-Gruppen' },
    snackbar: { selectParentCategoryFirst: 'Wählen Sie zuerst eine Kategorie aus', categoryDeleted: 'Gruppe gelöscht', categoryNameExists: 'Eine Gruppe mit diesem Namen ist bereits vorhanden', categoryCreated: 'Gruppe erstellt', categoryUpdated: 'Gruppe aktualisiert', groupNameExists: 'Eine Kategorie mit diesem Namen ist bereits vorhanden', groupCreated: 'Kategorie erstellt', groupUpdated: 'Kategorie aktualisiert', groupDeleted: 'Kategorie gelöscht', noGroup: 'Erstellen oder wählen Sie zuerst eine Kategorie', createCategoryFirst: 'Erstellen Sie zuerst eine Gruppe', clonedToCategory: 'In die neue Gruppe kopiert', movedToCategory: 'In die neue Gruppe verschoben', categoryCopiedToGroup: 'Gruppe in die neue Kategorie kopiert', categoryMovedToGroup: 'Gruppe in die neue Kategorie verschoben', categoriesCopiedToGroup: { one: '{count} Gruppe in die neue Kategorie kopiert', other: '{count} Gruppen in die neue Kategorie kopiert' }, categoriesMovedToGroup: { one: '{count} Gruppe in die neue Kategorie verschoben', other: '{count} Gruppen in die neue Kategorie verschoben' }, copiedToUncategorized: 'Nach „Ohne Gruppe“ kopiert', movedToUncategorized: 'Nach „Ohne Gruppe“ verschoben', importSuccess: 'Import abgeschlossen. Gruppen: {categories}; Textbausteine: {phrases}', batchExportSuccess: 'Export abgeschlossen. Gruppen: {categories}; Textbausteine: {phrases}', iflytekImportSuccess: 'Import aus der iFlytek-Eingabemethode abgeschlossen. Gruppen: {categories}; Textbausteine: {phrases}', batchMovedToGroup: 'Gruppen in die Kategorie verschoben: {categories}; Textbausteine: {phrases}', importApplied: '{groups} Kategorien, {categories} Gruppen und {phrases} Textbausteine importiert; {duplicates} Duplikate übersprungen' },
    ai: { categoryNotFound: 'Gruppe nicht gefunden: {category}', groupNotFound: 'Kategorie nicht gefunden: {group}', noSuggestion: 'Die KI konnte keine passende Gruppe finden' }, dynamic: { group: 'Kategorie', category: 'Gruppe' },
    help: { hierarchyGroup: 'Kategorie', hierarchyGroupDesc: 'Oberste Ebene', hierarchyCategory: 'Gruppe', hierarchyCategoryDesc: 'Ordner innerhalb einer Kategorie', featureDragDesc: 'Ziehen Sie eine Karte in eine andere Gruppe. Halten Sie beim Ziehen {key} gedrückt, um sie zu kopieren.', featureSearchDesc: 'Durchsuchen Sie alle Kategorien und klicken Sie auf ein Ergebnis, um direkt dorthin zu springen.', shortcutNewCategory: 'Neue Gruppe' },
    demo: { groupName: '✨ Einführungskategorie', categoryName: '📝 Beispielgruppe' }, importPreview: { groups: 'Kategorien', categories: 'Gruppen', mergeDescription: 'Gleichnamige Kategorien und Gruppen wiederverwenden und Textbausteine mit identischem Inhalt überspringen.', copiesDescription: 'Eine eigene Importkategorie erstellen und jeden gültigen Textbaustein als Kopie behalten.', overwriteDescription: 'Alle vorhandenen Kategorien, Gruppen und Textbausteine durch die gültigen Daten dieser Vorschau ersetzen.' }
  },
  ru: {
    label: { group: 'Категория', category: 'Группа' }, tooltip: { newCategory: 'Новая группа (Ctrl+Shift+N)', newGroup: 'Новая категория' }, menu: { newGroup: 'Новая категория…', newCategory: 'Новая группа…' },
    empty: { noCategories: 'Групп пока нет', quickJump: 'Перейти к группе', noGroups: 'Категорий пока нет', uncategorized: 'Без группы' }, defaults: { groupName: 'Новая категория', newGroup: 'Новая категория', categoryName: 'Новая группа', newCategory: 'Новая группа', uncategorized: 'Без группы' },
    count: { categories: { one: '{count} группа', few: '{count} группы', many: '{count} групп', other: '{count} группы' }, batchSelected: 'Выбрано — групп: {categories}, фраз: {phrases}' }, section: { groups: 'Список категорий', categories: 'Группы фраз' },
    snackbar: { selectParentCategoryFirst: 'Сначала выберите категорию', categoryDeleted: 'Группа удалена', categoryNameExists: 'Группа с таким названием уже существует', categoryCreated: 'Группа создана', categoryUpdated: 'Группа обновлена', groupNameExists: 'Категория с таким названием уже существует', groupCreated: 'Категория создана', groupUpdated: 'Категория обновлена', groupDeleted: 'Категория удалена', noGroup: 'Сначала создайте или выберите категорию', createCategoryFirst: 'Сначала создайте группу', clonedToCategory: 'Скопировано в новую группу', movedToCategory: 'Перемещено в новую группу', categoryCopiedToGroup: 'Группа скопирована в новую категорию', categoryMovedToGroup: 'Группа перемещена в новую категорию', categoriesCopiedToGroup: { one: 'В новую категорию скопирована {count} группа', few: 'В новую категорию скопировано {count} группы', many: 'В новую категорию скопировано {count} групп', other: 'В новую категорию скопировано {count} группы' }, categoriesMovedToGroup: { one: 'В новую категорию перемещена {count} группа', few: 'В новую категорию перемещено {count} группы', many: 'В новую категорию перемещено {count} групп', other: 'В новую категорию перемещено {count} группы' }, copiedToUncategorized: 'Скопировано в «Без группы»', movedToUncategorized: 'Перемещено в «Без группы»', importSuccess: 'Импорт завершён. Групп: {categories}; фраз: {phrases}', batchExportSuccess: 'Экспорт завершён. Групп: {categories}; фраз: {phrases}', iflytekImportSuccess: 'Импорт из метода ввода iFlytek завершён. Групп: {categories}; фраз: {phrases}', batchMovedToGroup: 'Группы перемещены в категорию: {categories}; фразы: {phrases}', importApplied: 'Импортировано: категорий — {groups}, групп — {categories}, фраз — {phrases}; пропущено дубликатов: {duplicates}' },
    ai: { categoryNotFound: 'Группа не найдена: {category}', groupNotFound: 'Категория не найдена: {group}', noSuggestion: 'ИИ не нашёл подходящую группу' }, dynamic: { group: 'Категория', category: 'Группа' },
    help: { hierarchyGroup: 'Категория', hierarchyGroupDesc: 'Верхний уровень', hierarchyCategory: 'Группа', hierarchyCategoryDesc: 'Папка внутри категории', featureDragDesc: 'Перетащите карточку в другую группу. Удерживайте {key} при перетаскивании, чтобы скопировать её.', featureSearchDesc: 'Ищите во всех категориях и щёлкните результат, чтобы сразу перейти к нему.', shortcutNewCategory: 'Новая группа' },
    demo: { groupName: '✨ Учебная категория', categoryName: '📝 Пример группы' }, importPreview: { groups: 'Категории', categories: 'Группы', mergeDescription: 'Использовать существующие категории и группы с теми же названиями, а фразы с полностью совпадающим содержимым пропустить.', copiesDescription: 'Создать отдельную категорию для импорта и сохранить каждую допустимую фразу как копию.', overwriteDescription: 'Заменить все текущие категории, группы и фразы допустимыми данными из этого предпросмотра.' }
  }
}

function applyHierarchySemantics(code, locale) {
  if (code === 'zh-CN') {
    const prompt = locale?.ai?.prompt
    if (!prompt?.categorizeSystem) return locale
    return {
      ...locale,
      ai: {
        ...locale.ai,
        prompt: {
          ...prompt,
          categorizeSystem: `${prompt.categorizeSystem}\n[分类:TOP_LEVEL] > [分组:NESTED]. JSON keys: "分类"=TOP_LEVEL, "分组"=NESTED.`,
          ...(typeof prompt.importSystem === 'string'
            ? { importSystem: `${prompt.importSystem}\n[分类:TOP_LEVEL] > [分组:NESTED] > [常用语:ITEM]. Return only this structure.` }
            : {})
        }
      }
    }
  }
  const groupTerm = locale?.label?.group
  const categoryTerm = locale?.label?.category
  if (!groupTerm || !categoryTerm || groupTerm === categoryTerm) return locale
  return mergeLocale(repairHierarchyLanguage(code, swapHierarchyText(locale, groupTerm, categoryTerm)), hierarchyOverrides[code])
}

// 将基础语言包与跨语言共用的界面、导入和 AI 文案合并为最终语言包。
const buildLocale = (code, base) => mergeLocale(
  mergeLocale(
    mergeLocale(base, interfaceTranslations[code]),
    importHelpTranslations[code]
  ),
  aiSettingsTranslations[code]
)

const localeSources = {
  'zh-CN': zhCN, 'zh-HK': zhHK, 'zh-TW': zhTW, en, ja, vi, ko,
  es, fr, 'pt-BR': ptBR, 'pt-PT': ptPT, ru, de, it
}
const locales = Object.fromEntries(Object.entries(localeSources).map(([code, source]) => {
  const merged = buildLocale(code, source)
  return [code, applyHierarchySemantics(code, merged)]
}))

// 设置页使用的语言选项；label 是用户可见名称，value 是内部语言代码。
export const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-HK', label: '繁體中文（香港）' },
  { value: 'zh-TW', label: '繁體中文（台灣）' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'pt-PT', label: 'Português (Portugal)' },
  { value: 'ru', label: 'Русский' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' }
]

const localeCodes = new Set(Object.keys(locales))
let activeLocaleCode = 'zh-CN'
const fallbackLocale = locales['zh-CN']
let locale = fallbackLocale
let pluralRules = null

// 将“自动”或浏览器语言代码解析为项目支持的具体语言。
export function resolveLocale(preference = 'auto', systemLanguage) {
  if (preference !== 'auto' && localeCodes.has(preference)) return preference

  const raw = String(systemLanguage || (typeof navigator !== 'undefined' ? navigator.language : '') || 'zh-CN')
  const normalized = raw.replace(/_/g, '-').toLowerCase()
  const parts = normalized.split('-')
  if (parts[0] === 'zh') {
    if (parts.includes('hk') || parts.includes('mo')) return 'zh-HK'
    if (parts.includes('tw') || parts.includes('hant')) return 'zh-TW'
    return 'zh-CN'
  }
  if (parts[0] === 'pt') return parts.includes('br') ? 'pt-BR' : 'pt-PT'

  const base = normalized.split('-')[0]
  return localeCodes.has(base) ? base : 'zh-CN'
}

export function setLocale(localeCode) {
  // 切换语言时清空复数规则缓存，避免继续使用上一语言的复数分类器。
  const resolved = resolveLocale(localeCode)
  if (resolved === activeLocaleCode) return resolved
  activeLocaleCode = resolved
  locale = locales[resolved] || fallbackLocale
  pluralRules = null
  return resolved
}

function readValue(source, key) {
  // 按点号路径读取嵌套文案；任一层不存在时返回 undefined，由调用方执行回退。
  return key.split('.').reduce((value, part) => (
    value && typeof value === 'object' && part in value ? value[part] : undefined
  ), source)
}

function resolvePlural(value, params) {
  // 支持 one、other 以及“=具体数字”三种复数文案形式。
  if (!value || typeof value !== 'object' || Array.isArray(value) || params.count == null) return value
  const exact = value[`=${params.count}`]
  if (typeof exact === 'string') return exact
  if (!pluralRules) pluralRules = new Intl.PluralRules(activeLocaleCode)
  const category = pluralRules.select(Number(params.count))
  return value[category] ?? value.other
}

export function t(key, params = {}) {
  // 先查当前语言，再回退到简体中文；占位符只替换调用方明确提供的参数。
  let value = readValue(locale, key)
  if (value === undefined) value = readValue(fallbackLocale, key)
  value = resolvePlural(value, params)

  if (typeof value === 'function') return value(params)
  if (typeof value !== 'string') {
    console.warn(`[i18n] Missing or invalid translation: ${activeLocaleCode}.${key}`)
    return key
  }

  return value.replace(/\{(\w+)\}/g, (match, paramKey) => (
    Object.prototype.hasOwnProperty.call(params, paramKey) ? String(params[paramKey]) : match
  ))
}

export function translateError(error, fallbackKey = 'error.unknown') {
  // 服务层错误携带 i18nKey 时走本地化文案，否则保留原始错误消息作为诊断信息。
  if (error?.i18nKey) return t(error.i18nKey, error.i18nParams || {})
  const message = String(error?.message || error || '').trim()
  return message || t(fallbackKey)
}
