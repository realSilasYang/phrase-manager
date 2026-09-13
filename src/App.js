import { useEffect, useLayoutEffect, useState, useCallback, useRef, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Slider from '@mui/material/Slider'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

// 图标组件统一导入。
import AddIcon from '@mui/icons-material/Add'
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SortIcon from '@mui/icons-material/Sort'
import PostAddIcon from '@mui/icons-material/PostAdd'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import CloseIcon from '@mui/icons-material/Close'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop'
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import TextFormatOutlinedIcon from '@mui/icons-material/TextFormatOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import TranslateIcon from '@mui/icons-material/Translate'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import FontDownloadOutlinedIcon from '@mui/icons-material/FontDownloadOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import rough from 'roughjs'

// 项目内部模块统一导入。
import { generateId, sortPhrases, triggerConfetti } from './utils'
import { createGhibliTheme } from './styles'
import { GhibliDialog, GuideOverlay } from './components'
import HelpDialog from './HelpDialog'
import { LANGUAGE_OPTIONS, resolveLocale, setLocale, t, translateError } from './locales'
import { host } from './services/host'
import {
  createInterfaceFontStack,
  createContentFontStack,
  DEFAULT_INTERFACE_FONT,
  DEFAULT_CONTENT_FONT,
  normalizeLocalFontFamilies
} from './services/localFonts'
import { buildLibraryIndexes } from './services/libraryIndexes'
import { readAllCollections, writeCollections as writeAllCollections } from './services/libraryRepository'
import { reconcilePendingCollections } from './services/librarySync'
import {
  applyUsageIncrements,
  phraseEditFieldsEqual,
  preparePhraseForSave,
  resolveLibrarySelection
} from './services/libraryOperations'
import {
  createDynamicCommands,
  createDynamicCommandSignature,
  resolveDynamicCommand
} from './services/dynamicFeature'
import {
  AI_IMPORT_MAX_CHARS,
  applyImportPreview,
  decodeImportSource,
  prepareAiImportPreview,
  prepareImportPreview
} from './services/importer'
import { serializeCollections } from './services/transferSchema'
import {
  mergeSettings,
  normalizeGroups,
  normalizeCollections,
  normalizeCategories,
  normalizePhrase,
  normalizePhrases,
  normalizeSettings,
  SETTING_FIELDS,
  DEFAULT_SETTINGS,
  loadSettings
} from './services/domainSchema'

const GUIDE_IDS = {
  category: 'guide-demo-category-v1',
  group: 'guide-demo-group-v1',
  phrase: 'guide-demo-phrase-v1',
  phrase2: 'guide-demo-phrase-v2',
  phrase3: 'guide-demo-phrase-v3'
}
const FIRST_OPEN_GUIDE_STORAGE_KEY = 'phrase_manager_first_open_guide_v1'
const GUIDE_PHRASE_IDS = new Set([GUIDE_IDS.phrase, GUIDE_IDS.phrase2, GUIDE_IDS.phrase3])
const QUICK_JUMP_CATEGORY_LIMIT = 120
const CARD_ENTER_DURATION = 300
const CARD_EXIT_DURATION = 200
const FONT_MENU_BATCH_SIZE = 100
const FEATURE_CODES = {
  main: 'phrase-manager-main',
  create: 'phrase-create-input',
  search: 'phrase-search-input'
}
function getUniqueCollectionName(items, baseName) {
  const normalizedBaseName = String(baseName || '').trim()
  if (!normalizedBaseName) return ''
  let candidate = normalizedBaseName
  let suffix = 1
  while (items.some(item => item.名称 === candidate)) {
    candidate = `${normalizedBaseName}(${suffix})`
    suffix++
  }
  return candidate
}

const EDIT_TOOLBAR_BUTTON_SX = {
  p: 0.25,
  width: 30,
  height: 30,
  color: 'text.secondary',
  '&:hover': { color: 'text.secondary' },
  '& .MuiSvgIcon-root, & .MuiCircularProgress-root': { color: 'inherit' }
}
const DASH_TARGET_PERIOD = 7
const DASH_SOLID_RATIO = 4 / 7
const balancedDashDividers = new Map()
let balancedDashResizeObserver = null
let balancedDashWindowListenerAttached = false

function updateBalancedDashPattern(divider, color, measuredWidth) {
  const width = Math.max(0, Number(measuredWidth) || divider.getBoundingClientRect().width)
  if (width <= 0) return

  // 让虚线以完整的间隔结束：总宽度等于实线数量乘以周期，再加一个末尾间隔。
  // 比较相邻的实线数量，选择最终周期最接近 7px 的方案，使短线和空隙分布均匀。
  const gapRatio = 1 - DASH_SOLID_RATIO
  const idealSolidCount = width / DASH_TARGET_PERIOD - gapRatio
  const solidCountCandidates = [
    Math.max(1, Math.floor(idealSolidCount)),
    Math.max(1, Math.ceil(idealSolidCount))
  ]
  const solidCount = solidCountCandidates.reduce((best, candidate) => {
    const bestError = Math.abs(width / (best + gapRatio) - DASH_TARGET_PERIOD)
    const candidateError = Math.abs(width / (candidate + gapRatio) - DASH_TARGET_PERIOD)
    return candidateError < bestError ? candidate : best
  })
  const period = width / (solidCount + gapRatio)
  const gapLength = period * gapRatio
  divider.style.backgroundImage = `linear-gradient(to right, transparent 0 ${gapLength}px, ${color} ${gapLength}px ${period}px)`
  divider.style.backgroundSize = `${period}px 1px`
}

function updateAllBalancedDashPatterns() {
  balancedDashDividers.forEach((color, divider) => updateBalancedDashPattern(divider, color))
}

function observeBalancedDashDivider(divider, color) {
  balancedDashDividers.set(divider, color)
  updateBalancedDashPattern(divider, color)

  if (typeof ResizeObserver !== 'undefined') {
    if (!balancedDashResizeObserver) {
      balancedDashResizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const entryColor = balancedDashDividers.get(entry.target)
          if (entryColor) updateBalancedDashPattern(entry.target, entryColor, entry.contentRect.width)
        })
      })
    }
    balancedDashResizeObserver.observe(divider)
  } else if (!balancedDashWindowListenerAttached) {
    window.addEventListener('resize', updateAllBalancedDashPatterns)
    balancedDashWindowListenerAttached = true
  }

  return () => {
    balancedDashResizeObserver?.unobserve(divider)
    balancedDashDividers.delete(divider)
    if (balancedDashDividers.size === 0) {
      balancedDashResizeObserver?.disconnect()
      balancedDashResizeObserver = null
      if (balancedDashWindowListenerAttached) {
        window.removeEventListener('resize', updateAllBalancedDashPatterns)
        balancedDashWindowListenerAttached = false
      }
    }
  }
}

function BalancedDashedDivider({ color }) {
  const dividerRef = useRef(null)

  useLayoutEffect(() => {
    const divider = dividerRef.current
    if (!divider) return undefined
    return observeBalancedDashDivider(divider, color)
  }, [color])

  return (
    <Box
      ref={dividerRef}
      component="span"
      aria-hidden="true"
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: '-1px',
        height: '1px',
        backgroundRepeat: 'repeat-x',
        pointerEvents: 'none'
      }}
    />
  )
}

function EmptyCategoryHandDrawnGuide({ active, isDark, startRef, endRef }) {
  const [drawing, setDrawing] = useState({ width: 0, height: 0, paths: [] })

  useLayoutEffect(() => {
    if (!active) {
      setDrawing(current => current.paths.length ? { width: 0, height: 0, paths: [] } : current)
      return undefined
    }
    const generator = rough.generator()
    // 引导线沿用当前主题色，手绘曲线用于强化空状态的操作提示。
    const color = isDark ? '#8FB595' : '#5D7C66'
    let drawFrame = null
    let list = null
    let resizeObserver = null
    let observed = false

    const observeTargets = (start, end, host) => {
      if (observed) return
      observed = true
      list = start.closest('[data-selection-scope="categories"]')
      list?.addEventListener('scroll', scheduleDraw, { passive: true })
      window.addEventListener('resize', scheduleDraw)
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(scheduleDraw)
        resizeObserver.observe(start)
        resizeObserver.observe(end)
        resizeObserver.observe(host)
      }
    }

    const draw = () => {
      drawFrame = null
      const start = startRef.current
      const end = endRef.current
      const host = end?.closest('#guide-col-categories')
      if (!start || !end || !host) {
        scheduleDraw()
        return
      }
      observeTargets(start, end, host)
      const startRect = start.getBoundingClientRect()
      const endRect = end.getBoundingClientRect()
      const hostRect = host.getBoundingClientRect()
      if (!startRect.width || !startRect.height || !endRect.width || !endRect.height || !hostRect.width || !hostRect.height) return

      const circleCenterX = startRect.left - hostRect.left + startRect.width / 2
      const circleCenterY = startRect.top - hostRect.top + startRect.height / 2
      const buttonCenterX = endRect.left - hostRect.left + endRect.width / 2
      const arrowOffsetY = Math.min(32, Math.max(18, hostRect.height * 0.035))
      // 终点落在按钮中心下方，确保箭头头部完整显示在当前栏内，不会被左侧边缘裁切。
      const upperSweepShiftY = Math.min(10, endRect.height * 0.22)
      const endX = buttonCenterX
      const endY = endRect.bottom - hostRect.top + Math.max(4, endRect.height * 0.08) + arrowOffsetY - upperSweepShiftY
      // 从圈出的空状态文案上方起笔，先绘制一个回环，再向按钮平滑收束。
      // 所有控制点都根据当前面板尺寸计算，适配不同窗口大小。
      const startX = circleCenterX - startRect.width * 0.12
      const startY = circleCenterY - startRect.height * 0.5 - Math.max(58, startRect.height * 1.55) + arrowOffsetY
      // 按面板高度缩放尾部延伸量；默认 720px 高度时延伸约 30px。
      const leftTailExtension = Math.min(42, Math.max(22, hostRect.height * (30 / 720)))
      const tailStartY = startY + leftTailExtension
      const horizontalDirection = Math.sign(endX - startX) || -1
      const guideDeltaX = Math.max(120, Math.abs(endX - startX))
      const guideRise = Math.max(180, startY - endY)
      const loopJointX = startX + horizontalDirection * guideDeltaX * 0.32
      const loopJointY = startY - guideRise * 0.47
      // 所有横向偏移都使用同一个方向值进行镜像，避免箭头头部脱离主线，
      // 或回环仍向旧方向弯折。
      const loopSide = horizontalDirection
      const loopWidth = Math.min(hostRect.width * 0.14, Math.max(48, guideDeltaX * 0.2))
      const loopHeight = Math.min(hostRect.height * 0.09, Math.max(28, guideRise * 0.13))
      const sweepDeltaX = Math.max(80, Math.abs(endX - loopJointX))
      const sweepRise = Math.max(90, loopJointY - endY)
      // 让镜像后的收束段贴近回环结束点，使两条笔画看起来像一次连续转折。
      const sweepStartX = loopJointX + loopSide * sweepDeltaX * 0.03
      const sweepStartY = loopJointY - sweepRise * 0.06
      // 末段保持接近直线斜向，在抵达按钮前保留轻微的镜像弧度。
      const sweepEndControlX = endX - loopSide * sweepDeltaX * 0.25
      const sweepEndControlY = endY + sweepRise * 0.2
      // 主线穿过回环的左侧边缘，闭合回环作为短小的附加笔画连接，
      // 既贴合参考形状，也避免连接处出现厚重的重叠线条。
      // 路径从空状态文案指向“新建分类”按钮，让箭头明确表达下一步操作。
      const arrowPath = [
        `M ${startX} ${tailStartY}`,
        `C ${startX + horizontalDirection * guideDeltaX * 0.006} ${tailStartY - leftTailExtension * 0.52}, ${startX + horizontalDirection * guideDeltaX * 0.002} ${startY + leftTailExtension * 0.1}, ${startX} ${startY}`,
        `C ${startX + horizontalDirection * guideDeltaX * 0.01} ${startY - guideRise * 0.17}, ${startX + horizontalDirection * guideDeltaX * 0.13} ${startY - guideRise * 0.36}, ${loopJointX} ${loopJointY}`,
        `C ${loopJointX + loopSide * sweepDeltaX * 0.012} ${loopJointY - sweepRise * 0.02}, ${loopJointX + loopSide * sweepDeltaX * 0.022} ${loopJointY - sweepRise * 0.045}, ${sweepStartX} ${sweepStartY}`,
        `C ${sweepStartX + loopSide * sweepDeltaX * 0.31} ${sweepStartY - sweepRise * 0.48}, ${sweepEndControlX} ${sweepEndControlY}, ${endX} ${endY}`
      ].join(' ')
      const loopExtentX = loopWidth * loopSide
      const loopPath = [
        `M ${loopJointX} ${loopJointY}`,
        `C ${loopJointX + loopExtentX * 0.2} ${loopJointY - loopHeight * 0.4}, ${loopJointX + loopExtentX * 0.76} ${loopJointY - loopHeight * 0.47}, ${loopJointX + loopExtentX} ${loopJointY - loopHeight * 0.25}`,
        `C ${loopJointX + loopExtentX * 1.16} ${loopJointY - loopHeight * 0.1}, ${loopJointX + loopExtentX * 0.93} ${loopJointY + loopHeight * 0.62}, ${loopJointX + loopExtentX * 0.66} ${loopJointY + loopHeight * 0.84}`,
        `C ${loopJointX + loopExtentX * 0.35} ${loopJointY + loopHeight * 1.1}, ${loopJointX} ${loopJointY + loopHeight * 1.02}, ${loopJointX - loopExtentX * 0.035} ${loopJointY + loopHeight * 0.65}`,
        `C ${loopJointX - loopExtentX * 0.08} ${loopJointY + loopHeight * 0.3}, ${loopJointX - loopExtentX * 0.03} ${loopJointY + loopHeight * 0.04}, ${loopJointX} ${loopJointY}`
      ].join(' ')
      const arrowStrokeWidth = 5.5
      const headLength = Math.min(30, Math.max(22, Math.hypot(sweepDeltaX, sweepRise) * 0.1))
      const headSpread = 0.52
      const arrowAngle = Math.atan2(endY - sweepEndControlY, endX - sweepEndControlX)
      const leftX = endX - headLength * Math.cos(arrowAngle - headSpread)
      const leftY = endY - headLength * Math.sin(arrowAngle - headSpread)
      const rightX = endX - headLength * Math.cos(arrowAngle + headSpread)
      const rightY = endY - headLength * Math.sin(arrowAngle + headSpread)
      // 以目标按钮为缩放中心等比缩小整条路径，让曲线主体收拢，
      // 同时保持箭头尖端锚定在“新建分类”按钮附近。
      const routeScale = 0.84
      // 根据变换后的下端位置动态计算水平偏移，使曲线底端始终位于分类栏正中，
      // 不依赖某个固定视口尺寸下的经验偏移量。
      const transformedTailX = endX + (startX - endX) * routeScale
      const routeShiftX = hostRect.width / 2 - transformedTailX
      const routeShiftY = Math.min(18, Math.max(8, hostRect.height * 0.025))
      const routeTransform = `translate(${routeShiftX} ${routeShiftY}) translate(${endX} ${endY}) scale(${routeScale}) translate(${-endX} ${-endY})`
      const messageCircle = generator.ellipse(
        circleCenterX,
        circleCenterY,
        startRect.width + 24,
        startRect.height + 10,
        {
          stroke: color,
          strokeWidth: 2.5,
          roughness: 0.65,
          bowing: 0.35,
          maxRandomnessOffset: 0.8,
          curveStepCount: 20,
          disableMultiStroke: false,
          seed: 19
        }
      )
      const ellipseWidth = startRect.width + 24
      const ellipseHeight = startRect.height + 10
      const ellipseRadiusX = ellipseWidth / 2
      const ellipseRadiusY = ellipseHeight / 2
      const ellipseMaskId = 'empty-category-guide-ellipse-top-repair'
      const topRepairWidth = Math.max(44, ellipseRadiusX * 0.24)
      const topRepairHeight = Math.max(18, ellipseRadiusY * 0.58)
      const topRepairX = circleCenterX - topRepairWidth / 2
      const topRepairY = circleCenterY - ellipseRadiusY * 1.24
      const ellipseMask = {
        id: ellipseMaskId,
        width: hostRect.width,
        height: hostRect.height,
        x: topRepairX,
        y: topRepairY,
        repairWidth: topRepairWidth,
        repairHeight: topRepairHeight
      }
      const ellipseArcPath = (startAngle, endAngle) => {
        const delta = endAngle - startAngle
        const kappa = (4 / 3) * Math.tan(delta / 4)
        const point = angle => ({
          x: circleCenterX + ellipseRadiusX * Math.cos(angle),
          y: circleCenterY + ellipseRadiusY * Math.sin(angle)
        })
        const tangent = angle => ({
          x: -ellipseRadiusX * Math.sin(angle),
          y: ellipseRadiusY * Math.cos(angle)
        })
        const start = point(startAngle)
        const end = point(endAngle)
        const startTangent = tangent(startAngle)
        const endTangent = tangent(endAngle)
        return [
          `M ${start.x} ${start.y}`,
          `C ${start.x + startTangent.x * kappa} ${start.y + startTangent.y * kappa}, ${end.x - endTangent.x * kappa} ${end.y - endTangent.y * kappa}, ${end.x} ${end.y}`
        ].join(' ')
      }
      const repairArcHalfAngle = Math.asin(
        Math.min(0.92, (topRepairWidth + 5) / (2 * ellipseRadiusX))
      )
      const ellipsePaths = generator.toPaths(messageCircle).map(path => ({
        ...path,
        mask: ellipseMaskId
      }))
      const paths = [
        ...ellipsePaths,
        {
          d: ellipseArcPath(-Math.PI / 2 - repairArcHalfAngle, -Math.PI / 2 + repairArcHalfAngle),
          stroke: color,
          strokeWidth: 2.5,
          fill: 'none'
        },
        { d: arrowPath, stroke: color, strokeWidth: arrowStrokeWidth, fill: 'none', transform: routeTransform },
        { d: loopPath, stroke: color, strokeWidth: arrowStrokeWidth, fill: 'none', transform: routeTransform },
        { d: `M ${endX} ${endY} L ${leftX} ${leftY}`, stroke: color, strokeWidth: arrowStrokeWidth, fill: 'none', transform: routeTransform },
        { d: `M ${endX} ${endY} L ${rightX} ${rightY}`, stroke: color, strokeWidth: arrowStrokeWidth, fill: 'none', transform: routeTransform }
      ]
      setDrawing({ width: hostRect.width, height: hostRect.height, paths, masks: [ellipseMask] })
    }

    const scheduleDraw = () => {
      if (drawFrame !== null) return
      drawFrame = requestAnimationFrame(draw)
    }
    scheduleDraw()

    return () => {
      if (drawFrame !== null) cancelAnimationFrame(drawFrame)
      list?.removeEventListener('scroll', scheduleDraw)
      if (observed) window.removeEventListener('resize', scheduleDraw)
      resizeObserver?.disconnect()
    }
  }, [active, endRef, isDark, startRef])

  if (!active || !drawing.paths.length) return null
  return (
    <svg
      aria-hidden="true"
      width={drawing.width}
      height={drawing.height}
      viewBox={`0 0 ${drawing.width} ${drawing.height}`}
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 20
      }}
    >
      {drawing.masks?.length ? (
        <defs>
          {drawing.masks.map(mask => (
            <mask
              key={mask.id}
              id={mask.id}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={mask.width}
              height={mask.height}
              style={{ maskType: 'luminance' }}
            >
              <rect width={mask.width} height={mask.height} fill="white" />
              <rect
                x={mask.x}
                y={mask.y}
                width={mask.repairWidth}
                height={mask.repairHeight}
                rx={Math.min(8, mask.repairHeight / 3)}
                fill="black"
              />
            </mask>
          ))}
        </defs>
      ) : null}
      {drawing.paths.map((path, index) => (
        <path
          key={`${index}-${path.d}`}
          d={path.d}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          fill={path.fill}
          mask={path.mask ? `url(#${path.mask})` : undefined}
          transform={path.transform}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

function cardAnimationKey(type, id) {
  return `${type}:${String(id)}`
}

function getCardLifecycleStyles({ animationName, isEntering, isExiting, maxHeight, marginBottom, idleAnimation = 'none', idleOverflow = 'visible' }) {
  const isAnimating = isEntering || isExiting
  const enterAnimationName = `${animationName}Enter`
  const exitAnimationName = `${animationName}Exit`
  return {
    overflow: isAnimating ? 'hidden' : idleOverflow,
    pointerEvents: isExiting ? 'none' : 'auto',
    willChange: isAnimating ? 'transform, opacity, max-height' : 'auto',
    animation: isExiting
      ? `${exitAnimationName} ${CARD_EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1) forwards`
      : isEntering
        ? `${enterAnimationName} ${CARD_ENTER_DURATION}ms cubic-bezier(0.2, 0, 0, 1) both`
        : idleAnimation,
    [`@keyframes ${enterAnimationName}`]: {
      from: { opacity: 0, transform: 'translateY(-8px) scale(0.98)', maxHeight: 0, marginBottom: 0 },
      to: { opacity: 1, transform: 'translateY(0) scale(1)', maxHeight, marginBottom }
    },
    [`@keyframes ${exitAnimationName}`]: {
      '0%': { opacity: 1, transform: 'translateX(0)', maxHeight, marginBottom },
      '60%': { opacity: 0, transform: 'translateX(16px)', maxHeight, marginBottom },
      '100%': { opacity: 0, transform: 'translateX(24px)', maxHeight: 0, marginBottom: 0 }
    },
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
  }
}

function getDbStorage() {
  return host.dbStorage
}

function applyNormalizedStateUpdate(previous, update, normalizer) {
  return normalizer(typeof update === 'function' ? update(previous) : update)
}

function summarizeAiResponse(value) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  return normalized.length > 240 ? `${normalized.slice(0, 240)}...` : normalized
}

function explainAiError(error) {
  const message = String(error?.message || '').trim()
  if (error?.i18nKey) return translateError(error)
  if (error?.code === 'AI_UNAVAILABLE') return t('ai.errorUnavailable')
  if (/rate|quota|频率|限额|429/i.test(message)) return t('ai.errorRateLimit')
  if (/network|fetch|连接|timeout|timed out/i.test(message)) return t('ai.errorNetwork')
  return message || t('ai.callFailed')
}

function settingsEqual(left, right) {
  return SETTING_FIELDS.every(key => left?.[key] === right?.[key])
}

export default function App() {
  // ==================== 设置管理 ====================
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = host.dbStorage.getItem('app_settings')
      return loadSettings(saved)
    } catch (e) {
      console.warn('[Settings] Failed to load settings:', e)
    }
    return normalizeSettings(DEFAULT_SETTINGS)
  })
  const setSettings = useCallback((update) => {
    setSettingsState(previous => applyNormalizedStateUpdate(previous, update, normalizeSettings))
  }, [])
  const latestSettingsRef = useRef(settings)
  latestSettingsRef.current = settings
  const recordHistoryRef = useRef(() => {})
  const resetHistoryRef = useRef(() => {})

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [availableAiModels, setAvailableAiModels] = useState([])
  const [aiModelsLoading, setAiModelsLoading] = useState(false)
  const aiModelsLoadedRef = useRef(false)
  const aiModelsLoadingRef = useRef(false)
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null)
  const [interfaceFontMenuAnchor, setInterfaceFontMenuAnchor] = useState(null)
  const [contentFontMenuAnchor, setContentFontMenuAnchor] = useState(null)
  const [localFontFamilies, setLocalFontFamilies] = useState([])
  const [localFontStatus, setLocalFontStatus] = useState('idle')
  const [interfaceFontMenuLimit, setInterfaceFontMenuLimit] = useState(FONT_MENU_BATCH_SIZE)
  const [contentFontMenuLimit, setContentFontMenuLimit] = useState(FONT_MENU_BATCH_SIZE)
  const localFontsLoadingRef = useRef(false)
  const [systemLanguage, setSystemLanguage] = useState(() => (
    typeof navigator !== 'undefined' ? (navigator.languages?.[0] || navigator.language) : 'zh-CN'
  ))
  const [systemTheme, setSystemTheme] = useState(() => (
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  ))

  const actualLocale = resolveLocale(settings.界面语言, systemLanguage)
  setLocale(actualLocale)
  const interfaceFontStack = useMemo(
    () => createInterfaceFontStack(settings.界面字体),
    [settings.界面字体]
  )
  const contentFontStack = useMemo(
    () => createContentFontStack(settings.内容字体),
    [settings.内容字体]
  )
  const visibleInterfaceFontFamilies = useMemo(() => normalizeLocalFontFamilies(
    localFontFamilies,
    actualLocale,
    [settings.界面字体],
    DEFAULT_INTERFACE_FONT
  ), [actualLocale, localFontFamilies, settings.界面字体])
  const visibleContentFontFamilies = useMemo(() => normalizeLocalFontFamilies(
    localFontFamilies,
    actualLocale,
    [settings.内容字体],
    DEFAULT_CONTENT_FONT
  ), [actualLocale, localFontFamilies, settings.内容字体])
  const renderedInterfaceFontFamilies = useMemo(
    () => visibleInterfaceFontFamilies.slice(0, interfaceFontMenuLimit),
    [interfaceFontMenuLimit, visibleInterfaceFontFamilies]
  )
  const renderedContentFontFamilies = useMemo(
    () => visibleContentFontFamilies.slice(0, contentFontMenuLimit),
    [contentFontMenuLimit, visibleContentFontFamilies]
  )

  // 保存设置
  const updateSettings = useCallback((updates) => {
    const previousSettings = latestSettingsRef.current
    const changedKeys = Object.keys(updates).filter(key => previousSettings[key] !== updates[key])
    if (changedKeys.length === 0) return

    const newSettings = mergeSettings(previousSettings, updates)
    try {
      host.dbStorage.setItem('app_settings', newSettings)
    } catch (e) {
      console.warn('[Settings] Failed to save settings:', e)
      setSnackbar({ open: true, message: t('snackbar.saveFailed'), severity: 'error', id: Date.now() })
      return
    }
    recordHistoryRef.current({
      mergeKey: `settings:${changedKeys.sort().join(',')}`,
      mergeWindowMs: 600
    })
    latestSettingsRef.current = newSettings
    setSettings(newSettings)
  }, [setSettings])

  // AI 模型探测只在设置页需要；启动阶段不调用宿主 IPC，减少初始化开销。
  const refreshAiModels = useCallback((force = false) => {
    if (aiModelsLoadingRef.current || (!force && aiModelsLoadedRef.current)) return
    aiModelsLoadedRef.current = true
    aiModelsLoadingRef.current = true
    setAiModelsLoading(true)
    host.allAiModels().then(models => {
      setAvailableAiModels(Array.isArray(models) ? models : [])
    }).catch(error => {
      aiModelsLoadedRef.current = false
      console.warn('[Settings] Failed to load AI models:', error)
    }).finally(() => {
      aiModelsLoadingRef.current = false
      setAiModelsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (settingsOpen) refreshAiModels()
  }, [refreshAiModels, settingsOpen])

  const loadLocalFonts = useCallback(async allowBrowserAccess => {
    if (localFontStatus === 'loaded' || localFontsLoadingRef.current) return
    localFontsLoadingRef.current = true
    setLocalFontStatus('loading')
    try {
      const fonts = await host.allLocalFonts({ allowBrowserAccess })
      setLocalFontFamilies(normalizeLocalFontFamilies(fonts, actualLocale))
      setLocalFontStatus('loaded')
    } catch {
      setLocalFontStatus('unavailable')
    } finally {
      localFontsLoadingRef.current = false
    }
  }, [actualLocale, localFontStatus])

  useEffect(() => {
    if (!settingsOpen || localFontStatus !== 'idle') return
    loadLocalFonts(false)
  }, [loadLocalFonts, localFontStatus, settingsOpen])

  const handleFontMenuOpen = useCallback(event => {
    setInterfaceFontMenuLimit(FONT_MENU_BATCH_SIZE)
    setContentFontMenuAnchor(null)
    setInterfaceFontMenuAnchor(event.currentTarget)
    if (localFontStatus !== 'loaded') loadLocalFonts(true)
  }, [loadLocalFonts, localFontStatus])

  const handleContentFontMenuOpen = useCallback(event => {
    setContentFontMenuLimit(FONT_MENU_BATCH_SIZE)
    setInterfaceFontMenuAnchor(null)
    setContentFontMenuAnchor(event.currentTarget)
    if (localFontStatus !== 'loaded') loadLocalFonts(true)
  }, [loadLocalFonts, localFontStatus])

  // 计算实际主题：选择“自动”时跟随系统主题。
  const actualTheme = useMemo(() => {
    if (settings.主题模式 === 'auto') return systemTheme
    return settings.主题模式
  }, [settings.主题模式, systemTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme)
  }, [actualTheme])

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-family', interfaceFontStack)
  }, [interfaceFontStack])

  useEffect(() => {
    document.documentElement.setAttribute('lang', actualLocale)
    document.title = t('app.title')
  }, [actualLocale])

  useEffect(() => {
    const handleLanguageChange = () => {
      setSystemLanguage(navigator.languages?.[0] || navigator.language || 'zh-CN')
    }
    window.addEventListener('languagechange', handleLanguageChange)
    return () => window.removeEventListener('languagechange', handleLanguageChange)
  }, [])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return undefined
    const handleThemeChange = event => setSystemTheme(event.matches ? 'dark' : 'light')
    media.addEventListener?.('change', handleThemeChange)
    return () => media.removeEventListener?.('change', handleThemeChange)
  }, [])

  const isDark = actualTheme === 'dark'
  const ghibliTheme = useMemo(
    () => createGhibliTheme(isDark, interfaceFontStack),
    [interfaceFontStack, isDark]
  )
  const createButtonSx = {
    width: 38,
    height: 30,
    p: 0,
    display: 'grid',
    placeItems: 'center',
    lineHeight: 0,
    border: 'none',
    borderRadius: 2,
    color: isDark ? 'rgba(255, 255, 255, 0.68)' : 'rgba(67, 52, 27, 0.72)',
    bgcolor: isDark ? 'rgba(255, 255, 255, 0.07)' : '#E4E7E5',
    '& .MuiSvgIcon-root': {
      display: 'block',
      m: 0
    },
    '&:hover:not(.Mui-disabled)': {
      color: isDark ? 'rgba(255, 255, 255, 0.86)' : 'rgba(67, 52, 27, 0.82)',
      bgcolor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#D9DDDA',
      boxShadow: isDark
        ? '0 2px 8px rgba(0, 0, 0, 0.16)'
        : '0 2px 8px rgba(67, 52, 27, 0.1)'
    }
  }
  const groupToolbarButtonSx = {
    borderRadius: 1,
    flex: 1,
    height: 32,
    p: 0,
    display: 'grid',
    placeItems: 'center',
    lineHeight: 0,
    color: isDark ? 'rgba(235, 230, 220, 0.52)' : 'rgba(67, 52, 27, 0.52)',
    backgroundColor: 'transparent',
    '& .MuiSvgIcon-root': {
      display: 'block',
      width: 22,
      height: 22,
      fontSize: 22,
      m: 0
    },
    '& .toolbar-transfer-icon': {
      width: 22,
      height: 22,
      fontSize: 22
    },
    '&:hover:not(.Mui-disabled)': {
      color: isDark ? 'rgba(235, 230, 220, 0.68)' : 'rgba(67, 52, 27, 0.68)',
      backgroundColor: isDark ? 'rgba(143, 181, 149, 0.06)' : 'rgba(93, 124, 102, 0.05)',
      backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(143, 181, 149, 0.14)' : 'rgba(93, 124, 102, 0.1)'} 0 15px, transparent 15.5px)`,
      boxShadow: isDark
        ? '0 2px 7px rgba(0, 0, 0, 0.14)'
        : '0 2px 7px rgba(67, 52, 27, 0.08)'
    }
  }
  const settingsTabSx = {
    minWidth: 80,
    height: 36,
    minHeight: 36,
    px: 1.5,
    py: 0,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1.5,
    bgcolor: isDark ? '#2b2b2b' : '#fff',
    color: 'text.secondary',
    fontSize: '1rem',
    lineHeight: 1.2,
    fontWeight: 700,
    translate: '0 0',
    '&:hover:not(.Mui-disabled)': {
      translate: '0 0',
      bgcolor: isDark ? 'rgba(143, 181, 149, 0.12)' : 'rgba(93, 124, 102, 0.08)',
      borderColor: isDark ? 'rgba(143, 181, 149, 0.72)' : 'rgba(93, 124, 102, 0.62)',
      color: isDark ? '#e5f0e7' : '#35523e'
    },
    '&:active:not(.Mui-disabled)': {
      translate: '0 0',
      bgcolor: isDark ? 'rgba(143, 181, 149, 0.2)' : 'rgba(93, 124, 102, 0.14)',
      borderColor: isDark ? 'rgba(143, 181, 149, 0.9)' : 'rgba(93, 124, 102, 0.82)'
    },
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      borderColor: 'primary.main',
      '&:hover:not(.Mui-disabled)': {
        translate: '0 0',
        bgcolor: isDark ? '#99bda0' : '#668970',
        color: 'primary.contrastText',
        borderColor: isDark ? '#99bda0' : '#668970'
      },
      '&:active:not(.Mui-disabled)': {
        translate: '0 0',
        bgcolor: isDark ? '#7da283' : '#4f6f58',
        color: 'primary.contrastText',
        borderColor: isDark ? '#7da283' : '#4f6f58'
      }
    }
  }

  // ==================== 数据状态 ====================
  const latestCollectionsRef = useRef(normalizeCollections())
  const latestSelectionRef = useRef({ 所属分类编号: null, 所属分组编号: null })
  const [storedCategories, setStoredCategories] = useState([])
  const setCategories = useCallback((update) => {
    const current = latestCollectionsRef.current
    const next = applyNormalizedStateUpdate(current.分类, update, normalizeCategories)
    if (next !== current.分类) latestCollectionsRef.current = { ...current, 分类: next }
    setStoredCategories(next)
  }, [])
  const [selectedCategoryId, setSelectedCategoryIdState] = useState(null)
  const setSelectedCategoryId = useCallback((value) => {
    const previous = latestSelectionRef.current.所属分类编号
    const next = typeof value === 'function' ? value(previous) : value
    if (next !== previous) latestSelectionRef.current = { ...latestSelectionRef.current, 所属分类编号: next }
    setSelectedCategoryIdState(next)
  }, [])
  const [storedGroups, setStoredGroups] = useState([])
  const setGroups = useCallback((update) => {
    const current = latestCollectionsRef.current
    const next = applyNormalizedStateUpdate(current.分组, update, normalizeGroups)
    if (next !== current.分组) latestCollectionsRef.current = { ...current, 分组: next }
    setStoredGroups(next)
  }, [])
  const [storedPhrases, setStoredPhrases] = useState([])
  const setPhrases = useCallback((update) => {
    const current = latestCollectionsRef.current
    const next = applyNormalizedStateUpdate(current.常用语, update, normalizePhrases)
    if (next !== current.常用语) latestCollectionsRef.current = { ...current, 常用语: next }
    setStoredPhrases(next)
  }, [])
  const [guideDemoCollections, setStoredGuideDemoCollections] = useState(null)
  const setGuideDemoCollections = useCallback((update) => {
    setStoredGuideDemoCollections(previous => {
      const next = typeof update === 'function' ? update(previous) : update
      return next == null ? null : normalizeCollections(next)
    })
  }, [])
  const categories = useMemo(() => guideDemoCollections
    ? [...storedCategories, ...guideDemoCollections.分类]
    : storedCategories, [storedCategories, guideDemoCollections])
  const groups = useMemo(() => guideDemoCollections
    ? [...storedGroups, ...guideDemoCollections.分组]
    : storedGroups, [storedGroups, guideDemoCollections])
  const phrases = useMemo(() => guideDemoCollections
    ? [...storedPhrases, ...guideDemoCollections.常用语]
    : storedPhrases, [storedPhrases, guideDemoCollections])

  const {
    categoriesById,
    groupsById,
    groupsByCategory,
    phrasesById,
    phrasesByGroup
  } = useMemo(() => buildLibraryIndexes(categories, groups, phrases), [categories, groups, phrases])

  // ==================== UI 状态 ====================
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [selectedGroupId, setSelectedGroupIdState] = useState(null)
  const setSelectedGroupId = useCallback((value) => {
    const previous = latestSelectionRef.current.所属分组编号
    const next = typeof value === 'function' ? value(previous) : value
    if (next !== previous) latestSelectionRef.current = { ...latestSelectionRef.current, 所属分组编号: next }
    setSelectedGroupIdState(next)
  }, [])
  const [selectedPhraseId, setSelectedPhraseId] = useState(null)

  const [sortBy, setSortBy] = useState('custom')
  const [isDragSessionActive, setIsDragSessionActive] = useState(false)
  const [visibleGroupCount, setVisibleGroupCount] = useState(100)
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(100)
  const [hoverGroupId, setHoverGroupId] = useState(null)
  const [focusGroupId, setFocusGroupId] = useState(null)
  const [hoverPhraseId, setHoverPhraseId] = useState(null)
  const [editPhrase, setStoredEditPhrase] = useState(null)
  const setEditPhrase = useCallback((update) => {
    setStoredEditPhrase(previous => {
      const next = typeof update === 'function' ? update(previous) : update
      return next == null ? null : normalizePhrase(next)
    })
  }, [])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [copiedPhraseIds, setCopiedPhraseIds] = useState(new Set())
  const [searchFocused, setSearchFocused] = useState(false)
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null)

  // 性能优化：分块渲染
  const [visibleCount, setVisibleCount] = useState(20)

  // ==================== 拖拽状态 ====================
  const [draggingPhraseId, setDraggingPhraseId] = useState(null)
  const [dragOverGroupId, setDragOverGroupId] = useState(null)
  const [flippingPhraseIds, setFlippingPhraseIds] = useState(new Set())
  const [enteringCardKeys, setEnteringCardKeys] = useState(() => new Set())
  const [exitingCardKeys, setExitingCardKeys] = useState(() => new Set())
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewPhraseId, setPreviewPhraseId] = useState(null)
  const [isFullscreenEdit, setIsFullscreenEdit] = useState(false)

  // ==================== 内联编辑状态 ====================
  const [inlineEditGroupId, setInlineEditGroupId] = useState(null)
  const [inlineEditGroupName, setInlineEditGroupName] = useState('')
  const [inlineEditCategoryId, setInlineEditCategoryId] = useState(null)
  const [inlineEditCategoryName, setInlineEditCategoryName] = useState('')
  const [hoverCategoryId, setHoverCategoryId] = useState(null)
  const [focusCategoryId, setFocusCategoryId] = useState(null)

  // ==================== 菜单状态 ====================
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null)
  const [menuGroupId, setMenuGroupId] = useState(null)
  const [categoryContextMenu, setCategoryContextMenu] = useState(null)
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null)
  const [menuCategoryId, setMenuCategoryId] = useState(null)
  const [phraseContextMenu, setPhraseContextMenu] = useState(null)
  const [groupContextMenu, setGroupContextMenu] = useState(null)

  // ==================== 对话框状态 ====================
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [createCollectionDialog, setCreateCollectionDialog] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [importPreview, setImportPreview] = useState(null)
  const [importStrategy, setImportStrategy] = useState('merge')
  const [importApplying, setImportApplying] = useState(false)
  const [aiImportSource, setAiImportSource] = useState(null)
  const [aiImportLoading, setAiImportLoading] = useState(false)
  const [aiImportError, setAiImportError] = useState(null)

  // ==================== 批量管理状态 ====================
  const [batchMode, setBatchMode] = useState(false)
  const [selectedPhraseIds, setSelectedPhraseIds] = useState(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set())
  const [lastSelectedPhraseId, setLastSelectedPhraseId] = useState(null)
  const [lastSelectedGroupId, setLastSelectedGroupId] = useState(null)
  const [batchMoveAnchor, setBatchMoveAnchor] = useState(null)

  // ==================== 滚动条状态 ====================
  const [isGroupListOverflowing, setIsGroupListOverflowing] = useState(false)
  const [isPhraseListOverflowing, setIsPhraseListOverflowing] = useState(false)

  // ==================== AI 状态 ====================
  const [aiContentLoading, setAiContentLoading] = useState(false)
  const [aiCategorizeLoading, setAiCategorizeLoading] = useState(false)
  const [aiTitleLoading, setAiTitleLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiError, setAiError] = useState(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiMode, setAiMode] = useState('generate') // 可选模式：生成、优化，或按主题生成。
  const aiAbortRef = useRef(null)
  const aiContentRequestIdRef = useRef(0)
  const aiCategorizeRequestIdRef = useRef(0)
  const aiTitleRequestIdRef = useRef(0)
  const aiImportRequestIdRef = useRef(0)
  const aiStreamFrameRef = useRef(null)
  const aiStreamBufferRef = useRef('')
  const aiCategorizeTargetRef = useRef(null)
  const aiTitleTargetRef = useRef(null)

  // ==================== DOM 与异步引用 ====================
  const searchInputRef = useRef(null)
  const dragItem = useRef(null)
  const groupListRef = useRef(null)
  const categoryListRef = useRef(null)
  const phraseListRef = useRef(null)
  const newCategoryButtonRef = useRef(null)
  const emptyCategoryGuideRef = useRef(null)
  const autoScrollRef = useRef(null)
  const dragSortFrameRef = useRef(null)
  const pendingDragPreviewLayoutRef = useRef(null)
  const dragPreviewAnimationRef = useRef(new Map())
  const pendingDragPointRef = useRef(null)
  const dragPointerRef = useRef({ x: 0, y: 0 })
  const dragLayoutRef = useRef(null)
  const lastDragTargetRef = useRef(null)
  const dragSessionActiveRef = useRef(false)
  const pendingPointerDragRef = useRef(null)
  const pointerDragLogicRef = useRef(null)
  const suppressNextClickRef = useRef(false)
  const suppressClickTimerRef = useRef(null)
  const dragSelectionStyleRef = useRef(null)
  const saveTimerRef = useRef(null)
  const pendingSaveRef = useRef(null)
  const lastPersistedCollectionsRef = useRef(null)
  const dynamicCommandAppliedSignatureRef = useRef(null)
  const dynamicCommandPendingSignatureRef = useRef(null)
  const dynamicCommandTimerRef = useRef(null)
  const phraseScrollFrameRef = useRef(null)
  const groupScrollFrameRef = useRef(null)
  const categoryScrollFrameRef = useRef(null)
  const overflowCheckFrameRef = useRef(null)
  const pointerVisualRef = useRef({ frame: null, target: null, kind: null, x: 0, y: 0 })
  const pendingUsageIncrementsRef = useRef(new Map())
  const usageFlushTimerRef = useRef(null)
  const flipTimersRef = useRef(new Map())
  const cardEnterTimersRef = useRef(new Set())
  const cardExitTimersRef = useRef(new Map())
  const pendingCardRemovalsRef = useRef(new Map())
  const trackedCardIdsRef = useRef(null)
  const cardTrackingReadyRef = useRef(false)
  const isExitingRef = useRef(false)
  const duplicateWarningShownRef = useRef(false)
  const inlineEditInputRef = useRef(null)
  const inlineEditCategoryInputRef = useRef(null)
  const inlineGroupDraftRef = useRef({ 编号: null, 名称: '' })
  const inlineCategoryDraftRef = useRef({ 编号: null, 名称: '' })
  const previousGroupSelectionRef = useRef(null)
  const previousCategorySelectionRef = useRef({ 所属分类编号: null, 所属分组编号: null })
  const contentInputRef = useRef(null)
  const previewScrollRef = useRef(null)
  const previewKeyboardNavigationRef = useRef(false)
  const previewNavigationStateRef = useRef(null)
  const historyRef = useRef([])
  const redoHistoryRef = useRef([])
  const historyEntityCountRef = useRef(0)
  const redoHistoryEntityCountRef = useRef(0)
  const latestHistoryUiRef = useRef(null)
  const latestGuideStepRef = useRef(-1)
  const isFirstRender = useRef(true)
  const pendingActionRef = useRef(null)
  const editPhraseRef = useRef(null)
  const savePhraseRef = useRef(null)
  const createPhraseRef = useRef(null)
  const createCategoryRef = useRef(null)
  const pendingPhraseSelectionRef = useRef(null)
  const pendingPhraseCreationRef = useRef(null)
  const pendingCollectionCreationRef = useRef(null)
  const dragHistoryRecordedRef = useRef(false)

  latestHistoryUiRef.current = {
    settings,
    sortBy,
    selectedCategoryId,
    selectedGroupId,
    selectedPhraseId,
    editPhrase,
    batchMode,
    selectedPhraseIds,
    selectedGroupIds,
    lastSelectedPhraseId,
    lastSelectedGroupId,
    guideStep: latestGuideStepRef.current,
    helpOpen
  }

  editPhraseRef.current = editPhrase

  // 性能优化：使用引用追踪高频变化的悬停状态，避免事件监听器频繁重绑。
  const hoverPhraseIdRef = useRef(null)

  useEffect(() => { hoverPhraseIdRef.current = hoverPhraseId }, [hoverPhraseId])
  // 指针特效只改变视觉样式。把布局读取和样式写入合并到一个动画帧内，
  // 防止快速移动鼠标时反复触发同步布局，阻塞 React 事件循环。
  const schedulePointerVisual = (e, kind) => {
    const visual = pointerVisualRef.current
    visual.target = e.currentTarget
    visual.kind = kind
    visual.x = e.clientX
    visual.y = e.clientY
    if (visual.frame !== null) return
    visual.frame = requestAnimationFrame(() => {
      visual.frame = null
      const { target, kind: currentKind, x, y } = pointerVisualRef.current
      if (!target || !target.isConnected) return
      const rect = target.getBoundingClientRect()
      if (currentKind === 'tilt') {
        const normalizedX = rect.width ? (x - rect.left) / rect.width : 0.5
        const normalizedY = rect.height ? (y - rect.top) / rect.height : 0.5
        const rotateY = (normalizedX - 0.5) * 20
        const rotateX = (0.5 - normalizedY) * 20
        target.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      } else {
        target.style.setProperty('--x', `${x - rect.left}px`)
        target.style.setProperty('--y', `${y - rect.top}px`)
      }
    })
  }

  const resetPointerVisual = (e, kind) => {
    const target = e.currentTarget
    const visual = pointerVisualRef.current
    if (visual.target === target && visual.kind === kind && visual.frame !== null) {
      cancelAnimationFrame(visual.frame)
      visual.frame = null
    }
    if (visual.target === target) {
      visual.target = null
      visual.kind = null
    }
    if (kind === 'tilt') {
      target.style.transform = ''
    } else {
      target.style.removeProperty('--x')
      target.style.removeProperty('--y')
    }
  }

  const flushUsageIncrements = useCallback(() => {
    if (usageFlushTimerRef.current !== null) {
      clearTimeout(usageFlushTimerRef.current)
      usageFlushTimerRef.current = null
    }
    const increments = pendingUsageIncrementsRef.current
    if (increments.size === 0) return
    pendingUsageIncrementsRef.current = new Map()
    setPhrases(prev => applyUsageIncrements(prev, increments))
  }, [])

  const queuePhraseUsage = useCallback((phraseId) => {
    const increments = pendingUsageIncrementsRef.current
    if (increments.size === 0) {
      // 连续复制会合并为一次存储事务，因此使用次数也合并为同一条撤销记录，
      // 确保撤销时数据变化与实际保存范围一致。
      recordHistoryRef.current({ mergeKey: 'phrase-usage', mergeWindowMs: 150 })
    }
    increments.set(phraseId, (increments.get(phraseId) || 0) + 1)
    if (usageFlushTimerRef.current === null) {
      usageFlushTimerRef.current = setTimeout(flushUsageIncrements, 120)
    }
  }, [flushUsageIncrements])

  const flushAiStream = useCallback((requestId) => {
    if (aiStreamFrameRef.current !== null) {
      cancelAnimationFrame(aiStreamFrameRef.current)
      aiStreamFrameRef.current = null
    }
    const buffered = aiStreamBufferRef.current
    aiStreamBufferRef.current = ''
    if (buffered && requestId === aiContentRequestIdRef.current) {
      setAiResult(prev => prev + buffered)
    }
  }, [])

  const cancelAiContentRequest = useCallback(() => {
    aiContentRequestIdRef.current++
    if (aiAbortRef.current && typeof aiAbortRef.current.abort === 'function') {
      aiAbortRef.current.abort()
    }
    aiAbortRef.current = null
    if (aiStreamFrameRef.current !== null) {
      cancelAnimationFrame(aiStreamFrameRef.current)
      aiStreamFrameRef.current = null
    }
    aiStreamBufferRef.current = ''
    setAiContentLoading(false)
  }, [])

  // 防止启动闪烁：数据加载完成前不渲染主界面
  const [isReady, setIsReady] = useState(false)

  // 在绘制前检查手动新建、克隆、导入和 AI 生成等所有入口产生的新条目，
  // 让新卡片直接进入入场动画，避免先闪现一帧静态内容。
  useLayoutEffect(() => {
    const nextIds = {
      category: new Set(categories.map(item => String(item.编号))),
      group: new Set(groups.map(item => String(item.编号))),
      phrase: new Set(phrases.map(item => String(item.编号)))
    }

    if (!isReady || !cardTrackingReadyRef.current) {
      trackedCardIdsRef.current = nextIds
      cardTrackingReadyRef.current = isReady
      return
    }

    const previousIds = trackedCardIdsRef.current || nextIds
    const addedKeys = []
    Object.entries(nextIds).forEach(([type, ids]) => {
      const previous = previousIds[type] || new Set()
      const added = [...ids].filter(id => !previous.has(id))
      const removed = [...previous].filter(id => !ids.has(id))
      const temporaryPrefix = type === 'category' ? 'new-category-' : type === 'group' ? 'new-group-' : null
      const isTemporaryIdCommit = temporaryPrefix && added.length === removed.length && removed.length > 0 && removed.every(id => id.startsWith(temporaryPrefix))
      if (!isTemporaryIdCommit) {
        added.forEach(id => addedKeys.push(cardAnimationKey(type, id)))
      }
    })
    trackedCardIdsRef.current = nextIds

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (addedKeys.length === 0 || reduceMotion) return

    setEnteringCardKeys(current => {
      const next = new Set(current)
      addedKeys.forEach(key => next.add(key))
      return next
    })
    const timer = window.setTimeout(() => {
      cardEnterTimersRef.current.delete(timer)
      setEnteringCardKeys(current => {
        const next = new Set(current)
        addedKeys.forEach(key => next.delete(key))
        return next
      })
    }, CARD_ENTER_DURATION)
    cardEnterTimersRef.current.add(timer)
  }, [isReady, categories, groups, phrases])

  const animateCardRemoval = useCallback((cards, onComplete) => {
    const keys = [...new Set(cards.map(({ type, id }) => cardAnimationKey(type, id)))]
    if (keys.length === 0 || keys.some(key => cardExitTimersRef.current.has(key))) return false

    const exitingPhraseIds = new Set(cards
      .filter(({ type }) => type === 'phrase')
      .map(({ id }) => String(id)))
    if (exitingPhraseIds.size > 0) {
      if (hoverPhraseIdRef.current != null && exitingPhraseIds.has(String(hoverPhraseIdRef.current))) {
        hoverPhraseIdRef.current = null
      }
      setHoverPhraseId(current => current != null && exitingPhraseIds.has(String(current)) ? null : current)
      setFlippingPhraseIds(current => {
        const next = new Set(current)
        exitingPhraseIds.forEach(id => next.delete(id))
        return next
      })
      exitingPhraseIds.forEach(id => {
        const flipTimer = flipTimersRef.current.get(id)
        if (flipTimer) clearTimeout(flipTimer)
        flipTimersRef.current.delete(id)
        const element = document.getElementById(`phrase-${id}`)
        element?.style.removeProperty('transform')
      })
      const visual = pointerVisualRef.current
      if (visual.target?.dataset?.dragType === 'phrase' && exitingPhraseIds.has(String(visual.target.dataset.dragId))) {
        if (visual.frame !== null) cancelAnimationFrame(visual.frame)
        visual.frame = null
        visual.target = null
        visual.kind = null
      }
    }

    setExitingCardKeys(current => {
      const next = new Set(current)
      keys.forEach(key => next.add(key))
      return next
    })
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    let timer = null
    const finishRemoval = () => {
      if (!pendingCardRemovalsRef.current.has(timer)) return false
      pendingCardRemovalsRef.current.delete(timer)
      keys.forEach(key => cardExitTimersRef.current.delete(key))
      try {
        onComplete()
      } finally {
        setExitingCardKeys(current => {
          const next = new Set(current)
          keys.forEach(key => next.delete(key))
          return next
          })
      }
      return true
    }
    timer = window.setTimeout(finishRemoval, reduceMotion ? 0 : CARD_EXIT_DURATION)
    pendingCardRemovalsRef.current.set(timer, finishRemoval)
    keys.forEach(key => cardExitTimersRef.current.set(key, timer))
    return true
  }, [])

  const finishPendingCardRemovals = useCallback(() => {
    let completed = 0
    for (const [timer, finishRemoval] of [...pendingCardRemovalsRef.current]) {
      clearTimeout(timer)
      if (finishRemoval()) completed++
    }
    return completed
  }, [])

  useEffect(() => () => {
    cardEnterTimersRef.current.forEach(timer => clearTimeout(timer))
    cardEnterTimersRef.current.clear()
    const completedRemovals = finishPendingCardRemovals()
    if (completedRemovals > 0) pendingSaveRef.current = latestCollectionsRef.current
    cardExitTimersRef.current.clear()
  }, [finishPendingCardRemovals])


  const checkListOverflow = useCallback(() => {
    overflowCheckFrameRef.current = null
    if (groupListRef.current) {
      // 使用 1px 容差吸收高 DPI 缩放产生的浮点数误差。
      setIsGroupListOverflowing(groupListRef.current.scrollHeight > groupListRef.current.clientHeight + 1)
    }
    if (phraseListRef.current) {
      setIsPhraseListOverflowing(phraseListRef.current.scrollHeight > phraseListRef.current.clientHeight + 1)
    }
  }, [])

  const scheduleOverflowCheck = useCallback(() => {
    if (overflowCheckFrameRef.current !== null) return
    overflowCheckFrameRef.current = requestAnimationFrame(checkListOverflow)
  }, [checkListOverflow])

  // 观察器只随列表挂载和卸载，避免数据或选中项变化时反复创建监听器。
  useEffect(() => {
    if (!isReady) return undefined
    const resizeObserver = new ResizeObserver(scheduleOverflowCheck)
    if (groupListRef.current) resizeObserver.observe(groupListRef.current)
    if (phraseListRef.current) resizeObserver.observe(phraseListRef.current)
    window.addEventListener('resize', scheduleOverflowCheck)
    scheduleOverflowCheck()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', scheduleOverflowCheck)
      if (overflowCheckFrameRef.current !== null) {
        cancelAnimationFrame(overflowCheckFrameRef.current)
        overflowCheckFrameRef.current = null
      }
    }
  }, [isReady, scheduleOverflowCheck])

  useEffect(() => {
    scheduleOverflowCheck()
  }, [groups.length, phrases.length, visibleCount, visibleGroupCount, visibleCategoryCount, searchText, selectedGroupId, selectedCategoryId, scheduleOverflowCheck])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText), 150)
    return () => clearTimeout(timer)
  }, [searchText])

  // 动态更新 uTools 功能命令（独立模块：跳转/复制常用语）
  useEffect(() => {
    // 排序会频繁改变实体顺序，但不会改变命令内容。
    // 等拖拽会话结束后再更新命令，避免拖动过程中重复调用宿主接口。
    if (isDragSessionActive) {
      if (dynamicCommandTimerRef.current) {
        clearTimeout(dynamicCommandTimerRef.current)
        dynamicCommandTimerRef.current = null
      }
      return
    }
    const commandSignature = `${actualLocale}:${createDynamicCommandSignature(categories, groups, phrases)}`
    if (dynamicCommandAppliedSignatureRef.current === commandSignature) return
    if (dynamicCommandTimerRef.current && dynamicCommandPendingSignatureRef.current === commandSignature) return
    if (dynamicCommandTimerRef.current) clearTimeout(dynamicCommandTimerRef.current)
    dynamicCommandPendingSignatureRef.current = commandSignature
    // 使用防抖，延迟2秒执行，避免启动时频繁触发
    dynamicCommandTimerRef.current = setTimeout(() => {
      dynamicCommandTimerRef.current = null
      try {
        const dynamicCmds = createDynamicCommands(categories, groups, phrases, {
          group: t('dynamic.group'),
          category: t('dynamic.category'),
          phrase: t('dynamic.phrase')
        })
        if (dynamicCmds.length > 0) {
          host.setFeature({
            code: 'phrase-dynamic-actions',
            explain: t('dynamic.explain'),
            cmds: dynamicCmds
          })
        } else {
          host.removeFeature('phrase-dynamic-actions')
        }
        dynamicCommandAppliedSignatureRef.current = commandSignature
        dynamicCommandPendingSignatureRef.current = null
      } catch (e) {
        console.warn('[DynamicCommands] Failed to update feature:', e)
      }
    }, 2000)
  }, [actualLocale, categories, groups, phrases, isDragSessionActive])

  useEffect(() => () => {
    if (dynamicCommandTimerRef.current) clearTimeout(dynamicCommandTimerRef.current)
  }, [])

  // 处理等待数据加载完成后才能执行的待办操作。
  useEffect(() => {
    // 只有数据成功加载后才执行；触发待办操作时，数据必须已从数据库回填。
    if (!pendingActionRef.current) return

    const { type, payload } = pendingActionRef.current

    if (type === 'jump-group') {
      const { 所属分组编号, 所属分类编号 } = payload
      setSelectedCategoryId(所属分类编号)
      setSelectedGroupId(所属分组编号)
      pendingActionRef.current = null
    } else if (type === 'jump-category') {
      const { 所属分类编号 } = payload
      setSelectedCategoryId(所属分类编号)
      // 没有有效选择时默认选中排序最前的分组。
      const groupsInCategory = groupsByCategory.get(所属分类编号) || []
      if (groupsInCategory.length > 0) {
        setSelectedGroupId(groupsInCategory[0].编号)
      } else {
        setSelectedGroupId(null)
      }
      pendingActionRef.current = null
    } else if (type === 'create') {
      // 将命令携带的内容直接传入创建事务，避免快速连续操作时误修改后来出现的草稿。
      createPhraseRef.current?.(typeof payload === 'string' ? payload : '')
      pendingActionRef.current = null
    } else if (type === 'search') {
      setSearchText(payload)
      setSearchFocused(true)
      setTimeout(() => searchInputRef.current?.focus(), 100)
      pendingActionRef.current = null
    }

    pendingActionRef.current = null
  }, [categories, groups, phrases])

  const persistLastViewedSelection = useCallback(() => {
    const { 所属分类编号, 所属分组编号 } = latestSelectionRef.current
    const { 分类: currentCategories, 分组: currentGroups } = latestCollectionsRef.current
    const selectedCategory = currentCategories.find(item => String(item.编号) === String(所属分类编号))

    // 启动尚未完成或命令在界面渲染前退出时，不清除已经有效的上次位置。
    if (!selectedCategory) return

    const selectedGroup = currentGroups.find(item => (
      String(item.编号) === String(所属分组编号) &&
      String(item.所属分类编号) === String(selectedCategory.编号)
    ))
    const nextSettings = mergeSettings(latestSettingsRef.current, {
      上次分类编号: selectedCategory.编号,
      上次分组编号: selectedGroup?.编号 ?? null
    })

    try {
      getDbStorage()?.setItem('app_settings', nextSettings)
      latestSettingsRef.current = nextSettings
      setSettings(nextSettings)
    } catch (e) {
      console.warn('[Settings] Failed to save last viewed location:', e)
    }
  }, [])

  // uTools 进入插件时的初始化入口。
  useEffect(() => {
    const disposeEnter = host.onPluginEnter(async ({ code, payload }) => {
      let shouldStartGuide = false
      try {
        const storage = getDbStorage()
        const hasExistingData = [
          'app_settings',
          'phrase-manager/v4/storage-version',
          'phrase-manager/v4/group/index',
          'phrase-manager/v4/category/index',
          'phrase-manager/v4/phrase/index'
        ].some(key => storage?.getItem(key) != null)
        const hasOpened = Boolean(storage?.getItem(FIRST_OPEN_GUIDE_STORAGE_KEY))
        shouldStartGuide = !hasOpened && !hasExistingData
        if (!hasOpened) storage?.setItem(FIRST_OPEN_GUIDE_STORAGE_KEY, '1')
      } catch (error) {
        console.warn('[Guide] Failed to initialize first-open marker:', error)
      }

      loadData({ restoreStartupSelection: true, reconcileLocalChanges: true })
      if (shouldStartGuide) {
        window.setTimeout(() => handleStartGuide(), 0)
      }

      if (code === 'phrase-dynamic-actions') {
        const targetName = String(payload || '').trim()

        // loadData 会在 React 提交状态前同步刷新此引用。
        // 直接复用这份权威快照，避免重复读取每个实体。
        const { 常用语: dbPhrases, 分组: dbGroups, 分类: dbCategories } = latestCollectionsRef.current
        const resolvedCommand = resolveDynamicCommand(targetName, dbCategories, dbGroups, dbPhrases, {
          group: t('dynamic.group'),
          category: t('dynamic.category'),
          phrase: t('dynamic.phrase')
        })
        if (!resolvedCommand) return

        // 1. 优先匹配常用语（标题） -> 复制并退出
        const targetPhrase = resolvedCommand.type === 'phrase'
          ? dbPhrases.find(phrase => String(phrase.编号) === resolvedCommand.id)
          : null
        if (targetPhrase) {
          try {
            await host.copyText(targetPhrase.内容)
            queuePhraseUsage(targetPhrase.编号)
            flushPendingSave()
            host.hideMainWindow()
            host.outPlugin()
          } catch (error) {
            setSnackbar({ open: true, message: translateError(error), severity: 'error', id: Date.now() })
          }
          return
        }

        // 2. 其次匹配分组 -> 跳转
        const targetGroup = resolvedCommand.type === 'group'
          ? dbGroups.find(group => String(group.编号) === resolvedCommand.id)
          : null
        if (targetGroup) {
          pendingActionRef.current = {
            type: 'jump-group',
            payload: { 所属分组编号: targetGroup.编号, 所属分类编号: targetGroup.所属分类编号 }
          }
          return
        }

        // 3. 最后匹配分类 -> 跳转
        const targetCategory = resolvedCommand.type === 'category'
          ? dbCategories.find(category => String(category.编号) === resolvedCommand.id)
          : null
        if (targetCategory) {
          pendingActionRef.current = {
            type: 'jump-category',
            payload: { 所属分类编号: targetCategory.编号 }
          }
          return
        }
      } else if (code === FEATURE_CODES.create) {
        pendingActionRef.current = { type: 'create', payload }
      } else if (code === FEATURE_CODES.search) {
        pendingActionRef.current = { type: 'search', payload }
      }
    })

    const disposeOut = host.onPluginOut(() => {
      // 宿主关闭窗口时，编辑器焦点可能还没有移出输入框。
      // 先直接保存有效草稿，再刷新剩余的集合写入队列。
      savePhraseRef.current?.(editPhraseRef.current, true, { silent: true })
      if (finishPendingCardRemovals() > 0) pendingSaveRef.current = latestCollectionsRef.current
      flushPendingSave()
      persistLastViewedSelection()
    })
    return () => {
      if (typeof disposeEnter === 'function') disposeEnter()
      if (typeof disposeOut === 'function') disposeOut()
    }
  }, [])

  const loadData = useCallback(({ restoreStartupSelection = true, reconcileLocalChanges = false } = {}) => {
    try {
      let localCollections = pendingSaveRef.current || latestCollectionsRef.current
      const baseCollections = lastPersistedCollectionsRef.current || localCollections
      const activeDraft = editPhraseRef.current
      const draftOriginal = activeDraft && localCollections.常用语.find(item => item.编号 === activeDraft.编号)
      const protectedPhraseIds = draftOriginal && !phraseEditFieldsEqual(draftOriginal, activeDraft)
        ? new Set([activeDraft.编号])
        : new Set()
      const queuedUsage = pendingUsageIncrementsRef.current
      if (queuedUsage.size > 0) {
        localCollections = normalizeCollections({
          ...localCollections,
          常用语: applyUsageIncrements(localCollections.常用语, queuedUsage)
        })
      }

      if (!reconcileLocalChanges) {
        const flushResult = flushPendingSave()
        if (!flushResult.ok) {
          setSnackbar({ open: true, message: t('snackbar.saveFailed'), severity: 'error', id: Date.now() })
          return
        }
      }
      const { 分类: savedCategories, 分组: savedGroups, 常用语: savedPhrases } = readAllCollections()

      const remoteCollections = normalizeCollections({
        分类: savedCategories || [],
        分组: savedGroups || [],
        常用语: savedPhrases || []
      })
      const loadedCollections = reconcileLocalChanges
        ? reconcilePendingCollections(baseCollections, localCollections, remoteCollections, {
          protectedPhraseIds
        })
        : remoteCollections
      const persistedCollections = reconcileLocalChanges
        ? writeAllCollections(loadedCollections)
        : loadedCollections
      pendingUsageIncrementsRef.current = new Map()
      if (usageFlushTimerRef.current !== null) {
        clearTimeout(usageFlushTimerRef.current)
        usageFlushTimerRef.current = null
      }
      pendingSaveRef.current = null
      lastPersistedCollectionsRef.current = persistedCollections
      latestCollectionsRef.current = loadedCollections
      setCategories(loadedCollections.分类)
      setGroups(loadedCollections.分组)
      setPhrases(loadedCollections.常用语)
      // 宿主重新进入或云端拉取会建立新的权威基线。
      // 旧快照不能在此之后覆盖刚加载的数据。
      resetHistoryRef.current()

      const storedSettingsValue = getDbStorage()?.getItem('app_settings')
      const storedSettings = loadSettings(storedSettingsValue)
      if (!settingsEqual(storedSettings, latestSettingsRef.current)) {
        latestSettingsRef.current = storedSettings
        setSettings(storedSettings)
      }
      const currentSelection = latestSelectionRef.current
      const shouldRestoreLast = restoreStartupSelection && storedSettings.启动时打开 !== 'first'
      const selection = resolveLibrarySelection(
        loadedCollections.分类,
        loadedCollections.分组,
        shouldRestoreLast ? storedSettings.上次分类编号 : (restoreStartupSelection ? null : currentSelection.所属分类编号),
        shouldRestoreLast ? storedSettings.上次分组编号 : (restoreStartupSelection ? null : currentSelection.所属分组编号)
      )
      setSelectedCategoryId(selection.categoryId)
      setSelectedGroupId(selection.groupId)
    } catch (e) {
      console.error('[LoadData] Error:', e)
    } finally {
      setIsReady(true)
    }
  }, [])

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const queuedUsage = pendingUsageIncrementsRef.current
    let data = pendingSaveRef.current
    if (queuedUsage.size > 0) {
      const baseData = data || latestCollectionsRef.current
      data = normalizeCollections({ ...baseData, 常用语: applyUsageIncrements(baseData.常用语, queuedUsage) })
    }
    if (!data) return { ok: true, data: null }
    try {
      const persistedData = writeAllCollections(data)
      pendingSaveRef.current = null
      lastPersistedCollectionsRef.current = persistedData
      latestCollectionsRef.current = data
      if (queuedUsage.size > 0) {
        pendingUsageIncrementsRef.current = new Map()
        if (usageFlushTimerRef.current !== null) {
          clearTimeout(usageFlushTimerRef.current)
          usageFlushTimerRef.current = null
        }
        // 让界面显示的使用次数与上面刚写入的快照保持一致。
        setPhrases(data.常用语)
      }
      return { ok: true, data }
    } catch (e) {
      console.error('[SaveData] Failed to flush data:', e)
      return { ok: false, data }
    }
  }, [])

  // 监听数据变化自动保存，解决持久化不同步问题
  useEffect(() => {
    // 跳过首次渲染（避免覆盖已有数据或重复写入）
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const snapshot = normalizeCollections({
      分类: storedCategories,
      分组: storedGroups,
      常用语: storedPhrases
    })
    const persisted = lastPersistedCollectionsRef.current
    if (persisted &&
      persisted.分类 === snapshot.分类 &&
      persisted.分组 === snapshot.分组 &&
      persisted.常用语 === snapshot.常用语) return

    pendingSaveRef.current = snapshot
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (isDragSessionActive) return

    // 将快速复制等短时间内的连续变更合并为一次存储事务。
    saveTimerRef.current = setTimeout(() => {
      const result = flushPendingSave()
      if (!result.ok) {
        setSnackbar({ open: true, message: t('snackbar.saveFailed'), severity: 'error', id: Date.now() })
      }
    }, 180)
  }, [flushPendingSave, storedCategories, storedGroups, storedPhrases, isDragSessionActive])

  // 插件销毁前刷新最近一次快照，避免退出时丢失尚未落盘的修改。
  useEffect(() => () => {
    flushPendingSave()
  }, [flushPendingSave])

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity, id: Date.now() })
  }, [])

  const requestPhraseSelection = useCallback((phraseId) => {
    if (GUIDE_PHRASE_IDS.has(phraseId)) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    const draft = editPhraseRef.current
    if (draft?.编号 === phraseId) return
    const original = draft && latestCollectionsRef.current.常用语.find(p => p.编号 === draft.编号)
    const dirty = Boolean(original && !phraseEditFieldsEqual(original, draft))
    if (dirty) {
      pendingPhraseCreationRef.current = null
      pendingPhraseSelectionRef.current = phraseId
      isExitingRef.current = true
      setExitDialogOpen(true)
      return
    }
    pendingPhraseCreationRef.current = null
    pendingPhraseSelectionRef.current = null
    isExitingRef.current = false
    setSelectedPhraseId(phraseId)
  }, [])

  // 以最近一次持久化快照为基线合并云端数据：本地未修改的实体接受远端版本，
  // 本地尚未保存的实体保留本地版本。
  useEffect(() => {
    const handleDbPull = () => {
      const draft = editPhraseRef.current
      const original = draft && latestCollectionsRef.current.常用语.find(item => item.编号 === draft.编号)
      if (original && !phraseEditFieldsEqual(original, draft)) {
        showSnackbar(t('snackbar.cloudUpdatedDraftPreserved'), 'warning')
      }
      loadData({ restoreStartupSelection: false, reconcileLocalChanges: true })
    }
    const disposer = host.onDbPull(handleDbPull)
    return typeof disposer === 'function' ? disposer : undefined
  }, [loadData, showSnackbar])

  // ==================== AI 辅助函数 ====================
  // AI 生成/优化常用语内容（流式）
  const handleAiGenerateContent = useCallback(async (prompt, mode = 'generate', existingContent = '') => {
    if (!prompt?.trim() && mode === 'generate') return
    const requestId = ++aiContentRequestIdRef.current
    if (aiStreamFrameRef.current !== null) cancelAnimationFrame(aiStreamFrameRef.current)
    aiStreamFrameRef.current = null
    aiStreamBufferRef.current = ''
    setAiContentLoading(true)
    setAiError(null)
    setAiResult('')

    let systemPrompt = ''
    let userPrompt = prompt

    if (mode === 'optimize') {
      systemPrompt = t('ai.prompt.optimizeSystem')
      userPrompt = existingContent
    } else if (mode === 'theme') {
      systemPrompt = t('ai.prompt.themeSystem')
      userPrompt = t('ai.prompt.themeUser', {
        content: existingContent,
        extra: prompt ? t('ai.prompt.extraRequirements', { prompt }) : ''
      })
    } else {
      systemPrompt = String(settings.人工智能内容提示词 || '').trim() || t('ai.prompt.generateSystem')
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    try {
      let receivedContent = ''
      const aiOptions = { messages }
      if (settings.人工智能模型) aiOptions.model = settings.人工智能模型
      const promise = host.ai(aiOptions, (chunk) => {
        if (requestId === aiContentRequestIdRef.current && chunk.content) {
          receivedContent += chunk.content
          aiStreamBufferRef.current += chunk.content
          if (aiStreamFrameRef.current === null) {
            aiStreamFrameRef.current = requestAnimationFrame(() => {
              aiStreamFrameRef.current = null
              const buffered = aiStreamBufferRef.current
              aiStreamBufferRef.current = ''
              if (buffered && requestId === aiContentRequestIdRef.current) {
                setAiResult(prev => prev + buffered)
              }
            })
          }
        }
      })
      aiAbortRef.current = promise
      const finalResult = await promise
      if (!receivedContent && finalResult?.content && requestId === aiContentRequestIdRef.current) {
        receivedContent = String(finalResult.content)
        setAiResult(receivedContent)
      }
      if (!receivedContent.trim() && requestId === aiContentRequestIdRef.current) {
        setAiError({
          operation: 'content',
          message: t('ai.invalidFormat'),
          rawSummary: summarizeAiResponse(finalResult?.content)
        })
      }
    } catch (e) {
      if (e?.name !== 'AbortError' && requestId === aiContentRequestIdRef.current) {
        setAiError({ operation: 'content', message: explainAiError(e), rawSummary: '' })
      }
    } finally {
      if (requestId === aiContentRequestIdRef.current) {
        flushAiStream(requestId)
        setAiContentLoading(false)
        aiAbortRef.current = null
      }
    }
  }, [flushAiStream, settings.人工智能内容提示词, settings.人工智能模型])

  // AI 智能归类（非流式）- 同时推荐分类和分组
  const handleAiSuggestCategory = useCallback(async (content) => {
    const currentCategories = categories.filter(category => (
      !category?.是否新建 && !category?.是否引导演示 && String(category?.名称 || '').trim()
    ))
    const currentCategoryIds = new Set(currentCategories.map(category => String(category.编号)))
    const currentGroups = groups.filter(group => (
      !group?.是否新建 && !group?.是否引导演示 && String(group?.名称 || '').trim() &&
      currentCategoryIds.has(String(group?.所属分类编号))
    ))
    if (!content?.trim() || currentGroups.length === 0 || currentCategories.length === 0) return null
    const requestId = ++aiCategorizeRequestIdRef.current
    const targetPhraseId = editPhraseRef.current?.编号 ?? null
    aiCategorizeTargetRef.current = targetPhraseId

    // 构建新语义结构：分类为顶层，分组为子级。
    const groupsByCategoryForAi = new Map()
    currentGroups.forEach(childGroup => {
      const categoryId = String(childGroup.所属分类编号)
      const existing = groupsByCategoryForAi.get(categoryId)
      if (existing) existing.push(childGroup)
      else groupsByCategoryForAi.set(categoryId, [childGroup])
    })
    const currentCategoriesWithGroups = currentCategories.filter(category => (
      (groupsByCategoryForAi.get(String(category.编号)) || []).length > 0
    ))
    if (currentCategoriesWithGroups.length === 0) return null
    const structure = JSON.stringify(currentCategoriesWithGroups.map(topLevelCategory => ({
      分类: topLevelCategory.名称,
      分组: (groupsByCategoryForAi.get(String(topLevelCategory.编号)) || []).map(childGroup => childGroup.名称)
    })))

    const configuredCategorizePrompt = String(settings.人工智能归类提示词 || '').trim()
    const categorizePromptTemplate = configuredCategorizePrompt || t('ai.prompt.categorizeSystem')
    const semanticContract = configuredCategorizePrompt
      ? `\nIMPORTANT CONTRACT (overrides conflicting hierarchy instructions or examples above): [${t('label.category')}:TOP_LEVEL] > [${t('label.group')}:NESTED]. JSON only: {"分类":"TOP_LEVEL_NAME","分组":"NESTED_NAME"}.`
      : ''
    const categorizeSystemPrompt = (categorizePromptTemplate.includes('{structure}')
      ? categorizePromptTemplate.replace(/\{structure\}/g, structure)
      : `${categorizePromptTemplate}\n${structure}`) + semanticContract
    const messages = [
      {
        role: 'system', content: categorizeSystemPrompt },
      { role: 'user', content }
    ]

    try {
      setAiCategorizeLoading(true)
      const aiOptions = { messages }
      if (settings.人工智能模型) aiOptions.model = settings.人工智能模型
      const result = await host.ai(aiOptions)
      if (requestId !== aiCategorizeRequestIdRef.current ||
        aiCategorizeTargetRef.current !== targetPhraseId ||
        editPhraseRef.current?.编号 !== targetPhraseId) return null
      const text = String(result?.content ?? '').trim()
      try {
        const parsed = JSON.parse(text)
        const topLevelCategory = typeof parsed?.分类 === 'string' ? parsed.分类.trim() : ''
        const childGroup = typeof parsed?.分组 === 'string' ? parsed.分组.trim() : ''
        const resultKeys = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? Object.keys(parsed) : []
        if (resultKeys.length === 2 && resultKeys.includes('分类') && resultKeys.includes('分组') && topLevelCategory && childGroup) {
          return { topLevelCategory, childGroup }
        }
      } catch {
      // AI 必须返回完整 JSON，不接受夹杂说明或代码围栏。
      }
      setAiError({
        operation: 'categorize',
        message: t('ai.invalidFormat'),
        rawSummary: summarizeAiResponse(text)
      })
      return { __error: true }
    } catch (e) {
      if (requestId !== aiCategorizeRequestIdRef.current ||
        aiCategorizeTargetRef.current !== targetPhraseId ||
        editPhraseRef.current?.编号 !== targetPhraseId) return null
      setAiError({ operation: 'categorize', message: explainAiError(e), rawSummary: '' })
      return { __error: true }
    } finally {
      if (requestId === aiCategorizeRequestIdRef.current) setAiCategorizeLoading(false)
    }
  }, [groups, categories, settings.人工智能归类提示词, settings.人工智能模型])

  // AI 优化标题（非流式）
  const handleAiGenerateTitle = useCallback(async (content) => {
    if (!content?.trim()) return null
    const requestId = ++aiTitleRequestIdRef.current
    const targetPhraseId = editPhraseRef.current?.编号 ?? null
    aiTitleTargetRef.current = targetPhraseId

    const messages = [
      { role: 'system', content: String(settings.人工智能标题提示词 || '').trim() || t('ai.prompt.titleSystem') },
      { role: 'user', content }
    ]

    try {
      setAiTitleLoading(true)
      const aiOptions = { messages }
      if (settings.人工智能模型) aiOptions.model = settings.人工智能模型
      const result = await host.ai(aiOptions)
      if (requestId !== aiTitleRequestIdRef.current ||
        aiTitleTargetRef.current !== targetPhraseId ||
        editPhraseRef.current?.编号 !== targetPhraseId) return null
      const title = String(result?.content ?? '').trim()
      if (title) return title
      setAiError({ operation: 'title', message: t('ai.invalidFormat'), rawSummary: summarizeAiResponse(result?.content) })
      return null
    } catch (e) {
      if (requestId !== aiTitleRequestIdRef.current ||
        aiTitleTargetRef.current !== targetPhraseId ||
        editPhraseRef.current?.编号 !== targetPhraseId) return null
      setAiError({ operation: 'title', message: explainAiError(e), rawSummary: '' })
      return null
    } finally {
      if (requestId === aiTitleRequestIdRef.current) setAiTitleLoading(false)
    }
  }, [settings.人工智能模型, settings.人工智能标题提示词])

  const handleAiCategorizeEditPhrase = async () => {
    if (!editPhrase.内容?.trim()) {
      showSnackbar(t('ai.inputRequired'), 'warning')
      return
    }
    setAiError(null)
    const suggested = await handleAiSuggestCategory(editPhrase.内容)
    if (suggested?.__error) return
    if (suggested && suggested.topLevelCategory && suggested.childGroup) {
      const currentCollections = latestCollectionsRef.current
      const topLevelCategory = currentCollections.分类.find(item => item.名称 === suggested.topLevelCategory)
      const childGroup = currentCollections.分组.find(item => (
        item.名称 === suggested.childGroup && item.所属分类编号 === topLevelCategory?.编号
      ))
      if (topLevelCategory && childGroup) {
        const currentGroupId = String(editPhraseRef.current?.所属分组编号 ?? '').trim()
        const suggestedGroupId = String(childGroup.编号 ?? '').trim()
        if (currentGroupId === suggestedGroupId) {
          showSnackbar(t('ai.noChange'), 'info')
          return
        }
        recordHistoryRef.current()
        const nextDraft = editPhraseRef.current ? { ...editPhraseRef.current, 所属分组编号: childGroup.编号 } : null
        editPhraseRef.current = nextDraft
        setSelectedCategoryId(topLevelCategory.编号)
        setSelectedGroupId(childGroup.编号)
        setEditPhrase(nextDraft)
        showSnackbar(t('ai.categorized', { category: suggested.topLevelCategory, group: suggested.childGroup }))
      } else if (!topLevelCategory) {
        showSnackbar(t('ai.categoryNotFound', { category: suggested.topLevelCategory }), 'warning')
      } else {
        showSnackbar(t('ai.groupNotFound', { group: suggested.childGroup }), 'warning')
      }
    } else {
      showSnackbar(t('ai.noSuggestion'), 'warning')
    }
  }

  const handleAiTitleEditPhrase = async () => {
    if (!editPhrase?.内容?.trim()) {
      showSnackbar(t('ai.inputRequired'), 'warning')
      return
    }
    setAiError(null)
    const title = await handleAiGenerateTitle(editPhrase.内容)
    if (title) {
      if (title === String(editPhraseRef.current?.标题 ?? '')) {
        showSnackbar(t('ai.noChange'), 'info')
        return
      }
      applyEditPhraseChange({ 标题: title })
      showSnackbar(t('ai.titleGenerated'))
    }
  }

  const handleAiRetry = () => {
    if (!aiError) return
    if (aiError.operation === 'content') {
      handleAiGenerateContent(aiPrompt, aiMode, editPhrase?.内容 || '')
    } else if (aiError.operation === 'categorize') {
      handleAiCategorizeEditPhrase()
    } else if (aiError.operation === 'title') {
      handleAiTitleEditPhrase()
    }
  }

  const captureHistorySnapshot = useCallback((overrides = {}) => {
    // 集合更新遵循不可变原则。保留数组引用可以降低大规模历史记录的成本，
    // 同时仍然保存每个时间点的准确状态。
    const current = latestCollectionsRef.current
    const ui = latestHistoryUiRef.current || {}
    const pendingUsage = pendingUsageIncrementsRef.current
    const effectivePhrases = pendingUsage.size > 0
      ? applyUsageIncrements(current.常用语, pendingUsage)
      : current.常用语
    const snapshot = {
      分类: current.分类,
      分组: current.分组,
      常用语: effectivePhrases,
      settings: latestSettingsRef.current,
      sortBy: ui.sortBy ?? 'custom',
      selectedCategoryId: ui.selectedCategoryId ?? null,
      selectedGroupId: ui.selectedGroupId ?? null,
      selectedPhraseId: ui.selectedPhraseId ?? null,
      editPhrase: ui.editPhrase ?? null,
      batchMode: Boolean(ui.batchMode),
      selectedPhraseIds: new Set(ui.selectedPhraseIds || []),
      selectedGroupIds: new Set(ui.selectedGroupIds || []),
      lastSelectedPhraseId: ui.lastSelectedPhraseId ?? null,
      lastSelectedGroupId: ui.lastSelectedGroupId ?? null,
      guideStep: ui.guideStep ?? -1,
      helpOpen: Boolean(ui.helpOpen)
    }
    Object.assign(snapshot, overrides)
    snapshot.entityCount = snapshot.分类.length + snapshot.分组.length + snapshot.常用语.length
    return snapshot
  }, [])

  const trimHistoryStack = useCallback((stackRef, entityCountRef) => {
    while (stackRef.current.length > 1 && (stackRef.current.length > 50 || entityCountRef.current > 200000)) {
      const removed = stackRef.current.shift()
      entityCountRef.current = Math.max(0, entityCountRef.current - (removed.entityCount || 0))
    }
  }, [])

  const pushHistorySnapshot = useCallback((stackRef, entityCountRef, snapshot) => {
    stackRef.current.push(snapshot)
    entityCountRef.current += snapshot.entityCount || 0
    trimHistoryStack(stackRef, entityCountRef)
  }, [trimHistoryStack])

  const clearRedoHistory = useCallback(() => {
    redoHistoryRef.current = []
    redoHistoryEntityCountRef.current = 0
  }, [])

  const commitHistorySnapshot = useCallback((snapshot, { mergeKey = null, mergeWindowMs = 0 } = {}) => {
    if (!snapshot) return
    const now = Date.now()
    const lastSnapshot = historyRef.current[historyRef.current.length - 1]
    clearRedoHistory()

    if (mergeKey && lastSnapshot?.mergeKey === mergeKey && now - (lastSnapshot.recordedAt || 0) <= mergeWindowMs) {
      // 保留第一个事件发生前的状态；滑块或其他连续操作仍在进行时，
      // 只延长合并窗口，不重复创建历史记录。
      lastSnapshot.recordedAt = now
      return
    }

    pushHistorySnapshot(historyRef, historyEntityCountRef, {
      ...snapshot,
      mergeKey,
      recordedAt: now
    })
  }, [clearRedoHistory, pushHistorySnapshot])

  // 添加当前状态到历史记录
  const addToHistory = useCallback((options) => {
    commitHistorySnapshot(captureHistorySnapshot(), options)
  }, [captureHistorySnapshot, commitHistorySnapshot])

  const resetHistory = useCallback(() => {
    historyRef.current = []
    redoHistoryRef.current = []
    historyEntityCountRef.current = 0
    redoHistoryEntityCountRef.current = 0
  }, [])

  recordHistoryRef.current = addToHistory
  resetHistoryRef.current = resetHistory

  const setsEqual = (left, right) => {
    if (left === right) return true
    if (!left || !right || left.size !== right.size) return false
    for (const value of left) if (!right.has(value)) return false
    return true
  }

  const shallowObjectsEqual = (left, right) => {
    if (left === right) return true
    if (!left || !right) return false
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    return leftKeys.length === rightKeys.length && leftKeys.every(key => left[key] === right[key])
  }

  const historySnapshotsEqual = (left, right) => Boolean(left && right &&
    left.分类 === right.分类 &&
    left.分组 === right.分组 &&
    left.常用语 === right.常用语 &&
    left.settings === right.settings &&
    left.sortBy === right.sortBy &&
    left.selectedCategoryId === right.selectedCategoryId &&
    left.selectedGroupId === right.selectedGroupId &&
    left.selectedPhraseId === right.selectedPhraseId &&
    shallowObjectsEqual(left.editPhrase, right.editPhrase) &&
    left.batchMode === right.batchMode &&
    setsEqual(left.selectedPhraseIds, right.selectedPhraseIds) &&
    setsEqual(left.selectedGroupIds, right.selectedGroupIds) &&
    left.lastSelectedPhraseId === right.lastSelectedPhraseId &&
    left.lastSelectedGroupId === right.lastSelectedGroupId &&
    left.guideStep === right.guideStep &&
    left.helpOpen === right.helpOpen)

  const findDistinctHistoryIndex = (stack, currentSnapshot) => {
    for (let index = stack.length - 1; index >= 0; index--) {
      if (!historySnapshotsEqual(stack[index], currentSnapshot)) return index
    }
    return -1
  }

  const removeHistoryTail = (stackRef, entityCountRef, fromIndex) => {
    const removed = stackRef.current.splice(fromIndex)
    const removedEntities = removed.reduce((total, snapshot) => total + (snapshot.entityCount || 0), 0)
    entityCountRef.current = Math.max(0, entityCountRef.current - removedEntities)
  }

  const restoreHistorySnapshot = useCallback((snapshot) => {
    const currentCollections = latestCollectionsRef.current
    const currentSettings = latestSettingsRef.current
    const restoredCollections = normalizeCollections({
      分类: snapshot.分类,
      分组: snapshot.分组,
      常用语: snapshot.常用语
    })
    const collectionsChanged = currentCollections.分类 !== restoredCollections.分类 ||
      currentCollections.分组 !== restoredCollections.分组 ||
      currentCollections.常用语 !== restoredCollections.常用语
    const restoredSettings = snapshot.settings ? normalizeSettings(snapshot.settings) : null
    const settingsChanged = restoredSettings && restoredSettings !== currentSettings
    const storage = getDbStorage()
    const previousPendingSave = pendingSaveRef.current
    const previousUsageIncrements = pendingUsageIncrementsRef.current
    const hadUsageFlushTimer = usageFlushTimerRef.current !== null

    if (usageFlushTimerRef.current !== null) {
      clearTimeout(usageFlushTimerRef.current)
      usageFlushTimerRef.current = null
    }
    pendingUsageIncrementsRef.current = new Map()

    try {
      if (settingsChanged) storage?.setItem('app_settings', restoredSettings)
      if (collectionsChanged) {
        pendingSaveRef.current = restoredCollections
        const saveResult = flushPendingSave()
        if (!saveResult.ok) throw new Error('Failed to persist restored collections')
      }
    } catch (error) {
      pendingSaveRef.current = previousPendingSave
      pendingUsageIncrementsRef.current = previousUsageIncrements
      if (hadUsageFlushTimer && previousUsageIncrements.size > 0) {
        usageFlushTimerRef.current = setTimeout(flushUsageIncrements, 120)
      }
      if (settingsChanged) {
        try { storage?.setItem('app_settings', currentSettings) } catch { /* 尽力恢复设置；恢复失败不再继续抛出异常。 */ }
      }
      console.error('[History] Failed to restore snapshot:', error)
      showSnackbar(t('snackbar.saveFailed'), 'error')
      return false
    }

    if (!collectionsChanged) {
      latestCollectionsRef.current = restoredCollections
    }
    if (settingsChanged) {
      latestSettingsRef.current = restoredSettings
      setSettings(restoredSettings)
    }

    const orderedCategories = [...restoredCollections.分类]
      .sort((a, b) => (Number(a.排序) || 0) - (Number(b.排序) || 0))
    const requestedCategory = snapshot.selectedCategoryId == null
      ? null
      : orderedCategories.find(item => String(item.编号) === String(snapshot.selectedCategoryId))
    const fallbackCategory = snapshot.selectedCategoryId == null ? null : orderedCategories[0]
    const nextCategoryId = (requestedCategory || fallbackCategory)?.编号 ?? null
    const groupsInCategory = restoredCollections.分组
      .filter(item => String(item.所属分类编号) === String(nextCategoryId))
      .sort((a, b) => (Number(a.排序) || 0) - (Number(b.排序) || 0))
    const requestedGroup = snapshot.selectedGroupId == null
      ? null
      : groupsInCategory.find(item => String(item.编号) === String(snapshot.selectedGroupId))
    const fallbackGroup = snapshot.selectedGroupId == null ? null : groupsInCategory[0]
    const nextGroupId = (requestedGroup || fallbackGroup)?.编号 ?? null
    const requestedPhrase = snapshot.selectedPhraseId == null
      ? null
      : restoredCollections.常用语.find(item => String(item.编号) === String(snapshot.selectedPhraseId))
    const nextPhraseId = requestedPhrase?.编号 ?? null
    const nextEditPhrase = nextPhraseId
      ? (snapshot.editPhrase?.编号 === nextPhraseId ? snapshot.editPhrase : { ...requestedPhrase })
      : null
    const validPhraseIds = new Set(restoredCollections.常用语.map(item => item.编号))
    const validGroupIds = new Set(restoredCollections.分组.map(item => item.编号))
    const nextSelectedPhraseIds = new Set([...snapshot.selectedPhraseIds].filter(id => validPhraseIds.has(id)))
    const nextSelectedGroupIds = new Set([...snapshot.selectedGroupIds].filter(id => validGroupIds.has(id)))

    latestSelectionRef.current = { 所属分类编号: nextCategoryId, 所属分组编号: nextGroupId }
    editPhraseRef.current = nextEditPhrase
    latestGuideStepRef.current = snapshot.guideStep ?? -1
    latestHistoryUiRef.current = {
      settings: restoredSettings || currentSettings,
      sortBy: snapshot.sortBy,
      selectedCategoryId: nextCategoryId,
      selectedGroupId: nextGroupId,
      selectedPhraseId: nextPhraseId,
      editPhrase: nextEditPhrase,
      batchMode: snapshot.batchMode,
      selectedPhraseIds: nextSelectedPhraseIds,
      selectedGroupIds: nextSelectedGroupIds,
      lastSelectedPhraseId: snapshot.lastSelectedPhraseId,
      lastSelectedGroupId: snapshot.lastSelectedGroupId,
      guideStep: snapshot.guideStep ?? -1,
      helpOpen: snapshot.helpOpen
    }

    setCategories(restoredCollections.分类)
    setGroups(restoredCollections.分组)
    setPhrases(restoredCollections.常用语)
    setSortBy(snapshot.sortBy || 'custom')
    setSelectedCategoryId(nextCategoryId)
    setSelectedGroupId(nextGroupId)
    setSelectedPhraseId(nextPhraseId)
    setEditPhrase(nextEditPhrase)
    setBatchMode(Boolean(snapshot.batchMode))
    setSelectedPhraseIds(nextSelectedPhraseIds)
    setSelectedGroupIds(nextSelectedGroupIds)
    setLastSelectedPhraseId(snapshot.lastSelectedPhraseId ?? null)
    setLastSelectedGroupId(snapshot.lastSelectedGroupId ?? null)
    setGuideStep(snapshot.guideStep ?? -1)
    setHelpOpen(Boolean(snapshot.helpOpen))

    // 清除临时交互状态，避免恢复后的卡片残留过期拖拽、内联编辑或确认遮罩。
    inlineGroupDraftRef.current = { 编号: null, 名称: '' }
    inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
    setInlineEditGroupId(null)
    setInlineEditGroupName('')
    setInlineEditCategoryId(null)
    setInlineEditCategoryName('')
    setExitDialogOpen(false)
    isExitingRef.current = false
    pendingPhraseSelectionRef.current = null
    pendingPhraseCreationRef.current = null
    pendingCollectionCreationRef.current = null
    setDraggingPhraseId(null)
    setDragOverGroupId(null)
    setIsDragSessionActive(false)
    dragSessionActiveRef.current = false
    dragItem.current = null
    dragHistoryRecordedRef.current = false
    lastDragTargetRef.current = null
    pendingDragPointRef.current = null
    return true
  }, [flushPendingSave, flushUsageIncrements, showSnackbar])

  // 执行撤销
  const handleUndo = useCallback(() => {
    const currentState = captureHistorySnapshot()
    const previousIndex = findDistinctHistoryIndex(historyRef.current, currentState)
    if (previousIndex < 0) return
    const previousState = historyRef.current[previousIndex]
    if (!restoreHistorySnapshot(previousState)) return

    removeHistoryTail(historyRef, historyEntityCountRef, previousIndex)
    pushHistorySnapshot(redoHistoryRef, redoHistoryEntityCountRef, currentState)
    showSnackbar(t('snackbar.undone'), 'info')
  }, [captureHistorySnapshot, pushHistorySnapshot, restoreHistorySnapshot, showSnackbar])

  // 执行重做
  const handleRedo = useCallback(() => {
    const currentState = captureHistorySnapshot()
    const nextIndex = findDistinctHistoryIndex(redoHistoryRef.current, currentState)
    if (nextIndex < 0) return
    const nextState = redoHistoryRef.current[nextIndex]
    if (!restoreHistorySnapshot(nextState)) return

    removeHistoryTail(redoHistoryRef, redoHistoryEntityCountRef, nextIndex)
    pushHistorySnapshot(historyRef, historyEntityCountRef, currentState)
    showSnackbar(t('snackbar.redone'), 'info')
  }, [captureHistorySnapshot, pushHistorySnapshot, restoreHistorySnapshot, showSnackbar])

  const handleSortChange = (nextSortBy) => {
    setSortMenuAnchor(null)
    if (nextSortBy === sortBy) return
    addToHistory()
    if (latestHistoryUiRef.current) latestHistoryUiRef.current.sortBy = nextSortBy
    setSortBy(nextSortBy)
  }

  const updateEditPhraseDraft = (updates) => {
    const currentDraft = editPhraseRef.current
    if (!currentDraft) return
    const changed = Object.keys(updates).some(key => currentDraft[key] !== updates[key])
    if (!changed) return
    const nextDraft = { ...currentDraft, ...updates }
    editPhraseRef.current = nextDraft
    if (latestHistoryUiRef.current) latestHistoryUiRef.current.editPhrase = nextDraft
    setEditPhrase(nextDraft)
  }

  const applyEditPhraseChange = (updates) => {
    const currentDraft = editPhraseRef.current
    if (!currentDraft || !Object.keys(updates).some(key => currentDraft[key] !== updates[key])) return
    addToHistory()
    updateEditPhraseDraft(updates)
  }

  // 分组操作
  const handleCreateGroup = () => {
    // 打开新的编辑器前先完成上一个内联编辑项；名称重复校验失败时，
    // 必须保留当前编辑器和用户输入。
    if (inlineCategoryDraftRef.current.编号) {
      const categoryResult = handleSaveInlineCategory()
      if (!categoryResult.ok) return { ok: false, status: 'category-not-saved' }
    }
    if (inlineGroupDraftRef.current.编号) {
      const groupResult = handleSaveInlineGroup()
      if (!groupResult.ok) return groupResult
    }

    const current = latestCollectionsRef.current
    const selection = latestSelectionRef.current
    const availableCategories = current.分类
    let targetCategoryId = selection.所属分类编号
    const selectedCategoryExists = availableCategories.some(category => category.编号 === targetCategoryId)

    if (!selectedCategoryExists) {
      const firstCategory = [...availableCategories].sort((a, b) => (a.排序 || 0) - (b.排序 || 0))[0]
      if (firstCategory) {
        targetCategoryId = firstCategory.编号
      } else {
        openCreateCollectionDialog('group')
        return { ok: false, status: 'collection-name-required' }
      }
    }

    addToHistory()
    previousGroupSelectionRef.current = { ...selection }

    const tempId = `new-group-${generateId()}`
    const siblingOrders = current.分组
      .filter(group => group.所属分类编号 === targetCategoryId)
      .map(group => Number(group.排序) || 0)
    const newGroup = {
      编号: tempId,
      名称: '',
      排序: Math.max(-1, ...siblingOrders) + 1,
      是否新建: true,
      所属分类编号: targetCategoryId,
      创建时间: Date.now()
    }
    const nextGroups = [...current.分组, newGroup]
    inlineGroupDraftRef.current = { 编号: tempId, 名称: '' }
    setGroups(nextGroups)
    setSelectedCategoryId(targetCategoryId)
    setSelectedGroupId(tempId)
    setInlineEditGroupId(tempId)
    setInlineEditGroupName('')
    return { ok: true, id: tempId, 所属分类编号: targetCategoryId }
  }
  const handleEditGroup = (group) => {
    if (group?.是否引导演示) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    // 延迟执行，防止菜单关闭时焦点回归导致输入框立即触发失焦事件。
    setTimeout(() => {
      inlineGroupDraftRef.current = { 编号: group.编号, 名称: group.名称 }
      setInlineEditGroupId(group.编号)
      setInlineEditGroupName(group.名称)
    }, 50)
  }
  const handleDeleteGroup = (id) => {
    if (id === GUIDE_IDS.group) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    // 删除父级时必须从完整运行态集合收集子级；索引会主动忽略空名称的
    // 瞬态编辑项，若只读索引会留下孤儿常用语。
    const current = latestCollectionsRef.current
    const childPhraseIds = current.常用语
      .filter(phrase => String(phrase.所属分组编号) === String(id))
      .map(phrase => phrase.编号)
    animateCardRemoval([
      { type: 'group', id },
      ...childPhraseIds.map(phraseId => ({ type: 'phrase', id: phraseId }))
    ], () => {
      addToHistory()
      setGroups(prev => prev.filter(group => group.编号 !== id))
      setPhrases(prev => prev.filter(p => p.所属分组编号 !== id))
      if (selectedGroupId === id) setSelectedGroupId(null)
      showSnackbar(t('snackbar.groupDeleted'))
    })
  }
  const handleSaveInlineGroup = () => {
    const draft = inlineGroupDraftRef.current
    const draftId = draft.编号
    if (!draftId) return { ok: true, status: 'no-draft', id: null }

    const current = latestCollectionsRef.current
    let trimmedName = String(draft.名称 || '').trim()
    const isNewGroup = String(draftId).startsWith('new-group-')
    const draftGroup = current.分组.find(group => group.编号 === draftId)
    const categoryId = draftGroup?.所属分类编号 || latestSelectionRef.current.所属分类编号
    const parentCategory = current.分类.find(category => String(category.编号) === String(categoryId))
    if (!parentCategory) {
      if (!duplicateWarningShownRef.current) {
        duplicateWarningShownRef.current = true
        showSnackbar(t('snackbar.categoryRequired'), 'warning')
      }
      requestAnimationFrame(() => inlineEditInputRef.current?.focus())
      return { ok: false, status: 'category-required', id: draftId }
    }

    // 若新建分组名称为空，自动生成默认名称
    if (!trimmedName && isNewGroup) {
      let baseName = t('defaults.groupName')
      let finalName = baseName
      let counter = 1
      while (current.分组.some(group => group.所属分类编号 === categoryId && group.名称 === finalName && group.编号 !== draftId)) {
        finalName = `${baseName}(${counter})`
        counter++
      }
      trimmedName = finalName
    }

    if (!trimmedName) {
      inlineGroupDraftRef.current = { 编号: null, 名称: '' }
      setInlineEditGroupId(null)
      setInlineEditGroupName('')
      return { ok: true, status: 'cancelled-empty', id: draftId }
    }
    const isDuplicate = current.分组.some(group => (
      group.所属分类编号 === categoryId && group.名称 === trimmedName && group.编号 !== draftId
    ))
    if (isDuplicate) {
      // 防止重复警告（失焦事件可能连续触发多次）。
      if (!duplicateWarningShownRef.current) {
        duplicateWarningShownRef.current = true
        showSnackbar(t('snackbar.groupNameExists'), 'warning')
      }
      // 重新聚焦输入框，使失焦处理行为与按 Enter 提交保持一致。
      requestAnimationFrame(() => {
        inlineEditInputRef.current?.focus()
      })
      return { ok: false, status: 'duplicate', id: draftId }
    }
    duplicateWarningShownRef.current = false

    if (isNewGroup) {
      const temporary = current.分组.find(group => group.编号 === draftId)
      if (!temporary) {
        inlineGroupDraftRef.current = { 编号: null, 名称: '' }
        setInlineEditGroupId(null)
        setInlineEditGroupName('')
        return { ok: true, status: 'already-saved', id: latestSelectionRef.current.所属分组编号 }
      }

      const newId = generateId()
      const nextGroups = current.分组.map(group => {
        if (group.编号 !== draftId) return group
        const persistedGroup = { ...group }
        delete persistedGroup.是否新建
        return { ...persistedGroup, 编号: newId, 名称: trimmedName }
      })
      const nextPhrases = current.常用语.map(phrase => phrase.所属分组编号 === draftId
        ? { ...phrase, 所属分组编号: newId }
        : phrase)
      const activeDraft = editPhraseRef.current
      const nextEditPhrase = activeDraft?.所属分组编号 === draftId
        ? { ...activeDraft, 所属分组编号: newId }
        : activeDraft

      inlineGroupDraftRef.current = { 编号: null, 名称: '' }
      setGroups(nextGroups)
      if (nextPhrases !== current.常用语) setPhrases(nextPhrases)
      setSelectedCategoryId(temporary.所属分类编号)
      setSelectedGroupId(newId)
      if (nextEditPhrase !== activeDraft) {
        editPhraseRef.current = nextEditPhrase
        setEditPhrase(nextEditPhrase)
      }
      setInlineEditGroupId(null)
      setInlineEditGroupName('')
      triggerConfetti()
      showSnackbar(t('snackbar.groupCreated'))
      return { ok: true, status: 'created', id: newId, 所属分类编号: temporary.所属分类编号 }
    } else {
      const originalGroup = current.分组.find(group => group.编号 === draftId)
      if (originalGroup && originalGroup.名称 === trimmedName) {
        inlineGroupDraftRef.current = { 编号: null, 名称: '' }
        setInlineEditGroupId(null)
        setInlineEditGroupName('')
        return { ok: true, status: 'unchanged', id: draftId, 所属分类编号: originalGroup.所属分类编号 }
      }
      if (!originalGroup) {
        inlineGroupDraftRef.current = { 编号: null, 名称: '' }
        setInlineEditGroupId(null)
        setInlineEditGroupName('')
        return { ok: false, status: 'missing-entity', id: draftId }
      }
      addToHistory()
      const nextGroups = current.分组.map(group => group.编号 === draftId ? { ...group, 名称: trimmedName } : group)
      inlineGroupDraftRef.current = { 编号: null, 名称: '' }
      setGroups(nextGroups)
      setInlineEditGroupId(null)
      setInlineEditGroupName('')
      showSnackbar(t('snackbar.groupUpdated'))
      return { ok: true, status: 'updated', id: draftId, 所属分类编号: originalGroup.所属分类编号 }
    }
  }
  const handleCancelInlineGroup = () => {
    const draftId = inlineGroupDraftRef.current.编号
    const temporaryId = String(draftId || '').startsWith('new-group-') ? draftId : null
    inlineGroupDraftRef.current = { 编号: null, 名称: '' }
    setInlineEditGroupId(null)
    setInlineEditGroupName('')
    if (temporaryId) {
      const current = latestCollectionsRef.current
      const remainingGroups = current.分组.filter(group => group.编号 !== temporaryId)
      const childPhraseIds = current.常用语
        .filter(phrase => String(phrase.所属分组编号) === String(temporaryId))
        .map(phrase => phrase.编号)
      const previous = previousGroupSelectionRef.current
      const previousGroup = remainingGroups.find(group => group.编号 === previous?.所属分组编号)
      const previousCategory = current.分类.find(category => category.编号 === previous?.所属分类编号)
      const temporary = current.分组.find(group => group.编号 === temporaryId)
      const fallbackCategory = previousCategory || current.分类.find(category => category.编号 === temporary?.所属分类编号) || current.分类[0]
      const fallbackGroup = previousGroup || remainingGroups
        .filter(group => group.所属分类编号 === fallbackCategory?.编号)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))[0]
      const nextSelection = {
        所属分类编号: fallbackCategory?.编号 ?? null,
        所属分组编号: fallbackGroup?.编号 ?? null
      }
      previousGroupSelectionRef.current = null
      setSelectedCategoryId(nextSelection.所属分类编号)
      setSelectedGroupId(nextSelection.所属分组编号)
      animateCardRemoval([
        { type: 'group', id: temporaryId },
        ...childPhraseIds.map(phraseId => ({ type: 'phrase', id: phraseId }))
      ], () => {
        setGroups(prev => prev.filter(group => group.编号 !== temporaryId))
        if (childPhraseIds.length > 0) {
          setPhrases(prev => prev.filter(phrase => !childPhraseIds.includes(phrase.编号)))
        }
      })
    }
  }

  // 分类操作
  const handleCreateCategory = () => {
    if (inlineCategoryDraftRef.current.编号) {
      const categoryResult = handleSaveInlineCategory()
      if (!categoryResult.ok) return categoryResult
    }
    if (inlineGroupDraftRef.current.编号) {
      const groupResult = handleSaveInlineGroup()
      if (!groupResult.ok) return groupResult
    }

    const current = latestCollectionsRef.current
    const selection = latestSelectionRef.current
    addToHistory()
    previousCategorySelectionRef.current = { ...selection }

    const tempId = `new-category-${generateId()}`
    const categoryOrders = current.分类.map(category => Number(category.排序) || 0)
    const newCategory = {
      编号: tempId,
      名称: '',
      排序: Math.max(-1, ...categoryOrders) + 1,
      是否新建: true,
      创建时间: Date.now()
    }
    const nextCategories = [...current.分类, newCategory]
    inlineCategoryDraftRef.current = { 编号: tempId, 名称: '' }
    setCategories(nextCategories)
    setSelectedCategoryId(tempId)
    setSelectedGroupId(null)
    setInlineEditCategoryId(tempId)
    setInlineEditCategoryName('')
    return { ok: true, id: tempId }
  }
  const handleEditCategory = (category) => {
    if (category?.是否引导演示) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    setTimeout(() => {
      inlineCategoryDraftRef.current = { 编号: category.编号, 名称: category.名称 }
      setInlineEditCategoryId(category.编号)
      setInlineEditCategoryName(category.名称)
    }, 50)
  }
  const handleDeleteCategory = (id) => {
    if (id === GUIDE_IDS.category) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    // 与删除分组相同，这里不能只依赖用于显示的索引，否则空名称的瞬态
    // 分组及其常用语会在删除分类后继续留在内存中。
    const current = latestCollectionsRef.current
    const childGroupIds = current.分组
      .filter(group => String(group.所属分类编号) === String(id))
      .map(group => group.编号)
    const childGroupIdSet = new Set(childGroupIds)
    const childPhraseIds = current.常用语
      .filter(phrase => childGroupIdSet.has(phrase.所属分组编号))
      .map(phrase => phrase.编号)
    animateCardRemoval([
      { type: 'category', id },
      ...childGroupIds.map(groupId => ({ type: 'group', id: groupId })),
      ...childPhraseIds.map(phraseId => ({ type: 'phrase', id: phraseId }))
    ], () => {
      addToHistory()
      setGroups(prev => prev.filter(group => group.所属分类编号 !== id))
      setPhrases(prev => prev.filter(p => !childGroupIdSet.has(p.所属分组编号)))
      setCategories(prev => prev.filter(category => category.编号 !== id))
      if (selectedCategoryId === id) {
        const currentIndex = current.分类.findIndex(category => category.编号 === id)
        const remainingCategories = current.分类.filter(category => category.编号 !== id)
        if (remainingCategories.length > 0) {
          const newIndex = currentIndex > 0 ? currentIndex - 1 : 0
          const newSelectedCategory = remainingCategories[newIndex]
          setSelectedCategoryId(newSelectedCategory.编号)
          const firstGroupInNewCategory = current.分组
            .filter(group => String(group.所属分类编号) === String(newSelectedCategory.编号))
            .sort((left, right) => (Number(left.排序) || 0) - (Number(right.排序) || 0))[0]
          setSelectedGroupId(firstGroupInNewCategory?.编号 || null)
        } else {
          setSelectedCategoryId(null)
          setSelectedGroupId(null)
        }
      } else if (selectedGroupId != null && childGroupIdSet.has(selectedGroupId)) {
        setSelectedGroupId(null)
      }
      showSnackbar(t('snackbar.categoryDeleted'))
    })
  }
  const handleSaveInlineCategory = () => {
    const draft = inlineCategoryDraftRef.current
    const draftId = draft.编号
    if (!draftId) return { ok: true, status: 'no-draft', id: null }

    const current = latestCollectionsRef.current
    let trimmedName = String(draft.名称 || '').trim()
    const isNew = String(draftId).startsWith('new-category-')

    if (!trimmedName && isNew) {
      let baseName = t('defaults.categoryName')
      let finalName = baseName
      let counter = 1
      while (current.分类.some(category => category.名称 === finalName && category.编号 !== draftId)) {
        finalName = `${baseName}(${counter})`
        counter++
      }
      trimmedName = finalName
    }

    if (!trimmedName) {
      inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
      setInlineEditCategoryId(null)
      setInlineEditCategoryName('')
      return { ok: true, status: 'cancelled-empty', id: draftId }
    }

    const isDuplicate = current.分类.some(category => category.名称 === trimmedName && category.编号 !== draftId)
    if (isDuplicate) {
        showSnackbar(t('snackbar.categoryNameExists'), 'warning')
      requestAnimationFrame(() => {
        inlineEditCategoryInputRef.current?.focus()
      })
      return { ok: false, status: 'duplicate', id: draftId }
    }

    if (isNew) {
      const temporary = current.分类.find(category => category.编号 === draftId)
      if (!temporary) {
        inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
        setInlineEditCategoryId(null)
        setInlineEditCategoryName('')
        return { ok: true, status: 'already-saved', id: latestSelectionRef.current.所属分类编号 }
      }

      const newId = generateId()
      const nextCategories = current.分类.map(category => {
        if (category.编号 !== draftId) return category
        const persistedCategory = { ...category }
        delete persistedCategory.是否新建
        return { ...persistedCategory, 编号: newId, 名称: trimmedName }
      })
      const nextGroups = current.分组.map(group => group.所属分类编号 === draftId
        ? { ...group, 所属分类编号: newId }
        : group)
      const currentSelection = latestSelectionRef.current
      const selectedGroup = nextGroups.find(group => group.编号 === currentSelection.所属分组编号)
      const nextSelection = {
        所属分类编号: newId,
        所属分组编号: selectedGroup?.所属分类编号 === newId ? selectedGroup.编号 : null
      }

      inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
      setCategories(nextCategories)
      setGroups(nextGroups)
      setSelectedCategoryId(newId)
      setSelectedGroupId(nextSelection.所属分组编号)
      setInlineEditCategoryId(null)
      setInlineEditCategoryName('')
      triggerConfetti()
      showSnackbar(t('snackbar.categoryCreated'))
      return { ok: true, status: 'created', id: newId }
    } else {
      const original = current.分类.find(category => category.编号 === draftId)
      if (original && original.名称 === trimmedName) {
        inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
        setInlineEditCategoryId(null)
        setInlineEditCategoryName('')
        return { ok: true, status: 'unchanged', id: draftId }
      }
      if (!original) {
        inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
        setInlineEditCategoryId(null)
        setInlineEditCategoryName('')
        return { ok: false, status: 'missing-entity', id: draftId }
      }
      addToHistory()
      const nextCategories = current.分类.map(category => category.编号 === draftId ? { ...category, 名称: trimmedName } : category)
      inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
      setCategories(nextCategories)
      setInlineEditCategoryId(null)
      setInlineEditCategoryName('')
      showSnackbar(t('snackbar.categoryUpdated'))
      return { ok: true, status: 'updated', id: draftId }
    }
  }

  const openCreateCollectionDialog = (requestedType, targetCategoryId = null) => {
    // 先提交侧栏中尚未完成的名称编辑，避免并行创建时留下多个临时条目。
    if (inlineCategoryDraftRef.current.编号) {
      const categoryResult = handleSaveInlineCategory()
      if (!categoryResult.ok) return false
    }
    if (inlineGroupDraftRef.current.编号) {
      const groupResult = handleSaveInlineGroup()
      if (!groupResult.ok) return false
    }

    const current = latestCollectionsRef.current
    // 分类是顶层；首次创建时同时要求一个分组，保证新建常用语始终有归属。
    const type = requestedType === 'group' && current.分类.length === 0 ? 'category' : requestedType
    const defaultCategoryName = getUniqueCollectionName(current.分类, t('defaults.categoryName'))
    // Group names are scoped to their owning category.  Do not consume a
    // suffix because another category happens to use the same group name.
    const groupCategoryId = targetCategoryId || latestSelectionRef.current.所属分类编号 || current.分类[0]?.编号
    const groupsInTargetCategory = groupCategoryId
      ? current.分组.filter(group => String(group.所属分类编号) === String(groupCategoryId))
      : current.分组
    const defaultGroupName = getUniqueCollectionName(groupsInTargetCategory, t('defaults.groupName'))
    setCreateCollectionDialog({
      type,
      targetCategoryId: targetCategoryId || null,
      categoryName: defaultCategoryName,
      groupName: defaultGroupName
    })
    return true
  }

  const handleCreateCollectionDialogSubmit = () => {
    const draft = createCollectionDialog
    if (!draft) return

    const current = latestCollectionsRef.current
    const categoryName = String(draft.categoryName || '').trim()
    const groupName = String(draft.groupName || '').trim()
    const creatingCategory = draft.type === 'category'
    if (creatingCategory ? (!categoryName || !groupName) : !groupName) return

    if (creatingCategory && current.分类.some(category => category.名称 === categoryName)) {
      showSnackbar(t('snackbar.categoryNameExists'), 'warning')
      return
    }
    const targetCategoryIdForNameCheck = draft.targetCategoryId || latestSelectionRef.current.所属分类编号 || current.分类[0]?.编号
    if (!creatingCategory && current.分组.some(group => (
      String(group.所属分类编号) === String(targetCategoryIdForNameCheck) && group.名称 === groupName
    ))) {
      showSnackbar(t('snackbar.groupNameExists'), 'warning')
      return
    }

    const now = Date.now()
    const activeDraft = editPhraseRef.current
    const continuePendingPhraseCreation = () => {
      const pending = pendingCollectionCreationRef.current
      pendingCollectionCreationRef.current = null
      if (pending) createPhraseRef.current?.(pending.initialContent, { skipDirtyCheck: true })
    }

    if (creatingCategory) {
      addToHistory()
      const categoryId = generateId()
      const groupId = generateId()
      const categoryOrders = current.分类.map(category => Number(category.排序) || 0)
      const groupOrders = current.分组.filter(group => group.所属分类编号 === categoryId).map(group => Number(group.排序) || 0)
      const nextCategories = [...current.分类, {
        编号: categoryId,
        名称: categoryName,
        排序: Math.max(-1, ...categoryOrders) + 1,
        创建时间: now
      }]
      const nextGroups = [...current.分组, {
        编号: groupId,
        名称: groupName,
        排序: Math.max(-1, ...groupOrders) + 1,
        所属分类编号: categoryId,
        创建时间: now
      }]
      const nextDraft = activeDraft ? { ...activeDraft, 所属分组编号: groupId } : activeDraft
      setCategories(nextCategories)
      setGroups(nextGroups)
      setSelectedCategoryId(categoryId)
      setSelectedGroupId(groupId)
      if (nextDraft) {
        editPhraseRef.current = nextDraft
        setEditPhrase(nextDraft)
      }
      setCreateCollectionDialog(null)
      triggerConfetti()
      showSnackbar(t('snackbar.categoryCreated'))
      continuePendingPhraseCreation()
      return
    }

    const targetCategoryId = draft.targetCategoryId || latestSelectionRef.current.所属分类编号 || current.分类[0]?.编号
    const targetCategory = current.分类.find(category => String(category.编号) === String(targetCategoryId))
    if (!targetCategory) {
      pendingCollectionCreationRef.current = null
      showSnackbar(t('snackbar.categoryRequired'), 'warning')
      return
    }

    addToHistory()
    const siblingOrders = current.分组
      .filter(group => String(group.所属分类编号) === String(targetCategory.编号))
      .map(group => Number(group.排序) || 0)
    const groupId = generateId()
    const newGroup = {
      编号: groupId,
      名称: groupName,
      排序: Math.max(-1, ...siblingOrders) + 1,
      所属分类编号: targetCategory.编号,
      创建时间: now
    }
    const nextGroups = [...current.分组, newGroup]
    const nextDraft = activeDraft ? { ...activeDraft, 所属分组编号: groupId } : activeDraft
    setGroups(nextGroups)
    setSelectedCategoryId(targetCategory.编号)
    setSelectedGroupId(groupId)
    if (nextDraft) {
      editPhraseRef.current = nextDraft
      setEditPhrase(nextDraft)
    }
    setCreateCollectionDialog(null)
    triggerConfetti()
    showSnackbar(t('snackbar.groupCreated'))
    continuePendingPhraseCreation()
  }

  const handleCancelInlineCategory = () => {
    const draftId = inlineCategoryDraftRef.current.编号
      const temporaryId = String(draftId || '').startsWith('new-category-') ? draftId : null
    inlineCategoryDraftRef.current = { 编号: null, 名称: '' }
    setInlineEditCategoryId(null)
    setInlineEditCategoryName('')
    if (temporaryId) {
      const current = latestCollectionsRef.current
      const remainingCategories = current.分类.filter(category => category.编号 !== temporaryId)
      const childGroupIds = current.分组
        .filter(group => String(group.所属分类编号) === String(temporaryId))
        .map(group => group.编号)
      const childGroupIdSet = new Set(childGroupIds)
      const childPhraseIds = current.常用语
        .filter(phrase => childGroupIdSet.has(phrase.所属分组编号))
        .map(phrase => phrase.编号)
      const previous = previousCategorySelectionRef.current
      const previousCategory = remainingCategories.find(category => category.编号 === previous?.所属分类编号)
      const fallbackCategory = previousCategory || [...remainingCategories].sort((a, b) => (a.排序 || 0) - (b.排序 || 0))[0]
      const previousGroup = current.分组.find(group => (
        group.编号 === previous?.所属分组编号 && group.所属分类编号 === fallbackCategory?.编号
      ))
      const fallbackGroup = previousGroup || current.分组
        .filter(group => group.所属分类编号 === fallbackCategory?.编号 && !group.是否新建)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))[0]
      const nextSelection = {
        所属分类编号: fallbackCategory?.编号 ?? null,
        所属分组编号: fallbackGroup?.编号 ?? null
      }
      previousCategorySelectionRef.current = { 所属分类编号: null, 所属分组编号: null }
      setSelectedCategoryId(nextSelection.所属分类编号)
      setSelectedGroupId(nextSelection.所属分组编号)
      animateCardRemoval([
        { type: 'category', id: temporaryId },
        ...childGroupIds.map(groupId => ({ type: 'group', id: groupId })),
        ...childPhraseIds.map(phraseId => ({ type: 'phrase', id: phraseId }))
      ], () => {
        setCategories(prev => prev.filter(category => category.编号 !== temporaryId))
        if (childGroupIds.length > 0) {
          setGroups(prev => prev.filter(group => !childGroupIdSet.has(group.编号)))
        }
        if (childPhraseIds.length > 0) {
          setPhrases(prev => prev.filter(phrase => !childPhraseIds.includes(phrase.编号)))
        }
      })
    }
  }

  const handleMoveCategoryToTop = (id) => {
    addToHistory()
    setCategories(prev => {
      const minOrder = Math.min(...prev.map(category => category.排序 || 0), 0)
      return prev.map(category => category.编号 === id ? { ...category, 排序: minOrder - 1 } : category)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
    })
  }

  const handleMoveCategoryToBottom = (id) => {
    addToHistory()
    setCategories(prev => {
      const maxOrder = Math.max(...prev.map(category => category.排序 || 0), 0)
      return prev.map(category => category.编号 === id ? { ...category, 排序: maxOrder + 1 } : category)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
    })
  }

  // 触发翻转动画
  const triggerFlip = (id) => {
    const previousTimer = flipTimersRef.current.get(id)
    if (previousTimer) clearTimeout(previousTimer)
    setFlippingPhraseIds(prev => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
    const timer = setTimeout(() => {
      flipTimersRef.current.delete(id)
      setFlippingPhraseIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 600)
    flipTimersRef.current.set(id, timer)
  }

  // 常用语操作
  const handleSavePhrase = useCallback((phraseToSave, force = false, { silent = false } = {}) => {
    const draft = phraseToSave ?? editPhraseRef.current
    if (!draft?.编号) return { ok: false, status: 'missing-draft' }
  // 关闭流程从鼠标按下阶段开始，此时输入框焦点尚未转移。
    // 在用户于确认对话框中作出选择前，忽略由后台状态更新触发的保存。
    if (isExitingRef.current && !force) return { ok: false, status: 'exit-in-progress' }

    const currentCollections = latestCollectionsRef.current
    const currentPhrases = currentCollections.常用语 || []
    const original = currentPhrases.find(phrase => phrase.编号 === draft.编号)
    if (!original) {
      if (!silent) showSnackbar(t('snackbar.saveFailed'), 'error')
      return { ok: false, status: 'missing-entity' }
    }

    // 常用语只能保存到现存的分类→分组分支；编辑期间父级可能被删除，
    // 此时拒绝写入，避免持久化层静默丢弃孤儿常用语。
    const targetGroupId = String(draft.所属分组编号 ?? '').trim()
    const targetGroup = currentCollections.分组.find(group => String(group.编号) === targetGroupId)
    const targetCategory = targetGroup && currentCollections.分类.find(category => (
      String(category.编号) === String(targetGroup.所属分类编号)
    ))
    if (!targetGroup || !targetCategory || targetGroup.是否新建 || targetGroup.是否引导演示 || targetCategory.是否新建 || targetCategory.是否引导演示) {
      if (!silent) showSnackbar(t('snackbar.groupRequired'), 'warning')
      return { ok: false, status: 'group-required' }
    }

    const savedPhrase = preparePhraseForSave(original, draft)
    if (!savedPhrase.标题) {
      if (!silent) showSnackbar(t('snackbar.titleEmpty'), 'warning')
      return { ok: false, status: 'empty-title' }
    }
    if (!savedPhrase.内容) {
      if (!silent) showSnackbar(t('snackbar.contentEmpty'), 'warning')
      return { ok: false, status: 'empty-content' }
    }

    if (!original.是否新建 && phraseEditFieldsEqual(original, savedPhrase)) {
      const cleanDraft = { ...original }
      if (editPhraseRef.current?.编号 === original.编号) {
        editPhraseRef.current = cleanDraft
        setEditPhrase(cleanDraft)
      }
      if (!silent) showSnackbar(t('snackbar.noChanges'), 'info')
      return { ok: true, status: 'unchanged', phrase: original }
    }

    const duplicate = currentPhrases.some(phrase => (
      phrase.编号 !== original.编号 &&
      phrase.标题 === savedPhrase.标题 &&
      phrase.内容 === savedPhrase.内容
    ))
    if (duplicate) {
      if (!silent) showSnackbar(t('snackbar.duplicatePhrase'), 'warning')
      return { ok: false, status: 'duplicate' }
    }

    const previousHistoryState = original.是否新建
      ? null
      : captureHistorySnapshot({ editPhrase: { ...original }, selectedPhraseId: original.编号 })
    const nextPhrases = currentPhrases.map(phrase => phrase.编号 === original.编号 ? savedPhrase : phrase)
    const snapshot = { ...currentCollections, 常用语: nextPhrases }
    pendingSaveRef.current = snapshot
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    // 保存常用语是明确的用户操作，必须同步持久化，确保成功提示不会早于实际写入。
    const saveResult = flushPendingSave()
    if (!saveResult.ok) {
      if (!silent) showSnackbar(t('snackbar.saveFailed'), 'error')
      return { ok: false, status: 'storage-error' }
    }

    const persistedPhrases = saveResult.data?.常用语 || nextPhrases
    const persistedPhrase = persistedPhrases.find(phrase => phrase.编号 === original.编号) || savedPhrase
    if (previousHistoryState) commitHistorySnapshot(previousHistoryState)
    setPhrases(persistedPhrases)
    if (editPhraseRef.current?.编号 === persistedPhrase.编号) {
      const cleanDraft = { ...persistedPhrase }
      editPhraseRef.current = cleanDraft
      setEditPhrase(cleanDraft)
    }

    if (!silent) {
      triggerConfetti()
      showSnackbar(t(original.是否新建 ? 'snackbar.phraseCreated' : 'snackbar.phraseUpdated'))
    }
    return { ok: true, status: original.是否新建 ? 'created' : 'updated', phrase: persistedPhrase }
  }, [captureHistorySnapshot, commitHistorySnapshot, flushPendingSave, showSnackbar])
  savePhraseRef.current = handleSavePhrase

  // 新手引导状态。
  const [guideStep, setGuideStep] = useState(-1) // -1 表示当前未进入引导流程。
  latestGuideStepRef.current = guideStep
  if (latestHistoryUiRef.current) latestHistoryUiRef.current.guideStep = guideStep

  const guideSteps = [
    { selector: '#guide-col-categories', title: t('guide.steps.step1Title'), message: t('guide.steps.step1Message') },
    { selector: '#guide-col-groups', title: t('guide.steps.step2Title'), message: t('guide.steps.step2Message') },
    { selector: '#guide-col-phrases', title: t('guide.steps.step3Title'), message: t('guide.steps.step3Message') },
    { selector: '#guide-toolbar-search', title: t('guide.steps.step4Title'), message: t('guide.steps.step4Message') },
    { selector: '#guide-toolbar-bottom', title: t('guide.steps.step5Title'), message: t('guide.steps.step5Message') }
  ]

  const handleStartGuide = () => {
    const now = Date.now()
    setGuideDemoCollections(Object.freeze({
      分类: Object.freeze([Object.freeze({
        编号: GUIDE_IDS.category,
         名称: t('guide.demo.categoryName'),
        排序: -1,
        创建时间: now,
        是否引导演示: true
      })]),
      分组: Object.freeze([Object.freeze({
        编号: GUIDE_IDS.group,
         名称: t('guide.demo.groupName'),
        所属分类编号: GUIDE_IDS.category,
        排序: 0,
        创建时间: now,
        是否引导演示: true
      })]),
      常用语: Object.freeze([Object.freeze({
        编号: GUIDE_IDS.phrase,
        标题: t('guide.demo.phraseTitle'),
        内容: t('guide.demo.phraseContent'),
        所属分组编号: GUIDE_IDS.group,
        排序: 0,
        创建时间: now,
        更新时间: now,
        使用次数: 0,
        是否引导演示: true
      }), Object.freeze({
        编号: GUIDE_IDS.phrase2,
        标题: t('guide.demo.phraseTitle2'),
        内容: t('guide.demo.phraseContent2'),
        所属分组编号: GUIDE_IDS.group,
        排序: 1,
        创建时间: now,
        更新时间: now,
        使用次数: 0,
        是否引导演示: true
      }), Object.freeze({
        编号: GUIDE_IDS.phrase3,
        标题: t('guide.demo.phraseTitle3'),
        内容: t('guide.demo.phraseContent3'),
        所属分组编号: GUIDE_IDS.group,
        排序: 2,
        创建时间: now,
        更新时间: now,
        使用次数: 0,
        是否引导演示: true
      })])
    }))

    // 3. 选中演示数据所在的位置。
    setSelectedCategoryId(GUIDE_IDS.category)
    setSelectedGroupId(GUIDE_IDS.group)

    // 4. 开始引导流程。
    setHelpOpen(false)
    setGuideStep(0)
  }

  // 结束引导时传入布尔值，用于区分“跳过”和“完成”两种结果。
  const handleEndGuide = (isSkipped = false) => {
    setGuideDemoCollections(null)
    setGuideStep(-1)
    // 如果当前位于演示分类，结束引导后恢复默认选择。
    if (selectedCategoryId === GUIDE_IDS.category) {
      // 切换到其他可用分类
      const remainingCategories = storedCategories
      if (remainingCategories.length > 0) {
        const firstCategory = remainingCategories[0]
        setSelectedCategoryId(firstCategory.编号)
        const firstGroup = storedGroups.find(group => group.所属分类编号 === firstCategory.编号)
        setSelectedGroupId(firstGroup?.编号 || null)
      } else {
        setSelectedCategoryId(null)
        setSelectedGroupId(null)
      }
    }

    if (!isSkipped) {
      triggerConfetti()
      showSnackbar(t('snackbar.guideCompleted'))
    }
  }

  // 新建常用语时自动聚焦内容框
  useEffect(() => {
    if (editPhrase?.是否新建) {
      setTimeout(() => {
        contentInputRef.current?.focus()
      }, 50)
    }
  }, [editPhrase?.编号])

  const handleCreatePhrase = (initialContent = '', { skipDirtyCheck = false } = {}) => {
    let committedCategoryId = null
    let committedGroupId = null

    // 键盘新建不会触发内联输入框失焦，因此要显式提交输入内容，
    // 并使用返回的正式编号作为后续创建目标。
    if (inlineCategoryDraftRef.current.编号) {
      const categoryResult = handleSaveInlineCategory()
      if (!categoryResult.ok) return categoryResult
      committedCategoryId = categoryResult.id
    }
    if (inlineGroupDraftRef.current.编号) {
      const groupResult = handleSaveInlineGroup()
      if (!groupResult.ok) return groupResult
      committedGroupId = groupResult.id
    }

    if (!skipDirtyCheck) {
      const activeDraft = editPhraseRef.current
      const original = activeDraft && latestCollectionsRef.current.常用语.find(phrase => phrase.编号 === activeDraft.编号)
      if (original && !phraseEditFieldsEqual(original, activeDraft)) {
        pendingPhraseSelectionRef.current = null
        pendingPhraseCreationRef.current = { initialContent: typeof initialContent === 'string' ? initialContent : '' }
        isExitingRef.current = true
        setExitDialogOpen(true)
        return { ok: false, status: 'confirmation-required' }
      }
    }

    const current = latestCollectionsRef.current
    const selection = latestSelectionRef.current
    const targetCategoryId = committedCategoryId || selection.所属分类编号
    let targetGroupId = committedGroupId || selection.所属分组编号
    let targetGroup = current.分组.find(group => String(group.编号) === String(targetGroupId) && !group.是否新建)

    if (targetGroup && targetCategoryId && String(targetGroup.所属分类编号) !== String(targetCategoryId)) {
      targetGroup = null
      targetGroupId = null
    }
    if (!targetGroup) {
      const category = current.分类.find(item => String(item.编号) === String(targetCategoryId) && !item.是否新建)
      if (category) {
        targetGroup = current.分组
          .filter(group => String(group.所属分类编号) === String(category.编号) && !group.是否新建)
          .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))[0]
      }
      if (targetGroup) targetGroupId = targetGroup.编号
    }
    if (!targetGroup) {
      pendingCollectionCreationRef.current = { initialContent: typeof initialContent === 'string' ? initialContent : '' }
      if (!openCreateCollectionDialog(targetCategoryId ? 'group' : 'category', targetCategoryId)) {
        pendingCollectionCreationRef.current = null
        return { ok: false, status: 'collection-name-required' }
      }
      return { ok: false, status: 'collection-name-required' }
    }

    addToHistory()
    const content = typeof initialContent === 'string' ? initialContent : ''
    const newId = generateId()
    const now = Date.now()
    const phraseOrders = current.常用语
      .filter(phrase => String(phrase.所属分组编号) === String(targetGroupId))
      .map(phrase => Number(phrase.排序) || 0)
    const newPhrase = {
      编号: newId,
      标题: content ? (content.length > 10 ? `${content.slice(0, 10)}...` : content) : t('defaults.newPhrase'),
      内容: content,
      是否新建: true,
      所属分组编号: targetGroupId,
      使用次数: 0,
      排序: Math.max(-1, ...phraseOrders) + 1,
      创建时间: now,
      更新时间: now
    }
    setPhrases([...current.常用语, newPhrase])
    setSelectedCategoryId(targetGroup.所属分类编号)
    setSelectedGroupId(targetGroupId)
    requestPhraseSelection(newId)
    return { ok: true, status: 'created', phrase: newPhrase }
  }

  createPhraseRef.current = handleCreatePhrase
  createCategoryRef.current = handleCreateCategory


  const handleDeletePhrase = (id) => {
    if (GUIDE_PHRASE_IDS.has(id)) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    animateCardRemoval([{ type: 'phrase', id }], () => {
      addToHistory()
      setPhrases(prev => prev.filter(p => p.编号 !== id))
      if (selectedPhraseId === id) {
        setSelectedPhraseId(null)
        setEditPhrase(null)
      }
      showSnackbar(t('snackbar.phraseDeleted'))
    })
  }

  // 触发彩纸屑特效（具体实现位于 confettiEffect.js）。

  const handleCopyPhrase = useCallback(async (phrase, { celebrate = true } = {}) => {
    if (!phrase.内容?.trim()) {
      showSnackbar(t('snackbar.contentEmpty'), 'warning')
      return
    }
    try {
      await host.copyText(phrase.内容)
      if (!phrase.是否引导演示) queuePhraseUsage(phrase.编号)
      setCopiedPhraseIds(prev => prev.has(phrase.编号) ? prev : new Set([...prev, phrase.编号]))
      showSnackbar(t('snackbar.copiedToClipboard'))
      if (celebrate) triggerConfetti()
    } catch (error) {
      showSnackbar(translateError(error), 'error')
    }
  }, [queuePhraseUsage, showSnackbar])

  // 常用语右键菜单
  const handlePhraseContextMenu = (event, phrase) => {
    event.preventDefault()
    setPhraseContextMenu(
      {
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6,
        phrase: phrase
      }
    )
  }

  // 分组右键菜单
  const handleGroupContextMenu = (event, group) => {
    event.preventDefault()
    event.stopPropagation()
    // A context-menu action always targets the group's owning category too;
    // keeping both selections aligned prevents a group from appearing selected
    // while the category column still shows a different branch.
    setSelectedCategoryId(group.所属分类编号)
    setSelectedGroupId(group.编号)
    setMenuGroupId(group.编号)
    setGroupContextMenu(
      {
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6,
        group: group  // 保存分组对象，供后续菜单操作使用。
      }
    )
  }

  const toggleBatchMode = () => {
    const nextBatchMode = !batchMode
    setBatchMode(nextBatchMode)
    if (nextBatchMode) setSearchFocused(false)
    if (batchMode) {
      // 退出批量模式时清空选择
      setSelectedPhraseIds(new Set())
      setSelectedGroupIds(new Set())
      setLastSelectedPhraseId(null)
      setLastSelectedGroupId(null)
    }
  }

  const togglePhraseSelection = (e, phraseId) => {
    if (GUIDE_PHRASE_IDS.has(phraseId)) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    // 处理按住 Shift 后点击的范围选择。
    if (e.shiftKey && lastSelectedPhraseId) {
      // 防止 Shift 选择操作同时选中文字。
      if (document.selection) {
        document.selection.empty()
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges()
      }

      const currentIndex = filteredPhrases.findIndex(p => p.编号 === phraseId)
      const lastIndex = filteredPhrases.findIndex(p => p.编号 === lastSelectedPhraseId)

      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex)
        const end = Math.max(currentIndex, lastIndex)
        const rangePhrases = filteredPhrases.slice(start, end + 1)

        setSelectedPhraseIds(prev => {
          const newSet = new Set(prev)
          // 范围选择总是添加选中
          rangePhrases.forEach(p => newSet.add(p.编号))
          return newSet
        })
        return // Shift 选择不更新上一次选中的编号，便于连续执行范围选择。
      }
    }

    // 普通点击逻辑
    setSelectedPhraseIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(phraseId)) {
        newSet.delete(phraseId)
      } else {
        newSet.add(phraseId)
      }
      return newSet
    })
    setLastSelectedPhraseId(phraseId)
  }

  const toggleGroupSelection = (e, groupId) => {
    if (groupId === GUIDE_IDS.group) {
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    // 处理按住 Shift 后点击的范围选择。
    if (e.shiftKey && lastSelectedGroupId) {
      if (document.selection) {
        document.selection.empty()
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges()
      }

      const currentIndex = filteredGroups.findIndex(group => group.编号 === groupId)
      const lastIndex = filteredGroups.findIndex(group => group.编号 === lastSelectedGroupId)

      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex)
        const end = Math.max(currentIndex, lastIndex)
        // 注意：原始分组列表可能未过滤，范围选择必须使用当前视图顺序。
        const rangeGroups = filteredGroups.slice(start, end + 1)

        setSelectedGroupIds(prev => {
          const newSet = new Set(prev)
          rangeGroups.forEach(group => newSet.add(group.编号))
          return newSet
        })
        return
      }
    }

    // 普通点击逻辑
    setSelectedGroupIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
    setLastSelectedGroupId(groupId)
  }

  const handleSelectAll = () => {
    const currentPhraseIds = filteredPhrases
      .filter(phrase => !GUIDE_PHRASE_IDS.has(phrase.编号))
      .map(p => p.编号)
    // 仅全选当前显示的分组（受选中分类影响）
    const currentGroupIds = filteredGroups
      .filter(group => group.编号 !== GUIDE_IDS.group)
      .map(group => group.编号)

    // 检查常用语是否已全选（列表为空视为已全选，以便跳过）
    const allPhrasesSelected = currentPhraseIds.length === 0 || currentPhraseIds.every(id => selectedPhraseIds.has(id))
    // 检查分组是否已全选
    const allGroupsSelected = currentGroupIds.length === 0 || currentGroupIds.every(id => selectedGroupIds.has(id))

    if (!allPhrasesSelected && !allGroupsSelected) {
      // 第一阶段：仅全选当前显示的常用语
      setSelectedPhraseIds(new Set(currentPhraseIds))
    } else if (allPhrasesSelected && !allGroupsSelected) {
      // 第二阶段：全选分组（保持常用语选中）
      setSelectedGroupIds(new Set(currentGroupIds))
    } else {
      // 第三阶段：全部反选（包括只选中分组、或全部选中的情况）
      setSelectedPhraseIds(new Set())
      setSelectedGroupIds(new Set())
    }
  }

  const handleBatchDelete = () => {
    if (selectedPhraseIds.size === 0 && selectedGroupIds.size === 0) return

    const groupIdsToDelete = new Set(selectedGroupIds)
    const phraseIdsToDelete = new Set(phrases
      .filter(p => selectedPhraseIds.has(p.编号) || groupIdsToDelete.has(p.所属分组编号))
      .map(p => p.编号))
    const cardsToDelete = [
      ...[...groupIdsToDelete].map(id => ({ type: 'group', id })),
      ...[...phraseIdsToDelete].map(id => ({ type: 'phrase', id }))
    ]

    animateCardRemoval(cardsToDelete, () => {
      addToHistory()
      setPhrases(prev => prev.filter(p => !phraseIdsToDelete.has(p.编号)))
      if (groupIdsToDelete.size > 0) {
        setGroups(prev => prev.filter(group => !groupIdsToDelete.has(group.编号)))
        if (selectedGroupId && groupIdsToDelete.has(selectedGroupId)) {
          setSelectedGroupId(null)
        }
      }

      const count = phraseIdsToDelete.size + groupIdsToDelete.size
      showSnackbar(t('snackbar.itemsDeleted', { count }))
      setSelectedPhraseIds(new Set())
      setSelectedGroupIds(new Set())
      setBatchMode(false)
    })
  }

  const handleBatchMove = (targetGroupId) => {
    if (selectedPhraseIds.size === 0 || !targetGroupId) return

    const current = latestCollectionsRef.current
    const targetGroup = current.分组.find(group => String(group.编号) === String(targetGroupId))
    const targetCategory = targetGroup && current.分类.find(category => (
      String(category.编号) === String(targetGroup.所属分类编号)
    ))
    if (!targetGroup || !targetCategory) return
    addToHistory()
    const targetPhrases = current.常用语
      .filter(phrase => String(phrase.所属分组编号) === String(targetGroupId))
    let maxOrder = Math.max(...targetPhrases.map(p => p.排序 || 0), -1)

    setPhrases(prev => prev.map(p => {
      if (selectedPhraseIds.has(p.编号)) {
        maxOrder++
        return { ...p, 所属分组编号: targetGroupId, 排序: maxOrder }
      }
      return p
    }))
    showSnackbar(t('snackbar.phrasesMoved', { count: selectedPhraseIds.size }))
    triggerConfetti()
    setSelectedPhraseIds(new Set())
    setBatchMoveAnchor(null)
    setBatchMode(false)
  }

  // 批量拖拽到目标分类
  const handleBatchDragToCategory = (targetCategoryId) => {
    if ((selectedPhraseIds.size === 0 && selectedGroupIds.size === 0) || !targetCategoryId) return

    // 这里使用完整运行态集合，而不是显示索引。索引会过滤空名称的瞬态
    // 编辑项；批量操作仍应保持每张卡片的父子关系。
    const current = latestCollectionsRef.current
    const currentGroups = current.分组
    const currentPhrases = current.常用语
    const currentGroupById = new Map(currentGroups.map(group => [String(group.编号), group]))
    const targetCategory = current.分类.find(category => String(category.编号) === String(targetCategoryId))
    if (!targetCategory) return
    addToHistory()

    // 1. 收集选中的分组
    const selectedGroups = currentGroups.filter(group => selectedGroupIds.has(group.编号))

    // 2. 收集选中的常用语
    const selectedPhrasesList = currentPhrases.filter(phrase => selectedPhraseIds.has(phrase.编号))

    // 3. 找出"孤儿"常用语（不属于任何选中分组的常用语）
    const orphanPhrases = selectedPhrasesList.filter(p => !selectedGroupIds.has(p.所属分组编号))

    // 4. 为孤儿常用语创建或复用分组
    const orphanGroupIds = [...new Set(orphanPhrases.map(p => p.所属分组编号))]
    const orphanGroups = orphanGroupIds
      .map(id => currentGroupById.get(String(id)))
      .filter(Boolean)

    // 创建新分组映射表：原分组ID -> 新分组ID
    const groupMapping = new Map()
    const newGroups = []
    const now = Date.now()

    const targetCategoryGroups = currentGroups
      .filter(group => String(group.所属分类编号) === String(targetCategoryId))
    orphanGroups.forEach(sourceGroup => {
      // 检查目标分类是否已有同名分组
      const sourceName = String(sourceGroup.名称 || '').trim() || t('defaults.uncategorized')
      const existingGroup = targetCategoryGroups.find(group => String(group.名称 || '').trim() === sourceName && !selectedGroupIds.has(group.编号)) ||
        newGroups.find(group => String(group.名称 || '').trim() === sourceName)

      if (existingGroup) {
        // 复用已有分组
        groupMapping.set(sourceGroup.编号, existingGroup.编号)
      } else {
        // 创建新分组
        const newGroupId = generateId()
        const name = getUniqueCollectionName([...targetCategoryGroups, ...newGroups], sourceName)
        groupMapping.set(sourceGroup.编号, newGroupId)
        newGroups.push({
          编号: newGroupId,
          名称: name,
          所属分类编号: targetCategoryId,
          排序: targetCategoryGroups.length + newGroups.length,
          创建时间: now
        })
      }
    })

    // 5. 更新分组：移动选中分组到目标分类 + 添加新分组
    setGroups(prev => {
      let updated = prev.map(group => {
        if (selectedGroupIds.has(group.编号)) {
          return { ...group, 所属分类编号: targetCategoryId }
        }
        return group
      })
      return [...updated, ...newGroups]
    })

    // 6. 更新常用语：孤儿常用语移动到新/复用分组
    const nextOrderByGroup = new Map()
    groupMapping.forEach(targetGroupId => {
      const targetPhrases = currentPhrases.filter(phrase => (
        String(phrase.所属分组编号) === String(targetGroupId) && !selectedPhraseIds.has(phrase.编号)
      ))
      nextOrderByGroup.set(targetGroupId, Math.max(...targetPhrases.map(phrase => Number(phrase.排序) || 0), -1) + 1)
    })
    setPhrases(prev => prev.map(phrase => {
      if (!selectedPhraseIds.has(phrase.编号) || !groupMapping.has(phrase.所属分组编号)) return phrase
      const targetGroupId = groupMapping.get(phrase.所属分组编号)
      const nextOrder = nextOrderByGroup.get(targetGroupId) || 0
      nextOrderByGroup.set(targetGroupId, nextOrder + 1)
      return { ...phrase, 所属分组编号: targetGroupId, 排序: nextOrder }
    }))

    if (selectedGroups.length > 0 || newGroups.length > 0) normalizeOrdersForDrag('group')

    // 7. 自动跳转到目标分类
    setSelectedCategoryId(targetCategoryId)
    if (selectedGroups.length > 0) {
      setSelectedGroupId(selectedGroups[0].编号)
    } else if (newGroups.length > 0) {
      setSelectedGroupId(newGroups[0].编号)
    }

    showSnackbar(t('snackbar.batchMovedToCategory', {
      groups: selectedGroupIds.size,
      phrases: selectedPhraseIds.size
    }))
    triggerConfetti()

    // 重置拖拽相关状态，防止卡片显示异常
    setDraggingPhraseId(null)
    setDragOverGroupId(null)
    dragItem.current = null

    setSelectedPhraseIds(new Set())
    setSelectedGroupIds(new Set())
    setBatchMode(false)
  }

  const handleBatchExport = async () => {
    if (selectedPhraseIds.size === 0 && selectedGroupIds.size === 0) return

    const current = latestCollectionsRef.current
    const validCategories = current.分类.filter(category => (
      !category?.是否新建 && !category?.是否引导演示 && String(category?.名称 || '').trim()
    ))
    const validCategoryIds = new Set(validCategories.map(category => String(category.编号)))
    const validGroups = current.分组.filter(group => (
      !group?.是否新建 && !group?.是否引导演示 && String(group?.名称 || '').trim() &&
      validCategoryIds.has(String(group.所属分类编号))
    ))
    const validGroupIds = new Set(validGroups.map(group => String(group.编号)))
    const validPhrases = current.常用语.filter(phrase => (
      !phrase?.是否新建 && !phrase?.是否引导演示 && String(phrase?.标题 || '').trim() &&
      String(phrase?.内容 || '').trim() && validGroupIds.has(String(phrase.所属分组编号))
    ))

    // 收集要导出的常用语：选中的常用语 + 选中分组下的所有常用语
    const phrasesToExport = validPhrases.filter(p =>
      selectedPhraseIds.has(p.编号) || selectedGroupIds.has(p.所属分组编号)
    )

    // 收集要导出的分组：选中的有效分组 + 导出常用语所属的分组。
    const explicitGroups = validGroups.filter(group => selectedGroupIds.has(group.编号))
    const implicitGroupIds = new Set(phrasesToExport.map(p => p.所属分组编号))
    const implicitGroups = validGroups.filter(group => implicitGroupIds.has(group.编号) && !selectedGroupIds.has(group.编号))

    const exportGroups = [...explicitGroups, ...implicitGroups]

    const categoryIds = new Set(exportGroups.map(group => group.所属分类编号).filter(Boolean))
    const exportCategories = validCategories.filter(category => categoryIds.has(category.编号))
    const data = serializeCollections({
      分类: exportCategories,
      分组: exportGroups,
      常用语: phrasesToExport
    })
    const jsonStr = JSON.stringify(data, null, 2)
    const defaultName = t('file.backupName', { date: new Date().toISOString().slice(0, 10) })

    try {
      const saved = await host.saveFile({
        content: jsonStr,
        filename: defaultName,
        title: t('dialog.exportTitle'),
        filterName: t('dialog.jsonFilter'),
        extensions: ['json']
      })
      if (saved) {
        triggerConfetti()
        showSnackbar(t('snackbar.batchExportSuccess', { groups: exportGroups.length, phrases: phrasesToExport.length }))
      }
    } catch (err) {
      showSnackbar(t('snackbar.exportFailed', { error: translateError(err) }), 'error')
    }
    setBatchMode(false)
    setSelectedPhraseIds(new Set())
    setSelectedGroupIds(new Set())
  }

  const handleBatchMoveToTop = () => {
    if (selectedPhraseIds.size === 0 && selectedGroupIds.size === 0) return

    addToHistory()

    // 1. 处理分组置顶
    if (selectedGroupIds.size > 0) {
      setGroups(prev => {
        const orderMap = new Map()
        const categoryIds = new Set(prev.map(group => group.所属分类编号))
        categoryIds.forEach(categoryId => {
          const items = prev.filter(group => group.所属分类编号 === categoryId).sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
          const ordered = [
            ...items.filter(group => selectedGroupIds.has(group.编号)),
            ...items.filter(group => !selectedGroupIds.has(group.编号))
          ]
          ordered.forEach((group, index) => orderMap.set(group.编号, index))
        })
        return prev.map(group => ({ ...group, 排序: orderMap.get(group.编号) ?? group.排序 }))
      })
    }

    // 2. 处理常用语置顶
    if (selectedPhraseIds.size > 0) {
      setPhrases(prev => {
        const orderMap = new Map()
        new Set(prev.map(p => p.所属分组编号)).forEach(groupId => {
          const items = prev.filter(p => p.所属分组编号 === groupId).sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
          const ordered = [...items.filter(p => selectedPhraseIds.has(p.编号)), ...items.filter(p => !selectedPhraseIds.has(p.编号))]
          ordered.forEach((p, index) => orderMap.set(p.编号, index))
        })
        return prev.map(p => ({ ...p, 排序: orderMap.get(p.编号) ?? p.排序 }))
      })
    }

    showSnackbar(t('snackbar.batchMovedToTop'))
    setSelectedPhraseIds(new Set())
    setSelectedGroupIds(new Set())
    setBatchMode(false)
  }

  const handleBatchMoveToBottom = () => {
    if (selectedPhraseIds.size === 0 && selectedGroupIds.size === 0) return

    addToHistory()

    // 1. 处理分组置底
    if (selectedGroupIds.size > 0) {
      setGroups(prev => {
        const orderMap = new Map()
        const categoryIds = new Set(prev.map(group => group.所属分类编号))
        categoryIds.forEach(categoryId => {
          const items = prev.filter(group => group.所属分类编号 === categoryId).sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
          const ordered = [
            ...items.filter(group => !selectedGroupIds.has(group.编号)),
            ...items.filter(group => selectedGroupIds.has(group.编号))
          ]
          ordered.forEach((group, index) => orderMap.set(group.编号, index))
        })
        return prev.map(group => ({ ...group, 排序: orderMap.get(group.编号) ?? group.排序 }))
      })
    }

    // 2. 处理常用语置底
    if (selectedPhraseIds.size > 0) {
      setPhrases(prev => {
        const orderMap = new Map()
        new Set(prev.map(p => p.所属分组编号)).forEach(groupId => {
          const items = prev.filter(p => p.所属分组编号 === groupId).sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
          const ordered = [...items.filter(p => !selectedPhraseIds.has(p.编号)), ...items.filter(p => selectedPhraseIds.has(p.编号))]
          ordered.forEach((p, index) => orderMap.set(p.编号, index))
        })
        return prev.map(p => ({ ...p, 排序: orderMap.get(p.编号) ?? p.排序 }))
      })
    }

    showSnackbar(t('snackbar.batchMovedToBottom'))
    triggerConfetti()
    setSelectedPhraseIds(new Set())
    setSelectedGroupIds(new Set())
    setBatchMode(false)
  }

  // 单个分组置顶
  const handleGroupMoveToTop = (groupId) => {
    addToHistory()
    setGroups(prev => {
      const target = prev.find(group => group.编号 === groupId)
      if (!target) return prev
      const sorted = prev
        .filter(group => group.所属分类编号 === target.所属分类编号)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
      const idx = sorted.findIndex(group => group.编号 === groupId)
      if (idx <= 0) return prev
      const item = sorted.splice(idx, 1)[0]
      sorted.unshift(item)
      const orderMap = new Map(sorted.map((group, i) => [group.编号, i]))
      return prev.map(group => orderMap.has(group.编号) ? { ...group, 排序: orderMap.get(group.编号) } : group)
    })
    showSnackbar(t('snackbar.movedToTop'))
  }

  // 单个分组置底
  const handleGroupMoveToBottom = (groupId) => {
    addToHistory()
    setGroups(prev => {
      const target = prev.find(group => group.编号 === groupId)
      if (!target) return prev
      const sorted = prev
        .filter(group => group.所属分类编号 === target.所属分类编号)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
      const idx = sorted.findIndex(group => group.编号 === groupId)
      if (idx < 0 || idx === sorted.length - 1) return prev
      const item = sorted.splice(idx, 1)[0]
      sorted.push(item)
      const orderMap = new Map(sorted.map((group, i) => [group.编号, i]))
      return prev.map(group => orderMap.has(group.编号) ? { ...group, 排序: orderMap.get(group.编号) } : group)
    })
    showSnackbar(t('snackbar.movedToBottom'))
  }

  // 单个常用语置顶
  const handlePhraseMoveToTop = (phraseId) => {
    addToHistory()
    setPhrases(prev => {
      const phrase = prev.find(p => p.编号 === phraseId)
      if (!phrase) return prev
      const groupPhrases = prev.filter(p => p.所属分组编号 === phrase.所属分组编号).sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
      const idx = groupPhrases.findIndex(p => p.编号 === phraseId)
      if (idx <= 0) return prev
      const minOrder = Math.min(...groupPhrases.map(p => p.排序 || 0), 0)
      return prev.map(p => p.编号 === phraseId ? { ...p, 排序: minOrder - 1 } : p)
    })
    showSnackbar(t('snackbar.movedToTop'))
  }

  // 单个常用语置底
  const handlePhraseMoveToBottom = (phraseId) => {
    addToHistory()
    setPhrases(prev => {
      const phrase = prev.find(p => p.编号 === phraseId)
      if (!phrase) return prev
      const groupPhrases = prev.filter(p => p.所属分组编号 === phrase.所属分组编号)
      const maxOrder = Math.max(...groupPhrases.map(p => p.排序 || 0), 0)
      return prev.map(p => p.编号 === phraseId ? { ...p, 排序: maxOrder + 1 } : p)
    })
    showSnackbar(t('snackbar.movedToBottom'))
  }

  // 克隆常用语
  const handleClonePhrase = (phrase) => {
    const current = latestCollectionsRef.current
    const sourceGroup = current.分组.find(group => String(group.编号) === String(phrase?.所属分组编号))
    const sourceCategory = sourceGroup && current.分类.find(category => (
      String(category.编号) === String(sourceGroup.所属分类编号)
    ))
    if (!phrase || !sourceGroup || !sourceCategory || phrase?.是否新建 || phrase?.是否引导演示 ||
      sourceGroup.是否新建 || sourceGroup.是否引导演示 || sourceCategory.是否新建 || sourceCategory.是否引导演示) {
      if (phrase?.是否引导演示 || sourceGroup?.是否引导演示 || sourceCategory?.是否引导演示) {
        showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      }
      return
    }
    if (!String(phrase.标题 || '').trim()) {
      showSnackbar(t('snackbar.titleEmpty'), 'warning')
      return
    }
    if (!String(phrase.内容 || '').trim()) {
      showSnackbar(t('snackbar.contentEmpty'), 'warning')
      return
    }
    addToHistory()
    const now = Date.now()
    const newPhrase = {
      编号: generateId(),
      标题: phrase.标题 + t('defaults.copySuffix'),
      内容: phrase.内容,
      所属分组编号: phrase.所属分组编号,
      排序: (phrase.排序 || 0) + 0.5, // 插入到原卡片下方，随后由同分组排序逻辑统一校正。
      创建时间: now,
      更新时间: now,
      使用次数: 0
    }
    setPhrases(prev => {
      const updated = [...prev, newPhrase]
      // 重新排序同分组的常用语
      const sorted = updated
        .filter(p => p.所属分组编号 === phrase.所属分组编号)
        .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
        .map((p, i) => ({ ...p, 排序: i }))
      const others = updated.filter(p => p.所属分组编号 !== phrase.所属分组编号)
      return [...others, ...sorted]
    })
    requestPhraseSelection(newPhrase.编号) // 自动选中并进入编辑模式。
    triggerConfetti()
    showSnackbar(t('snackbar.phraseCloned'))
  }

  // 编辑常用语（不复制）
  const handleEditPhraseClick = (phrase) => {
    requestPhraseSelection(phrase.编号)
  }

  // 导入导出
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null)

  const handleExport = async () => {
    const data = JSON.stringify(serializeCollections({
      分类: categories,
      分组: groups,
      常用语: phrases
    }), null, 2)
    const defaultName = t('file.backupName', { date: new Date().toISOString().slice(0, 10) })

    try {
      const saved = await host.saveFile({
        content: data,
        filename: defaultName,
        title: t('dialog.exportTitle'),
        filterName: t('dialog.jsonFilter'),
        extensions: ['json']
      })
      if (saved) {
        triggerConfetti()
        showSnackbar(t('snackbar.exportSuccess'))
      }
    } catch (err) {
      showSnackbar(t('snackbar.exportFailed', { error: translateError(err) }), 'error')
    }
    setExportMenuAnchor(null)
  }

  // CSV 转义函数：如果字段包含逗号、引号或换行符，则用引号包裹并转义内部引号
  const escapeCSVField = (field) => {
    if (!field) return ''
    const needsQuotes = field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')
    if (needsQuotes) {
      return '"' + field.replace(/"/g, '""') + '"'
    }
    return field
  }

  // 导出为讯飞输入法兼容的 CSV 格式。
  const handleExportIFlytek = async () => {
    // 构建 CSV 文本内容。
    const lines = ['常用语分组,常用语内容']

    // 只导出完整分类→分组→常用语分支，避免把新手引导演示或未保存草稿
    // 当作用户数据写入 CSV。
    const current = latestCollectionsRef.current
    const validCategoryIds = new Set(current.分类
      .filter(category => !category?.是否新建 && !category?.是否引导演示 && String(category?.名称 || '').trim())
      .map(category => String(category.编号)))
    const validGroups = current.分组.filter(group => (
      !group?.是否新建 && !group?.是否引导演示 && String(group?.名称 || '').trim() &&
      validCategoryIds.has(String(group.所属分类编号))
    ))
    const validGroupIds = new Set(validGroups.map(group => String(group.编号)))
    const validPhrases = current.常用语.filter(phrase => (
      !phrase?.是否新建 && !phrase?.是否引导演示 && String(phrase?.标题 || '').trim() &&
      String(phrase?.内容 || '').trim() && validGroupIds.has(String(phrase.所属分组编号))
    ))
    validPhrases.forEach(phrase => {
      const group = validGroups.find(item => String(item.编号) === String(phrase.所属分组编号))
      const groupName = group?.名称 || ''
      const content = phrase.内容

      lines.push(`${escapeCSVField(groupName)},${escapeCSVField(content)}`)
    })

    const csvContent = lines.join('\r\n')
    const defaultName = t('file.iflytekBackupName', { date: new Date().toISOString().slice(0, 10) })

    try {
      const saved = await host.saveFile({
        content: csvContent,
        filename: defaultName,
        title: t('dialog.exportIflytekTitle'),
        filterName: t('dialog.csvFilter'),
        extensions: ['csv'],
        encoding: 'gbk',
        type: 'text/csv;charset=gbk'
      })
      if (saved) {
        triggerConfetti()
        showSnackbar(t('snackbar.iflytekExportSuccess'))
      }
    } catch (err) {
      showSnackbar(t('snackbar.exportFailed', { error: translateError(err) }), 'error')
    }
    setExportMenuAnchor(null)
  }
  const handleImport = async () => {
    let file = null
    try {
      file = await host.pickFile({
        extensions: ['json', 'csv', 'txt', 'md', 'tsv', 'yaml', 'yml', 'xml'],
        accept: '.json,.csv,.txt,.md,.tsv,.yaml,.yml,.xml,application/json,text/csv,text/plain,text/markdown,text/tab-separated-values,application/xml,text/xml',
        title: t('dialog.importTitle'),
        filterName: t('dialog.allSupportedFilter')
      })
      if (!file) return
      const preview = prepareImportPreview(file, latestCollectionsRef.current, {
        iflytekGroup: t('defaults.iflytekGroupName'),
        uncategorized: t('defaults.uncategorized')
      })
      setImportStrategy('merge')
      setImportPreview(preview)
      setAiImportSource(null)
      setAiImportError(null)
    } catch (error) {
      if (!file) {
        showSnackbar(t('snackbar.importFailed', { error: translateError(error) }), 'error')
        return
      }
      try {
        const content = decodeImportSource(file)
        if (content.length > AI_IMPORT_MAX_CHARS) {
          showSnackbar(t('snackbar.importFailed', {
            error: t('ai.importTooLarge', { max: AI_IMPORT_MAX_CHARS.toLocaleString(actualLocale) })
          }), 'error')
          return
        }
        setAiImportSource({ fileName: file.name, content, directError: translateError(error) })
        setAiImportError(null)
      } catch (decodeError) {
        showSnackbar(t('snackbar.importFailed', { error: translateError(decodeError) }), 'error')
      }
    }
  }

  const handleAiImportConversion = async () => {
    if (!aiImportSource || aiImportLoading) return
    const requestId = ++aiImportRequestIdRef.current
    setAiImportLoading(true)
    setAiImportError(null)
    const messages = [
      {
        role: 'system',
        content: `${String(settings.人工智能导入提示词 || '').trim() || t('ai.prompt.importSystem')}\nIMPORTANT CONTRACT (overrides conflicting hierarchy instructions or examples above): [${t('label.category')}:TOP_LEVEL] > [${t('label.group')}:NESTED] > [常用语:ITEM]. Return JSON only: {"分类":[{"名称":"...","分组":[{"名称":"...","常用语":[{"标题":"...","内容":"..."}]}]}]}`
      },
      {
        role: 'user',
        content: JSON.stringify({
          fileName: aiImportSource.fileName,
          sourceData: aiImportSource.content
        })
      }
    ]

    try {
      const aiOptions = { messages }
      if (settings.人工智能模型) aiOptions.model = settings.人工智能模型
      const result = await host.ai(aiOptions)
      if (requestId !== aiImportRequestIdRef.current) return
      const rawContent = String(result?.content || '').trim()
      try {
        const preview = prepareAiImportPreview(rawContent, aiImportSource.fileName, latestCollectionsRef.current)
        setImportStrategy('merge')
        setImportPreview(preview)
        setAiImportSource(null)
        setAiImportError(null)
      } catch (formatError) {
        setAiImportError({
          message: translateError(formatError),
          rawSummary: summarizeAiResponse(rawContent)
        })
      }
    } catch (error) {
      if (requestId === aiImportRequestIdRef.current && error?.name !== 'AbortError') {
        setAiImportError({ message: explainAiError(error), rawSummary: '' })
      }
    } finally {
      if (requestId === aiImportRequestIdRef.current) setAiImportLoading(false)
    }
  }

  const handleApplyImport = () => {
    if (!importPreview || importApplying) return
    setImportApplying(true)
    try {
      const result = applyImportPreview(importPreview, latestCollectionsRef.current, importStrategy, generateId)
      const imported = result.导入结果
      const changed = imported.分类 > 0 || imported.分组 > 0 || imported.常用语 > 0
      if (!changed) {
        setImportPreview(null)
        showSnackbar(t('ai.noChange'), 'info')
        return
      }
      addToHistory()
      setCategories(result.集合.分类)
      setGroups(result.集合.分组)
      setPhrases(result.集合.常用语)
      const firstCategory = result.集合.分类[0]
      const firstGroup = firstCategory && result.集合.分组.find(item => item.所属分类编号 === firstCategory.编号)
      setSelectedCategoryId(firstCategory?.编号 ?? null)
      setSelectedGroupId(firstGroup?.编号 ?? null)
      setImportPreview(null)
      triggerConfetti()
      showSnackbar(t('snackbar.importApplied', {
        categories: imported.分类,
        groups: imported.分组,
        phrases: imported.常用语,
        duplicates: imported.跳过重复项
      }))
    } catch (error) {
      showSnackbar(t('snackbar.importFailed', { error: translateError(error) }), 'error')
    } finally {
      setImportApplying(false)
    }
  }

  // 过滤列表（使用 useMemo 优化性能，并依赖延迟更新的分组编号）。
  const filteredGroups = useMemo(() => {
    const source = !selectedCategoryId
      ? groups
      : (groupsByCategory.get(selectedCategoryId) || [])
    return [...source]
      .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
  }, [groups, groupsByCategory, selectedCategoryId])

  const quickJumpGroups = useMemo(() => {
    let remaining = QUICK_JUMP_CATEGORY_LIMIT
    return categories.reduce((groups, category) => {
      if (remaining <= 0) return groups
      const children = (groupsByCategory.get(category.编号) || []).slice(0, remaining)
      if (children.length > 0) {
        groups.push({ category, children })
        remaining -= children.length
      }
      return groups
    }, [])
  }, [categories, groupsByCategory])

  useEffect(() => {
    setVisibleGroupCount(100)
  }, [selectedCategoryId])

  useEffect(() => {
    const selectedIndex = filteredGroups.findIndex(group => group.编号 === selectedGroupId)
    if (selectedIndex >= visibleGroupCount) {
      setVisibleGroupCount(Math.min(filteredGroups.length, selectedIndex + 20))
    }
  }, [filteredGroups, selectedGroupId, visibleGroupCount])

  useEffect(() => {
    const selectedIndex = categories.findIndex(category => category.编号 === selectedCategoryId)
    if (selectedIndex >= visibleCategoryCount) {
      setVisibleCategoryCount(Math.min(categories.length, selectedIndex + 20))
    }
  }, [categories, selectedCategoryId, visibleCategoryCount])

  const handleGroupListScroll = useCallback((e) => {
    const list = e.currentTarget
    if (groupScrollFrameRef.current !== null) return
    groupScrollFrameRef.current = requestAnimationFrame(() => {
      groupScrollFrameRef.current = null
      if (list.scrollHeight - list.scrollTop - list.clientHeight < 500) {
        setVisibleGroupCount(prev => Math.min(prev + 100, filteredGroups.length))
      }
    })
  }, [filteredGroups.length])

  const handleCategoryListScroll = useCallback((e) => {
    const list = e.currentTarget
    if (categoryScrollFrameRef.current !== null) return
    categoryScrollFrameRef.current = requestAnimationFrame(() => {
      categoryScrollFrameRef.current = null
      if (list.scrollHeight - list.scrollTop - list.clientHeight < 500) {
        setVisibleCategoryCount(prev => Math.min(prev + 100, categories.length))
      }
    })
  }, [categories.length])

  const filteredPhrases = useMemo(() => {
    // 直接使用当前选中的分组编号，避免延迟编号与界面显示不一致。
    const targetGroupId = selectedGroupId
    const activeSearchText = debouncedSearchText.trim()
    const activeSearchLower = activeSearchText.toLowerCase()
    // 获取当前分类下的所有二级分组ID
    const validGroupIds = new Set(selectedCategoryId
      ? (groupsByCategory.get(selectedCategoryId) || []).map(group => group.编号)
      : groups.map(group => group.编号))

    const source = !activeSearchText && targetGroupId && validGroupIds.has(targetGroupId)
      ? (phrasesByGroup.get(targetGroupId) || [])
      : phrases

    return source
      .filter(p => {
        const searchMatch = !activeSearchText || String(p.标题 || '').toLowerCase().includes(activeSearchLower) || String(p.内容 || '').toLowerCase().includes(activeSearchLower)

        // 搜索模式下，忽略分组筛选，进行全局搜索
        if (activeSearchText) {
          return searchMatch
        }

        // 非搜索模式下，执行常规分组筛选
        // 首先确保常用语属于当前分类下的某个分组
        const groupBelongsToSelectedCategory = validGroupIds.has(p.所属分组编号)
        // 然后检查是否匹配当前选中的二级分组
        const groupMatch = !targetGroupId || p.所属分组编号 === targetGroupId

        // 必须同时满足分类逻辑（确保不显示跨分类数据）和当前选中分组逻辑
        return groupBelongsToSelectedCategory && groupMatch
      })
      .sort((a, b) => sortPhrases(a, b, sortBy))
  }, [phrases, phrasesByGroup, selectedGroupId, debouncedSearchText, sortBy, selectedCategoryId, groups, groupsByCategory])

  previewNavigationStateRef.current = { filteredPhrases, isPreviewMode, previewPhraseId }

  useLayoutEffect(() => {
    if (!isPreviewMode || previewPhraseId == null) return

    if (previewScrollRef.current) previewScrollRef.current.scrollTop = 0
    const previewIndex = filteredPhrases.findIndex(phrase => String(phrase.编号) === String(previewPhraseId))
    if (previewIndex < 0) return
    if (previewIndex >= visibleCount) {
      setVisibleCount(current => Math.max(current, Math.min(filteredPhrases.length, previewIndex + 20)))
      return
    }

    const card = document.getElementById(`phrase-${previewPhraseId}`)
    if (card) {
      const visual = pointerVisualRef.current
      if (visual.target === card && visual.kind === 'tilt') {
        if (visual.frame !== null) cancelAnimationFrame(visual.frame)
        visual.frame = null
        visual.target = null
        visual.kind = null
      }
      card.style.transform = ''
    }

    let secondFrame = null
    const ensurePreviewCardVisible = () => {
      const currentCard = document.getElementById(`phrase-${previewPhraseId}`)
      const currentList = phraseListRef.current
      if (!currentCard || !currentList) return

      currentCard.style.transform = ''
      const cardRect = currentCard.getBoundingClientRect()
      const listRect = currentList.getBoundingClientRect()
      const listStyle = window.getComputedStyle(currentList)
      const visibleTop = listRect.top + (Number.parseFloat(listStyle.paddingTop) || 0)
      const visibleBottom = listRect.bottom - (Number.parseFloat(listStyle.paddingBottom) || 0)
      if (cardRect.top < visibleTop || cardRect.bottom > visibleBottom) {
        currentCard.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
      }
    }

    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(ensurePreviewCardVisible)
    })
    const settleTimer = window.setTimeout(ensurePreviewCardVisible, 450)
    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrame !== null) cancelAnimationFrame(secondFrame)
      clearTimeout(settleTimer)
    }
  }, [filteredPhrases, isPreviewMode, previewPhraseId, visibleCount])

  // 搜索建议与主列表使用相同的防抖策略。对大型词库来说，每次按键都重新过滤和排序
  // 整个集合成本很高，而且在防抖结束前也不会产生有意义的结果。
  const searchSuggestionPhrases = useMemo(() => {
    const query = debouncedSearchText.trim().toLowerCase()
    if (!query) return []
    return phrases
      .filter(p => String(p.标题 || '').toLowerCase().includes(query) || String(p.内容 || '').toLowerCase().includes(query))
      .sort((a, b) => (b.使用次数 || 0) - (a.使用次数 || 0))
      .slice(0, 10)
  }, [phrases, debouncedSearchText])

  // 只有实际视图发生变化时才重置分段渲染窗口；排序或使用次数变化不应重启逐帧渲染循环。
  useEffect(() => {
    setVisibleCount(20)
  }, [selectedGroupId, debouncedSearchText, sortBy, selectedCategoryId])

  // 对异常高的视口先补充足够的渲染数量，但一旦列表已经可以滚动就停止扩展。
  useEffect(() => {
    if (visibleCount >= filteredPhrases.length) return undefined
    const timer = requestAnimationFrame(() => {
      const list = phraseListRef.current
      if (list && list.scrollHeight <= list.clientHeight + 200) {
        setVisibleCount(prev => Math.min(prev + 20, filteredPhrases.length))
      }
    })
    return () => cancelAnimationFrame(timer)
  }, [visibleCount, filteredPhrases.length])

  const handlePhraseListScroll = useCallback((e) => {
    const list = e.currentTarget
    if (phraseScrollFrameRef.current !== null) return
    phraseScrollFrameRef.current = requestAnimationFrame(() => {
      phraseScrollFrameRef.current = null
      const distanceToBottom = list.scrollHeight - list.scrollTop - list.clientHeight
      if (distanceToBottom < 400) {
        setVisibleCount(prev => Math.min(prev + 40, filteredPhrases.length))
      }
    })
  }, [filteredPhrases.length])

  useEffect(() => () => {
    if (phraseScrollFrameRef.current !== null) cancelAnimationFrame(phraseScrollFrameRef.current)
    if (groupScrollFrameRef.current !== null) cancelAnimationFrame(groupScrollFrameRef.current)
    if (categoryScrollFrameRef.current !== null) cancelAnimationFrame(categoryScrollFrameRef.current)
    if (pointerVisualRef.current.frame !== null) cancelAnimationFrame(pointerVisualRef.current.frame)
    if (usageFlushTimerRef.current !== null) clearTimeout(usageFlushTimerRef.current)
    if (aiStreamFrameRef.current !== null) cancelAnimationFrame(aiStreamFrameRef.current)
    aiStreamBufferRef.current = ''
    aiContentRequestIdRef.current++
    aiCategorizeRequestIdRef.current++
    aiTitleRequestIdRef.current++
    aiImportRequestIdRef.current++
    if (aiAbortRef.current && typeof aiAbortRef.current.abort === 'function') aiAbortRef.current.abort()
    flipTimersRef.current.forEach(timer => clearTimeout(timer))
  }, [])

  // 仅在真正切换条目时初始化草稿，避免 phrases 状态变化覆盖正在编辑的内容。
  useEffect(() => {
    if (!selectedPhraseId) {
      editPhraseRef.current = null
      setEditPhrase(null)
      return
    }
    const p = phrasesById.get(selectedPhraseId)
    if (!p) {
      editPhraseRef.current = null
      setEditPhrase(null)
    } else if (editPhraseRef.current?.编号 !== p.编号) {
      const nextDraft = { ...p }
      editPhraseRef.current = nextDraft
      setEditPhrase(nextDraft)
    }
  }, [selectedPhraseId, phrasesById])

  const handleExitEdit = () => {
    // 标记正在退出，阻止输入框失焦事件触发保存。
    isExitingRef.current = true
    pendingPhraseCreationRef.current = null

    if (!editPhrase) {
      isExitingRef.current = false
      return
    }
    const original = phrasesById.get(editPhrase.编号)
    if (original && !phraseEditFieldsEqual(original, editPhrase)) {
      setExitDialogOpen(true)
      // 保持退出标记为 true，等待用户在确认对话框中作出选择。
      return
    }
    setEditPhrase(null)
    editPhraseRef.current = null
    setSelectedPhraseId(null)
    pendingPhraseSelectionRef.current = null
    isExitingRef.current = false
  }

  const handleConfirmExit = (save) => {
    const nextPhraseId = pendingPhraseSelectionRef.current
    const pendingCreation = pendingPhraseCreationRef.current
    if (save) {
      const result = handleSavePhrase(editPhraseRef.current, true)
      if (!result.ok) {
        // 校验或存储失败时保留草稿，让用户可以修正或重试，避免静默丢弃输入内容。
        setExitDialogOpen(false)
        pendingPhraseSelectionRef.current = null
        pendingPhraseCreationRef.current = null
        isExitingRef.current = false
        return
      }
    }
    setExitDialogOpen(false)
    setEditPhrase(null)
    editPhraseRef.current = null
    pendingPhraseSelectionRef.current = null
    pendingPhraseCreationRef.current = null
    isExitingRef.current = false
    if (pendingCreation) {
      setSelectedPhraseId(null)
      createPhraseRef.current?.(pendingCreation.initialContent, { skipDirtyCheck: true })
    } else {
      setSelectedPhraseId(nextPhraseId ?? null)
    }
  }

  // 拖拽排序（实时预览）。
  const cancelDragFrame = () => {
    if (autoScrollRef.current !== null) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
    }
    if (dragSortFrameRef.current !== null) {
      cancelAnimationFrame(dragSortFrameRef.current)
      dragSortFrameRef.current = null
    }
    pendingDragPointRef.current = null
  }

  const lockDragSelection = () => {
    if (dragSelectionStyleRef.current) return
    const root = document.documentElement
    const body = document.body
    dragSelectionStyleRef.current = {
      rootUserSelect: root.style.userSelect,
      rootWebkitUserSelect: root.style.webkitUserSelect,
      bodyUserSelect: body?.style.userSelect || '',
      bodyWebkitUserSelect: body?.style.webkitUserSelect || ''
    }
    root.style.userSelect = 'none'
    root.style.webkitUserSelect = 'none'
    if (body) {
      body.style.userSelect = 'none'
      body.style.webkitUserSelect = 'none'
    }
    document.getSelection?.()?.removeAllRanges()
  }

  const unlockDragSelection = () => {
    const previous = dragSelectionStyleRef.current
    if (!previous) return
    const root = document.documentElement
    const body = document.body
    root.style.userSelect = previous.rootUserSelect
    root.style.webkitUserSelect = previous.rootWebkitUserSelect
    if (body) {
      body.style.userSelect = previous.bodyUserSelect
      body.style.webkitUserSelect = previous.bodyWebkitUserSelect
    }
    dragSelectionStyleRef.current = null
  }

  const cancelDragPreviewAnimation = () => {
    pendingDragPreviewLayoutRef.current = null
    dragPreviewAnimationRef.current.forEach(animation => animation.cancel())
    dragPreviewAnimationRef.current.clear()
  }

  const getDragItemLayoutRect = (element) => {
    const rect = element.getBoundingClientRect()
    if (!dragPreviewAnimationRef.current.has(element)) return rect

    const translate = window.getComputedStyle(element).translate
    if (!translate || translate === 'none') return rect
    const [rawX = '0', rawY = '0'] = translate.split(/\s+/)
    const translateX = Number.parseFloat(rawX) || 0
    const translateY = Number.parseFloat(rawY) || 0
    return {
      left: rect.left - translateX,
      right: rect.right - translateX,
      top: rect.top - translateY,
      bottom: rect.bottom - translateY,
      width: rect.width,
      height: rect.height
    }
  }

  const captureDragPreviewLayout = (type) => {
    const list = type === 'group'
      ? groupListRef.current
      : type === 'category'
        ? categoryListRef.current
        : phraseListRef.current
    if (!list) return null

    const elements = Array.from(list.querySelectorAll('[data-drag-type][data-drag-id]'))
      .filter(element => element.getAttribute('data-drag-type') === type)
    const items = new Map(elements.map((element, index) => [
      element,
      { index, rect: element.getBoundingClientRect() }
    ]))
    return { list, type, items }
  }

  const animateDragPreviewLayout = (previousLayout) => {
    if (!previousLayout || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return
    dragPreviewAnimationRef.current.forEach(animation => animation.cancel())
    dragPreviewAnimationRef.current.clear()
    if (!dragSessionActiveRef.current) return

    const currentElements = Array.from(previousLayout.list.querySelectorAll('[data-drag-type][data-drag-id]'))
      .filter(element => element.getAttribute('data-drag-type') === previousLayout.type)
    const currentIndexes = new Map(currentElements.map((element, index) => [element, index]))

    previousLayout.items.forEach(({ index: previousIndex, rect: previousRect }, element) => {
      if (!element.isConnected) return
      const currentIndex = currentIndexes.get(element)
      if (currentIndex == null || currentIndex === previousIndex) return
      const currentRect = element.getBoundingClientRect()
      const deltaX = previousRect.left - currentRect.left
      const deltaY = previousRect.top - currentRect.top
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

      try {
        const animation = element.animate([
          { translate: `${deltaX}px ${deltaY}px` },
          { translate: '0px 0px' }
        ], {
          duration: 160,
          easing: 'cubic-bezier(0.2, 0, 0, 1)'
        })
        dragPreviewAnimationRef.current.set(element, animation)
        const clearAnimation = () => {
          if (dragPreviewAnimationRef.current.get(element) === animation) {
            dragPreviewAnimationRef.current.delete(element)
          }
        }
        animation.onfinish = clearAnimation
        animation.oncancel = clearAnimation
      } catch {
        // 较旧的内嵌 Chromium 继续使用现有的即时预览行为。
      }
    })
  }

  useLayoutEffect(() => {
    const previousLayout = pendingDragPreviewLayoutRef.current
    pendingDragPreviewLayoutRef.current = null
    animateDragPreviewLayout(previousLayout)
  }, [categories, groups, phrases])

  const stopDragSession = () => {
    dragSessionActiveRef.current = false
    cancelDragFrame()
    cancelDragPreviewAnimation()
    dragLayoutRef.current = null
    lastDragTargetRef.current = null
    pendingDragPointRef.current = null
    pendingPointerDragRef.current = null
    dragPointerRef.current = { x: 0, y: 0 }
    unlockDragSelection()
    setIsDragSessionActive(false)
  }

  const getDragTargetFromPoint = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null

    const selector = '[data-drag-type][data-drag-id]'
    const lists = [groupListRef.current, categoryListRef.current, phraseListRef.current]
    const point = document.elementFromPoint(x, y)
    const list = lists.find(candidate => candidate && point && candidate.contains(point)) || lists.find(candidate => {
      if (!candidate) return false
      const rect = candidate.getBoundingClientRect()
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    })
    if (!list) return null

    const dragged = dragItem.current
    const isDraggedElement = item => dragged && item && item.getAttribute('data-drag-type') === dragged.type && item.getAttribute('data-drag-id') === String(dragged.id)

    // 指针捕获和被拖卡片提升后的 z-index 可能让源卡片排在命中结果首位。
    // 检查指针位置上的所有元素，才能找到下方真正的目标卡片。
    const pointElements = typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(x, y)
      : [point].filter(Boolean)
    const direct = pointElements
      .map(item => item?.closest?.(selector))
      .find(item => item && list.contains(item) && !isDraggedElement(item))

    const resolveTarget = target => {
      if (!target || !list.contains(target) || isDraggedElement(target)) return null
      const rect = getDragItemLayoutRect(target)
      if (rect.width <= 0 || rect.height <= 0) return null
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null
      const targetType = target.getAttribute('data-drag-type')
      const targetId = target.getAttribute('data-drag-id')
      if (!targetType || targetId == null) return null

      if (dragged?.type !== targetType) {
        // 跨列表移动（常用语 -> 分组或分类）以整个目标卡片作为放置区域；
        // 方向性插入只用于同一列表内的排序。
        return { type: targetType, id: targetId, placement: null }
      }

      // 拖拽开始时的顺序提供初始方向，指针移动后再确定实际方向。
      // 方向反转时，插入位置和固定的进入阈值必须同步反转。
      const currentOrder = Array.from(list.querySelectorAll(selector))
        .filter(item => item.getAttribute('data-drag-type') === dragged?.type)
        .map(item => item.getAttribute('data-drag-id'))
      const initialOrder = dragged?.initialOrder?.length ? dragged.initialOrder : currentOrder
      const sourceIndex = initialOrder.findIndex(id => String(id) === String(dragged.id))
      const targetIndex = initialOrder.findIndex(id => String(id) === String(targetId))
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return null

      const direction = dragged?.direction || (targetIndex < sourceIndex ? 'up' : 'down')
      const threshold = 10
      if (direction === 'up') {
        // 向上移动时从目标底部进入，越过最初 10px 后，目标卡片剩余区域才生效。
        if (y > rect.bottom - threshold) return null
        return { type: targetType, id: targetId, placement: 'before' }
      }

      // 向下移动时从目标顶部进入，越过最初 10px 后，目标卡片剩余区域才生效。
      if (y < rect.top + threshold) return null
      return { type: targetType, id: targetId, placement: 'after' }
    }

    const directTarget = resolveTarget(direct)
    if (directTarget) return directTarget

    // 如果源卡片视觉上覆盖了目标，只接受其根节点矩形真正包含指针的卡片。
    // 不要在卡片间隙中选择最近卡片，否则会重新引入整卡片命中测试。
    const coveredTarget = Array.from(list.querySelectorAll(selector))
      .filter(item => !isDraggedElement(item) && item.getAttribute('data-drag-type') === dragged?.type)
      .map(item => ({ item, rect: getDragItemLayoutRect(item) }))
      .filter(({ rect }) => (
        rect.width > 0 && rect.height > 0 &&
        x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom
      ))
      .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height))[0]?.item

    return resolveTarget(coveredTarget)
  }

  const getDragTargetFromEvent = (e) => getDragTargetFromPoint(e.clientX, e.clientY)

  const requestDragSortFrame = () => {
    if (dragSortFrameRef.current !== null) return
    dragSortFrameRef.current = requestAnimationFrame(() => {
      dragSortFrameRef.current = null
      if (!dragSessionActiveRef.current) return

      const pointRequest = pendingDragPointRef.current
      pendingDragPointRef.current = null
      const pointTarget = pointRequest
        ? getDragTargetFromPoint(pointRequest.x, pointRequest.y)
        : null
      if (pointTarget) {
        applyLiveDragSort(pointTarget.type, pointTarget.id, pointTarget.placement)
      } else {
        // 指针离开间隙或列表滚动后重新进入时，旧目标键不能阻止新的有效预览。
        lastDragTargetRef.current = null
        if (dragItem.current?.type === 'phrase') {
          setDragOverGroupId(previous => previous === null ? previous : null)
        }
      }
    })
  }

  const scheduleDragTargetFromPoint = (x, y) => {
    if (!dragSessionActiveRef.current) return
    pendingDragPointRef.current = { x, y }
    requestDragSortFrame()
  }

  const flushPendingDragTarget = () => {
    if (dragSortFrameRef.current !== null) {
      cancelAnimationFrame(dragSortFrameRef.current)
      dragSortFrameRef.current = null
    }
    const pointRequest = pendingDragPointRef.current
    pendingDragPointRef.current = null
    const pointTarget = pointRequest
      ? getDragTargetFromPoint(pointRequest.x, pointRequest.y)
      : null
    if (pointTarget && dragSessionActiveRef.current) {
      applyLiveDragSort(pointTarget.type, pointTarget.id, pointTarget.placement)
    }
  }

  const scheduleDragFrame = () => {
    if (!dragSessionActiveRef.current || autoScrollRef.current !== null) return
    autoScrollRef.current = requestAnimationFrame(() => {
      autoScrollRef.current = null
      if (!dragSessionActiveRef.current) return

      if (!dragLayoutRef.current) {
        dragLayoutRef.current = {
          group: groupListRef.current?.getBoundingClientRect() || null,
          category: categoryListRef.current?.getBoundingClientRect() || null,
          phrase: phraseListRef.current?.getBoundingClientRect() || null
        }
      }

      const { x, y } = dragPointerRef.current
      const threshold = 100
      const maxSpeed = 20
      let didScroll = false
      const calculateSpeed = (distance) => {
        if (distance >= threshold) return 0
        const ratio = 1 - Math.max(0, distance) / threshold
        return Math.round(maxSpeed * ratio * ratio)
      }
      const scrollList = (list, rect) => {
        if (!list || !rect || x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return false
        const topSpeed = calculateSpeed(y - rect.top)
        const bottomSpeed = calculateSpeed(rect.bottom - y)
        if (topSpeed > 0) {
          const previousScrollTop = list.scrollTop
          list.scrollTop -= topSpeed
          const changed = list.scrollTop !== previousScrollTop
          if (changed && dragItem.current) {
            dragItem.current.direction = 'up'
            dragItem.current.directionAnchorY = y
          }
          return changed
        }
        if (bottomSpeed > 0) {
          const previousScrollTop = list.scrollTop
          list.scrollTop += bottomSpeed
          const changed = list.scrollTop !== previousScrollTop
          if (changed && dragItem.current) {
            dragItem.current.direction = 'down'
            dragItem.current.directionAnchorY = y
          }
          return changed
        }
        return false
      }

      // 三个栏位互不重叠，因此每个动画帧最多只需要滚动其中一个栏位。
      didScroll = scrollList(groupListRef.current, dragLayoutRef.current.group)
      if (!didScroll) didScroll = scrollList(categoryListRef.current, dragLayoutRef.current.category)
      if (!didScroll) didScroll = scrollList(phraseListRef.current, dragLayoutRef.current.phrase)
      if (didScroll) {
        // 滚动会改变指针下方的卡片，但不一定再次触发原生 dragenter 或 dragover 事件。
        scheduleDragTargetFromPoint(x, y)
        scheduleDragFrame()
      }
    })
  }

  // 原生 dragend 通常一定会触发，但在内嵌 Chromium 中，拖拽离开窗口可能跳过该事件。
  // 无论如何都要恢复持久化流程，不能让保存状态永久暂停。
  useEffect(() => {
    const handleWindowBlur = () => {
      if (!dragSessionActiveRef.current) {
        pendingPointerDragRef.current = null
        unlockDragSelection()
        return
      }
      const draggingType = dragItem.current?.type
      stopDragSession()
      dragItem.current = null
      dragHistoryRecordedRef.current = false
      setDraggingPhraseId(null)
      setDragOverGroupId(null)
      if (draggingType) normalizeOrdersForDrag(draggingType)
    }
    window.addEventListener('blur', handleWindowBlur)
    return () => window.removeEventListener('blur', handleWindowBlur)
  }, [])

  const handleDragStart = (e, type, id, sourceElement = e.currentTarget) => {
    const isGuideDemo = id === GUIDE_IDS.category || id === GUIDE_IDS.group || GUIDE_PHRASE_IDS.has(id)
    if (isGuideDemo) {
      e.preventDefault?.()
      showSnackbar(t('snackbar.guideDemoReadOnly'), 'info')
      return
    }
    cancelDragFrame()
    dragSessionActiveRef.current = true
    setIsDragSessionActive(true)
    dragHistoryRecordedRef.current = false
    lastDragTargetRef.current = null
    dragLayoutRef.current = null

    // 计算初始索引
    let initialIndex = -1
    if (type === 'category') {
      initialIndex = categories.findIndex(x => x.编号 === id)
    } else if (type === 'group') {
      initialIndex = filteredGroups.findIndex(x => x.编号 === id)
    } else if (type === 'phrase') {
      initialIndex = filteredPhrases.findIndex(x => x.编号 === id)
    }

    const dragList = [groupListRef.current, categoryListRef.current, phraseListRef.current]
      .find(list => list && sourceElement && list.contains(sourceElement))
    const dataOrder = type === 'category'
      ? categories.map(item => item.编号)
      : type === 'group'
        ? filteredGroups.map(item => item.编号)
        : filteredPhrases.map(item => item.编号)
    const initialOrder = dataOrder.length > 0
      ? dataOrder
      : (dragList
        ? Array.from(dragList.querySelectorAll('[data-drag-type][data-drag-id]'))
          .filter(item => item.getAttribute('data-drag-type') === type)
          .map(item => item.getAttribute('data-drag-id'))
        : [])

    dragPointerRef.current = { x: e.clientX, y: e.clientY }
    dragItem.current = {
      type,
      id,
      ctrlKey: e.ctrlKey || e.metaKey,
      initialIndex,
      initialOrder,
      sourceElement,
      direction: null,
      directionAnchorY: e.clientY
    }

    if (type === 'phrase') {
      setDraggingPhraseId(id)
    } else if (type === 'category') {
      setDraggingPhraseId(id)
    } else if (type === 'group') {
      setDraggingPhraseId(id)
    }
  }

  const handlePointerDragStart = (e, type, id) => {
    if (e.button !== 0 || e.isPrimary === false) return
    if (id === GUIDE_IDS.category || id === GUIDE_IDS.group || GUIDE_PHRASE_IDS.has(id)) return
    if (dragSessionActiveRef.current || pendingPointerDragRef.current?.dragging) return
    if (e.target?.closest?.('.MuiIconButton-root, .MuiCheckbox-root, input, textarea, select, [contenteditable="true"]')) return
    lockDragSelection()
    pendingPointerDragRef.current = {
      type,
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      target: e.currentTarget,
      dragging: false
    }
  }

  const applyLiveDragSort = (targetType, targetId, placement = null) => {
    if (!dragItem.current) return
    const { type: dragType, id: dragId } = dragItem.current

    // 将常用语拖到分组上属于跨列表放置，不参与同列表实时排序。
    if (dragType === 'phrase' && targetType === 'group') {
      setDragOverGroupId(previous => previous === targetId ? previous : targetId)
      return
    }

    // 下面两种组合由 handleDrop 统一处理，属于跨分类移动。
    if (dragType === 'group' && targetType === 'category') {
      setDragOverGroupId(previous => previous === null ? previous : null)
      return
    }
    if (dragType === 'phrase' && targetType === 'category') {
      setDragOverGroupId(previous => previous === null ? previous : null)
      return
    }

    if (dragType !== 'category' || targetType !== 'category') {
      setDragOverGroupId(previous => previous === null ? previous : null)
    }

    if (dragType !== targetType || String(dragId) === String(targetId)) return
    if (targetType === 'phrase' && sortBy !== 'custom') return

    const targetKey = `${targetType}:${targetId}:${placement || 'auto'}`
    if (lastDragTargetRef.current === targetKey) return
    lastDragTargetRef.current = targetKey

    const previousPreviewLayout = captureDragPreviewLayout(dragType)
    pendingDragPreviewLayoutRef.current = previousPreviewLayout

    if (!dragHistoryRecordedRef.current) {
      addToHistory()
      dragHistoryRecordedRef.current = true
    }

    const resolvePlacement = (draggedOrder, targetOrder) => {
      if (placement === 'before' || placement === 'after') return placement
      return draggedOrder < targetOrder ? 'after' : 'before'
    }
    const orderForInsertion = (items, insertionIndex) => {
      const previous = items[insertionIndex - 1]
      const next = items[insertionIndex]
      if (!previous && !next) return 0
      if (!previous) return (Number(next.排序) || 0) - 1
      if (!next) return (Number(previous.排序) || 0) + 1
      const previousOrder = Number(previous.排序) || 0
      const nextOrder = Number(next.排序) || 0
      return previousOrder + (nextOrder - previousOrder) / 2
    }

    if (dragType === 'category') {
      setCategories(prev => {
        const items = [...prev].sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
        const dragIdx = items.findIndex(category => String(category.编号) === String(dragId))
        const targetIdx = items.findIndex(category => String(category.编号) === String(targetId))
        if (dragIdx === -1 || targetIdx === -1) return prev

        const [dragged] = items.splice(dragIdx, 1)
        const nextTargetIdx = items.findIndex(category => String(category.编号) === String(targetId))
        const draggedOrder = Number(dragged.排序) || 0
        const targetOrder = Number(items[nextTargetIdx]?.排序) || 0
        const resolvedPlacement = resolvePlacement(draggedOrder, targetOrder)
        const insertionIndex = nextTargetIdx + (resolvedPlacement === 'after' ? 1 : 0)
        items.splice(insertionIndex, 0, dragged)

        return items.map((category, i) => category.排序 === i ? category : { ...category, 排序: i })
      })
    } else if (dragType === 'group') {
      setGroups(prev => {
        const draggedGroup = prev.find(group => String(group.编号) === String(dragId))
        const targetGroup = prev.find(group => String(group.编号) === String(targetId))
        if (!draggedGroup || !targetGroup || draggedGroup.所属分类编号 !== targetGroup.所属分类编号) return prev
        const siblings = prev
          .filter(group => group.所属分类编号 === draggedGroup.所属分类编号)
          .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
        const withoutDragged = siblings.filter(group => String(group.编号) !== String(dragId))
        const targetIndex = withoutDragged.findIndex(group => String(group.编号) === String(targetId))
        if (targetIndex === -1) return prev
        const resolvedPlacement = resolvePlacement(Number(draggedGroup.排序) || 0, Number(targetGroup.排序) || 0)
        const insertionIndex = targetIndex + (resolvedPlacement === 'after' ? 1 : 0)
        const nextOrder = orderForInsertion(withoutDragged, insertionIndex)
        if (draggedGroup.排序 === nextOrder) return prev
        return prev.map(group => String(group.编号) === String(dragId) ? { ...group, 排序: nextOrder } : group)
      })
    } else {
      setPhrases(prev => {
        const draggedPhrase = prev.find(p => String(p.编号) === String(dragId))
        const targetPhrase = prev.find(p => String(p.编号) === String(targetId))
        if (!draggedPhrase || !targetPhrase || draggedPhrase.所属分组编号 !== targetPhrase.所属分组编号) return prev
        const siblings = prev
          .filter(p => p.所属分组编号 === draggedPhrase.所属分组编号)
          .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
        const withoutDragged = siblings.filter(p => String(p.编号) !== String(dragId))
        const targetIndex = withoutDragged.findIndex(p => String(p.编号) === String(targetId))
        if (targetIndex === -1) return prev
        const resolvedPlacement = resolvePlacement(Number(draggedPhrase.排序) || 0, Number(targetPhrase.排序) || 0)
        const insertionIndex = targetIndex + (resolvedPlacement === 'after' ? 1 : 0)
        const nextOrder = orderForInsertion(withoutDragged, insertionIndex)
        if (draggedPhrase.排序 === nextOrder) return prev
        return prev.map(p => String(p.编号) === String(dragId) ? { ...p, 排序: nextOrder } : p)
      })
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    if (!dragItem.current) return
    // React 收到 dragenter 时，事件目标可能已经落后于指针位置。
    // 根据事件坐标重新解析目标，确保有效区域判断使用最新位置。
    scheduleDragTargetFromPoint(e.clientX, e.clientY)
  }

  const normalizeOrdersForDrag = (type) => {
    if (type === 'category') {
      setCategories(prev => {
        const sorted = [...prev].sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
        let changed = sorted.length !== prev.length || sorted.some((item, index) => prev[index] !== item || item.排序 !== index)
        if (!changed) return prev
        return sorted.map((item, index) => item.排序 === index ? item : { ...item, 排序: index })
      })
      return
    }

    if (type === 'group') {
      setGroups(prev => {
        const orderMap = new Map()
        const categoryIds = new Set(prev.map(item => item.所属分类编号))
        categoryIds.forEach(categoryId => {
          prev
            .filter(item => item.所属分类编号 === categoryId)
            .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
            .forEach((item, index) => orderMap.set(item.编号, index))
        })
        let changed = false
        const next = prev.map(item => {
          const order = orderMap.get(item.编号)
          if (order !== item.排序) {
            changed = true
            return { ...item, 排序: order }
          }
          return item
        })
        return changed ? next : prev
      })
      return
    }

    setPhrases(prev => {
      const orderMap = new Map()
      const groupIds = new Set(prev.map(item => item.所属分组编号))
      groupIds.forEach(groupId => {
        prev
          .filter(item => item.所属分组编号 === groupId)
          .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
          .forEach((item, index) => orderMap.set(item.编号, index))
      })
      let changed = false
      const next = prev.map(item => {
        const order = orderMap.get(item.编号)
        if (order !== item.排序) {
          changed = true
          return { ...item, 排序: order }
        }
        return item
      })
      return changed ? next : prev
    })
  }

  const handleDragEnd = () => {
    const draggingType = dragItem.current?.type

    flushPendingDragTarget()
    stopDragSession()
    dragItem.current = null
    dragHistoryRecordedRef.current = false
    setDraggingPhraseId(null)
    setDragOverGroupId(null)

    if (draggingType) normalizeOrdersForDrag(draggingType)
  }
  const handleDragOver = (e) => {
    e.preventDefault()
    const dragType = dragItem.current?.type
    let effect = (e.ctrlKey || e.metaKey) ? 'copy' : 'move'
    const layout = dragLayoutRef.current
    const x = e.clientX

    // 使用上一帧缓存的矩形，避免每次 dragover 都强制触发布局计算。
    if (layout) {
      if (dragType === 'group' && layout.phrase && x >= layout.phrase.left && x <= layout.phrase.right) {
        effect = 'none'
      }
      if (dragType === 'category') {
        if (layout.group && x >= layout.group.left && x <= layout.group.right) effect = 'none'
        if (layout.phrase && x >= layout.phrase.left && x <= layout.phrase.right) effect = 'none'
      }
    }
    if (e.dataTransfer) e.dataTransfer.dropEffect = effect
    dragPointerRef.current = { x, y: e.clientY }
    scheduleDragFrame()
    const fallbackTarget = getDragTargetFromEvent(e)
    scheduleDragTargetFromPoint(x, e.clientY)
    if (!fallbackTarget && dragItem.current?.type === 'phrase' && (
      e.currentTarget === groupListRef.current ||
      e.currentTarget === categoryListRef.current ||
      e.currentTarget === phraseListRef.current
    )) {
      // 指针进入滚动容器的空白区域时，清除过期的分组放置预览。
      setDragOverGroupId(null)
    }
  }

  // 将当前拖拽回调保存到引用中，让常驻的指针和滚轮监听器不会在实时排序后
  // 捕获过期的集合数据。
  useEffect(() => {
    pointerDragLogicRef.current = {
      handleDragStart,
      handleDrop,
      handleDragEnd,
      normalizeOrdersForDrag,
      getDragTargetFromPoint,
      getDragTargetFromEvent,
      scheduleDragFrame,
      scheduleDragTargetFromPoint,
      stopDragSession
    }
  })

  // 内嵌 Chromium 可能抑制原生 HTML5 DnD 的滚轮和指针事件。
  // 指针拖拽沿用相同的视觉和放置行为，同时让滚动与命中测试不依赖原生会话。
  useEffect(() => {
    const handlePointerMove = (event) => {
      const pending = pendingPointerDragRef.current
      if (!pending || event.pointerId !== pending.pointerId) return

      const distance = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY)
      if (!pending.dragging) {
        if (distance < 12) return
        pending.dragging = true
        pointerDragLogicRef.current?.handleDragStart(event, pending.type, pending.id, pending.target)
        const initialDeltaY = event.clientY - pending.startY
        if (dragItem.current && Math.abs(initialDeltaY) >= 2) {
          dragItem.current.direction = initialDeltaY > 0 ? 'down' : 'up'
          dragItem.current.directionAnchorY = event.clientY
        }
        try {
          // 只有确认进入真正拖拽后才捕获指针；在 pointerdown 阶段捕获会把短点击
          // 重定向到外层 ListItem，阻止内部按钮切换分组或分类。
          pending.target?.setPointerCapture?.(pending.pointerId)
        } catch {
          // 如果浏览器不支持捕获，则由窗口级监听器作为兜底。
        }
      }

      if (!dragSessionActiveRef.current) return
      // 在移动距离超过阈值前保留普通点击行为。
      if (event.cancelable) event.preventDefault()
      document.getSelection?.()?.removeAllRanges()
      const activeDrag = dragItem.current
      const directionDelta = event.clientY - (activeDrag?.directionAnchorY ?? event.clientY)
      if (activeDrag && Math.abs(directionDelta) >= 3) {
        activeDrag.direction = directionDelta > 0 ? 'down' : 'up'
        activeDrag.directionAnchorY = event.clientY
      }
      dragPointerRef.current = { x: event.clientX, y: event.clientY }
      pointerDragLogicRef.current?.scheduleDragFrame()
      pointerDragLogicRef.current?.scheduleDragTargetFromPoint(event.clientX, event.clientY)
    }

    const finishPointerDrag = (event, cancelled = false) => {
      const pending = pendingPointerDragRef.current
      if (!pending || event.pointerId !== pending.pointerId) return
      pendingPointerDragRef.current = null
      if (!pending.dragging) {
        unlockDragSelection()
        return
      }

      event.preventDefault()
      if (suppressClickTimerRef.current !== null) {
        clearTimeout(suppressClickTimerRef.current)
      }
      suppressNextClickRef.current = true
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressNextClickRef.current = false
        suppressClickTimerRef.current = null
      }, 80)
      const logic = pointerDragLogicRef.current
      if (cancelled) {
        try {
          pending.target?.releasePointerCapture?.(pending.pointerId)
        } catch {
      // 指针可能已经被浏览器提前释放。
        }
        logic?.handleDragEnd(event)
        return
      }

      const activeDrag = dragItem.current
      const releaseDirectionDelta = event.clientY - (activeDrag?.directionAnchorY ?? event.clientY)
      if (activeDrag && Math.abs(releaseDirectionDelta) >= 3) {
        activeDrag.direction = releaseDirectionDelta > 0 ? 'down' : 'up'
        activeDrag.directionAnchorY = event.clientY
      }

    // 在拖拽会话和 DOM 状态仍完整时解析释放点；如果先释放指针捕获，
    // 事件可能被重新定位，导致最终卡片查找结果与可见指针位置不一致。
      const target = logic?.getDragTargetFromPoint(event.clientX, event.clientY) || logic?.getDragTargetFromEvent(event)
      try {
        pending.target?.releasePointerCapture?.(pending.pointerId)
      } catch {
        // 指针可能已经被浏览器提前释放。
      }
      logic?.handleDrop(event, target?.type, target?.id, target?.placement)
      logic?.handleDragEnd(event)
    }

    const handlePointerUp = (event) => finishPointerDrag(event, false)
    const handlePointerCancel = (event) => finishPointerDrag(event, true)
    const handleSuppressedClick = (event) => {
      if (!suppressNextClickRef.current) return
      suppressNextClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
    }
    const handleSelectStart = (event) => {
      if (!pendingPointerDragRef.current && !dragSessionActiveRef.current) return
      event.preventDefault()
      event.stopPropagation()
    }
    const handleNativeDragStart = (event) => {
      if (!pendingPointerDragRef.current && !dragSessionActiveRef.current) return
      event.preventDefault()
      event.stopPropagation()
    }

    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: false })
    window.addEventListener('pointerup', handlePointerUp, true)
    window.addEventListener('pointercancel', handlePointerCancel, true)
    window.addEventListener('click', handleSuppressedClick, true)
    window.addEventListener('selectstart', handleSelectStart, true)
    window.addEventListener('dragstart', handleNativeDragStart, true)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, { capture: true })
      window.removeEventListener('pointerup', handlePointerUp, true)
      window.removeEventListener('pointercancel', handlePointerCancel, true)
      window.removeEventListener('click', handleSuppressedClick, true)
      window.removeEventListener('selectstart', handleSelectStart, true)
      window.removeEventListener('dragstart', handleNativeDragStart, true)
      pendingPointerDragRef.current = null
      if (suppressClickTimerRef.current !== null) {
        clearTimeout(suppressClickTimerRef.current)
        suppressClickTimerRef.current = null
      }
      suppressNextClickRef.current = false
      unlockDragSelection()
    }
  }, [])

  // 该监听器在组件整个生命周期内保持挂载；某些原生拖拽实现如果等 React 渲染后
  // 才安装监听器，就已经错过了关键事件。
  useEffect(() => {
    const getListAtPoint = (x, y) => {
      const point = document.elementFromPoint(x, y)
      const lists = [groupListRef.current, categoryListRef.current, phraseListRef.current]
      const pointList = lists.find(list => list && point && list.contains(point))
      if (pointList) return pointList

      const layout = dragLayoutRef.current
      const rects = [
        [groupListRef.current, layout?.group],
        [categoryListRef.current, layout?.category],
        [phraseListRef.current, layout?.phrase]
      ]
      const rectMatch = rects.find(([list, rect]) => list && rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
      return rectMatch?.[0] || null
    }

    const handleDragWheel = (event) => {
      if (!dragSessionActiveRef.current) return
      const list = getListAtPoint(event.clientX, event.clientY)
      if (!list) return

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? list.clientHeight : 1
      const delta = event.deltaY * unit
      if (!delta) return

      event.preventDefault()
      event.stopPropagation()
      if (dragItem.current) {
        dragItem.current.direction = delta > 0 ? 'down' : 'up'
        dragItem.current.directionAnchorY = event.clientY
      }
      list.scrollTop += delta
      dragPointerRef.current = { x: event.clientX, y: event.clientY }
      pointerDragLogicRef.current?.scheduleDragFrame()
      pointerDragLogicRef.current?.scheduleDragTargetFromPoint(event.clientX, event.clientY)
    }

    window.addEventListener('wheel', handleDragWheel, { capture: true, passive: false })
    return () => window.removeEventListener('wheel', handleDragWheel, { capture: true })
  }, [])

  const handleDrop = (e, targetType, targetId, targetPlacement = null) => {
    e.preventDefault()
    // 始终根据坐标解析释放位置，避免延迟到达的拖拽事件绕过最终目标校验。
    const pointTarget = getDragTargetFromPoint(e.clientX, e.clientY) || getDragTargetFromEvent(e)
    if (e.type === 'drop' && !pointTarget) {
      targetType = null
      targetId = null
      targetPlacement = null
    }
    if (pointTarget) {
      targetType = pointTarget.type
      targetId = pointTarget.id
      targetPlacement = pointTarget.placement
    }
    if (!dragItem.current) {
      stopDragSession()
      return
    }
    const { type: dragType, id: dragId, ctrlKey } = dragItem.current
    // 放置是拖拽会话的提交点：先丢弃排队中的动画帧，再同步应用最终指针边界，
    // 防止过期的 pointermove 覆盖释放位置。
    cancelDragFrame()
    if (targetType && targetId != null && dragSessionActiveRef.current) {
      applyLiveDragSort(targetType, targetId, targetPlacement)
    }
    stopDragSession()
    const ensureDragHistory = () => {
      if (!dragHistoryRecordedRef.current) {
        addToHistory()
        dragHistoryRecordedRef.current = true
      }
    }

    // 拖动常用语到分组
    if (dragType === 'phrase' && targetType === 'group') {
      const current = latestCollectionsRef.current
      const phrase = current.常用语.find(item => String(item.编号) === String(dragId))
      const targetGroup = current.分组.find(item => String(item.编号) === String(targetId))
      if (!targetGroup || !current.分类.some(category => String(category.编号) === String(targetGroup.所属分类编号))) return
      if (!phrase || phrase.所属分组编号 === targetId) return
      ensureDragHistory()

      const now = Date.now()
      if (ctrlKey || e.ctrlKey || e.metaKey) {
        // Ctrl+拖动：克隆到新分组
        if (phrase.是否新建 || phrase.是否引导演示 || targetGroup.是否新建 || targetGroup.是否引导演示) return
        const targetPhrases = current.常用语.filter(item => String(item.所属分组编号) === String(targetId))
        const maxOrder = Math.max(...targetPhrases.map(p => p.排序 || 0), -1)
        const newPhrase = {
          编号: generateId(),
          标题: phrase.标题,
          内容: phrase.内容,
          所属分组编号: targetId,
          排序: maxOrder + 1,
          创建时间: now,
          更新时间: now,
          使用次数: 0
        }
        setPhrases(prev => [...prev, newPhrase])
        showSnackbar(t('snackbar.clonedToGroup'))
      } else {
        // 普通拖动：移动到新分组
        const targetPhrases = current.常用语.filter(item => String(item.所属分组编号) === String(targetId))
        const maxOrder = Math.max(...targetPhrases.map(p => p.排序 || 0), -1)
        setPhrases(prev => prev.map(p =>
          p.编号 === dragId ? { ...p, 所属分组编号: targetId, 排序: maxOrder + 1 } : p
        ))
        showSnackbar(t('snackbar.movedToGroup'))
      }
      // 重置拖拽状态，防止样式残留
      dragItem.current = null
      setDraggingPhraseId(null)
      setDragOverGroupId(null)
    }

    // 拖动分组到分类
    if (dragType === 'group' && targetType === 'category') {
      const current = latestCollectionsRef.current
      const group = current.分组.find(item => String(item.编号) === String(dragId))
      const targetCategory = current.分类.find(item => String(item.编号) === String(targetId))
      if (!group || !targetCategory || String(group.所属分类编号) === String(targetId)) return
      ensureDragHistory()

      if (ctrlKey || e.ctrlKey || e.metaKey) {
        // 复制分组及其下所有常用语
        // 批量模式支持
        const isBatch = batchMode && selectedGroupIds.has(dragId)
        const groupsToProcess = isBatch
          ? current.分组.filter(item => selectedGroupIds.has(item.编号))
          : [group]
        const copyableGroups = groupsToProcess.filter(item => !item.是否新建 && !item.是否引导演示)
        if (copyableGroups.length === 0) return

        const newGroups = []
        let allNewPhrases = []

        // 找到目标分类现有分组中的最大排序值。
        const targetCategoryGroups = current.分组
          .filter(item => String(item.所属分类编号) === String(targetId))
        let maxGroupOrder = Math.max(...targetCategoryGroups.map(group => group.排序 || 0), -1)

        copyableGroups.forEach(sourceGroup => {
          maxGroupOrder++
          const newGroupId = generateId()
          const newGroup = {
            编号: newGroupId,
            名称: String(sourceGroup.名称 || '').trim() || t('defaults.groupName'),
            所属分类编号: targetId,
            排序: maxGroupOrder,
            创建时间: Date.now()
          }
          newGroups.push(newGroup)

          // 复制该分组下的所有常用语
          const sourcePhrases = current.常用语
            .filter(item => String(item.所属分组编号) === String(sourceGroup.编号) && !item.是否新建 && !item.是否引导演示)
          const newPhrases = sourcePhrases.map(p => ({
            编号: generateId(),
            标题: p.标题,
            内容: p.内容,
            所属分组编号: newGroupId,
            排序: p.排序,
            使用次数: 0,
            创建时间: Date.now(),
            更新时间: Date.now()
          }))
          allNewPhrases = [...allNewPhrases, ...newPhrases]
        })

        setGroups(prev => [...prev, ...newGroups])
        setPhrases(prev => [...prev, ...allNewPhrases])
        showSnackbar(copyableGroups.length > 1 ? t('snackbar.groupsCopiedToCategory', { count: copyableGroups.length }) : t('snackbar.groupCopiedToCategory'))
      } else {
        // 移动
        // 批量模式支持
        const isBatch = batchMode && selectedGroupIds.has(dragId)
        const groupIdsToMove = isBatch ? Array.from(selectedGroupIds) : [dragId]

        setGroups(prev => prev.map(group =>
          groupIdsToMove.includes(group.编号) ? { ...group, 所属分类编号: targetId } : group
        ))

        // 如果当前选中分组被移动了，切换选中分类
        if (groupIdsToMove.includes(selectedGroupId)) {
          setSelectedCategoryId(targetId)
        }
        showSnackbar(groupIdsToMove.length > 1 ? t('snackbar.groupsMovedToCategory', { count: groupIdsToMove.length }) : t('snackbar.groupMovedToCategory'))
      }
    }

  // 将常用语拖入分类，并放入该分类的“未分组”分组。
    if (dragType === 'phrase' && targetType === 'category') {
      const current = latestCollectionsRef.current
      const targetCategory = current.分类.find(item => String(item.编号) === String(targetId))
      if (!targetCategory) return
      const isBatch = batchMode && selectedPhraseIds.has(dragId)
      const phrasesToProcess = isBatch
        ? current.常用语.filter(phrase => selectedPhraseIds.has(phrase.编号))
        : [current.常用语.find(phrase => String(phrase.编号) === String(dragId))]
      const validPhrases = phrasesToProcess.filter(Boolean)
      if (validPhrases.length === 0) return
      const isCopy = ctrlKey || e.ctrlKey || e.metaKey
      const existingTargetGroup = current.分组
        .filter(item => String(item.所属分类编号) === String(targetId))
        .find(item => item.名称 === t('defaults.uncategorized'))
      const copyableSources = validPhrases.filter(phrase => !phrase.是否新建 && !phrase.是否引导演示)
      if (isCopy && (copyableSources.length === 0 || existingTargetGroup?.是否新建 || existingTargetGroup?.是否引导演示)) return
      ensureDragHistory()
      // 查找目标分类下的“未分组”
      let targetGroup = existingTargetGroup

        // 如果目标分类还没有“未分组”，则先创建该分组。
      if (!targetGroup) {
        const newGroupId = 'group-uncategorized-' + Date.now()
        // 找到该分类现有分组中的最大排序值。
        const siblings = current.分组
          .filter(item => String(item.所属分类编号) === String(targetId))
        const maxOrder = Math.max(...siblings.map(group => group.排序 || 0), -1)

        targetGroup = {
          编号: newGroupId,
          名称: t('defaults.uncategorized'),
          所属分类编号: targetId,
          排序: maxOrder + 1,
          创建时间: Date.now()
        }
        // 这里只更新 React 状态，后续由 saveData 统一持久化。
        setGroups(prev => [...prev, targetGroup])
      }

      // 移动/复制常用语
      // 批量模式支持
      if (isCopy) {
        // 复制
        const copyablePhrases = copyableSources.filter(phrase => !targetGroup.是否新建 && !targetGroup.是否引导演示)
        if (copyablePhrases.length === 0) return
        const targetPhrases = current.常用语
          .filter(phrase => String(phrase.所属分组编号) === String(targetGroup.编号))
        let maxOrder = Math.max(...targetPhrases.map(p => p.排序 || 0), -1)

        const newPhrases = copyablePhrases.map(p => {
          maxOrder++
          return {
            编号: generateId(),
            标题: p.标题,
            内容: p.内容,
            所属分组编号: targetGroup.编号,
            排序: maxOrder,
            创建时间: Date.now(),
            更新时间: Date.now(),
            使用次数: 0
          }
        })

        setPhrases(prev => [...prev, ...newPhrases])
        showSnackbar(copyablePhrases.length > 1 ? t('snackbar.phrasesCopiedToUncategorized', { count: copyablePhrases.length }) : t('snackbar.copiedToUncategorized'))
      } else {
        // 移动
        const phraseIdsToMove = validPhrases.map(p => p.编号)
        const targetPhrases = current.常用语
          .filter(phrase => String(phrase.所属分组编号) === String(targetGroup.编号))
        let maxOrder = Math.max(...targetPhrases.map(p => p.排序 || 0), -1)

        setPhrases(prev => prev.map(p => {
          if (phraseIdsToMove.includes(p.编号)) {
            maxOrder++
            return { ...p, 所属分组编号: targetGroup.编号, 排序: maxOrder }
          }
          return p
        }))
        showSnackbar(validPhrases.length > 1 ? t('snackbar.phrasesMovedToUncategorized', { count: validPhrases.length }) : t('snackbar.movedToUncategorized'))

        // 移动后自动跳转过去
        setSelectedCategoryId(targetId)
        setSelectedGroupId(targetGroup.编号)
      }

      // 清理
      dragItem.current = null
      setDraggingPhraseId(null)
    }
  }

  // 全局快捷键监听
  // 辅助：检查是否有输入框聚焦
  const isAnyInputFocused = () => {
    const active = document.activeElement
    const tag = active?.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || active?.isContentEditable
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const key = e.key.toLowerCase()
      const target = e.target
      const isTextEditing = target?.isContentEditable || Boolean(target?.closest?.('input, textarea, [contenteditable="true"]'))
      const modalOpen = exitDialogOpen || helpOpen || settingsOpen || aiDialogOpen || Boolean(importPreview) || Boolean(aiImportSource) || Boolean(createCollectionDialog)
      if (modalOpen) return

      const previewState = previewNavigationStateRef.current
      const previewOpen = Boolean(previewState?.isPreviewMode)
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
      const isSpaceKey = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar'
      if (!isTextEditing && isSpaceKey && !hasModifier && !e.repeat) {
        if (!previewOpen && (hoverPhraseIdRef.current == null || dragSessionActiveRef.current)) return
        e.preventDefault()
        previewKeyboardNavigationRef.current = false
        setIsPreviewMode(!previewOpen)
        setPreviewPhraseId(previewOpen ? null : hoverPhraseIdRef.current)
        return
      }
      if (!isTextEditing && previewOpen && !hasModifier && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const currentPhrases = previewState.filteredPhrases
        if (currentPhrases.length === 0) return
        previewKeyboardNavigationRef.current = true
        const currentId = previewState.previewPhraseId ?? hoverPhraseIdRef.current
        const currentIndex = currentPhrases.findIndex(phrase => String(phrase.编号) === String(currentId))
        const nextIndex = currentIndex < 0
          ? (e.key === 'ArrowUp' ? currentPhrases.length - 1 : 0)
          : e.key === 'ArrowUp'
            ? Math.max(0, currentIndex - 1)
            : Math.min(currentPhrases.length - 1, currentIndex + 1)
        const nextPhrase = currentPhrases[nextIndex]
        if (nextPhrase && nextPhrase.编号 !== previewState.previewPhraseId) setPreviewPhraseId(nextPhrase.编号)
        return
      }

      const wantsUndo = (e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey
      const wantsRedo = (e.ctrlKey || e.metaKey) && ((key === 'z' && e.shiftKey) || (key === 'y' && !e.shiftKey))
      if (wantsUndo || wantsRedo) {
        if (isTextEditing) return
        e.preventDefault()
        e.stopPropagation()
        if (latestGuideStepRef.current < 0) {
          if (wantsRedo) handleRedo()
          else handleUndo()
        }
        return
      }

      if ((e.ctrlKey || e.metaKey) && key === 'n') {
        e.preventDefault()
        if (e.shiftKey) createCategoryRef.current?.()
        else createPhraseRef.current?.()
        return
      }
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault()
        handleSavePhrase(undefined, true)
        return
      }
      if ((e.ctrlKey || e.metaKey) && key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
        return
      }

      // Ctrl+A 只有在批量模式或明确聚焦的列表中才接管全选行为。
      if ((e.ctrlKey || e.metaKey) && key === 'a') {
        const active = document.activeElement
        const selectionScope = active?.closest?.('[data-selection-scope]')?.dataset.selectionScope
        if (!isTextEditing && (batchMode || selectionScope)) {
          e.preventDefault()
          if (!batchMode) setBatchMode(true)
          if (selectionScope === 'phrases') {
            setSelectedPhraseIds(new Set(filteredPhrases.filter(item => !item.是否引导演示).map(item => item.编号)))
          } else if (selectionScope === 'groups') {
            setSelectedGroupIds(new Set(filteredGroups.filter(item => !item.是否引导演示).map(item => item.编号)))
          } else {
            handleSelectAll()
          }
          return
        }
      }

      // 悬停快捷键（F2、Delete、Ctrl+C、Ctrl+D）。
      if (!batchMode && !isAnyInputFocused()) { // 批量模式下 Delete 只执行批量删除
        const tag = document.activeElement.tagName
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA'
        if (!isInput) {
          // 处理分类悬停
          if (hoverCategoryId && !inlineEditCategoryId && !categoryContextMenu) {
            if (e.key === 'F2') {
              e.preventDefault()
              const category = categoriesById.get(hoverCategoryId)
              if (category) handleEditCategory(category)
            } else if (e.key === 'Delete') {
              e.preventDefault()
              const category = categoriesById.get(hoverCategoryId)
              if (category) handleDeleteCategory(category.编号)
            }
          }
          // 处理分组悬停
          if (hoverGroupId && !inlineEditGroupId) {
            if (e.key === 'F2') {
              e.preventDefault()
              const group = groupsById.get(hoverGroupId)
              if (group) handleEditGroup(group)
            } else if (e.key === 'Delete') {
              e.preventDefault()
              const group = groupsById.get(hoverGroupId)
              if (group) handleDeleteGroup(group.编号)
            }
          }
          // 处理常用语悬停
          if (hoverPhraseId) {
            if (e.key === 'F2') {
              e.preventDefault()
              requestPhraseSelection(hoverPhraseId)
            } else if (e.key === 'Delete') {
              e.preventDefault()
              handleDeletePhrase(hoverPhraseId)
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
              e.preventDefault()
              const p = phrasesById.get(hoverPhraseId)
              if (p) handleCopyPhrase(p)
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
              e.preventDefault()
              const p = phrasesById.get(hoverPhraseId)
              if (p) handleClonePhrase(p)
            }
          }
        }
      }

      // 批量模式：Delete 删除选中项
      if (batchMode && e.key === 'Delete' && !isAnyInputFocused()) {
        if (selectedPhraseIds.size > 0 || selectedGroupIds.size > 0) {
          e.preventDefault()
          handleBatchDelete()
        }
      }

      // F11 全屏编辑切换
      if (e.key === 'F11' && editPhrase) {
        e.preventDefault()
        setIsFullscreenEdit(prev => !prev)
      }

      // 可编辑控件（例如内联编辑器）自行处理 Escape，避免全局快捷键抢先响应。
      if (e.key === 'Escape' && !isTextEditing) {
        if (isFullscreenEdit) {
          e.preventDefault()
          e.stopPropagation()
          setIsFullscreenEdit(false)
          return
        } else if (editPhrase) {
          e.preventDefault()
          e.stopPropagation()
          handleExitEdit()
        } else if (batchMode) {
          e.preventDefault()
          setBatchMode(false)
          setSelectedPhraseIds(new Set())
          setSelectedGroupIds(new Set())
          setLastSelectedPhraseId(null)
          setLastSelectedGroupId(null)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown, true)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true)
  }, [
    batchMode, exitDialogOpen, helpOpen, settingsOpen, aiDialogOpen, importPreview, aiImportSource, createCollectionDialog,
    hoverCategoryId, hoverGroupId, hoverPhraseId,
    inlineEditCategoryId, inlineEditGroupId,
    categoriesById, groupsById, phrasesById, filteredGroups, filteredPhrases, categoryContextMenu,
    editPhrase, isFullscreenEdit, handleClonePhrase, handleDeletePhrase, handleCopyPhrase, handleExitEdit,
    requestPhraseSelection, handleSelectAll, handleSavePhrase, handleUndo, handleRedo
  ])

  // 记录打开设置时的初始状态，用于关闭时对比
  const settingsStartRef = useRef(null)

  useEffect(() => {
    if (settingsOpen) {
      setSettingsTab('general')
      settingsStartRef.current = normalizeSettings(settings)
    }
  }, [settingsOpen])

  const handleSettingsClose = useCallback(() => {
    setLanguageMenuAnchor(null)
    setInterfaceFontMenuAnchor(null)
    setContentFontMenuAnchor(null)
    setSettingsOpen(false)
    if (settingsStartRef.current) {
      const changes = []
      const map = {
        界面语言: t('settings.language'),
        界面字体: t('settings.interfaceFont'),
        内容字体: t('settings.contentFont'),
        主题模式: t('settings.themeMode'),
        启动时打开: t('settings.startupSelection'),
        卡片预览行数: t('settings.previewLinesLabel'),
        人工智能模型: t('settings.aiModel'),
        人工智能导入提示词: t('settings.aiImportPrompt'),
        人工智能归类提示词: t('settings.aiCategorizePrompt'),
        人工智能标题提示词: t('settings.aiTitlePrompt'),
        人工智能内容提示词: t('settings.aiContentPrompt')
      }
      Object.keys(map).forEach(key => {
        if (settings[key] !== settingsStartRef.current[key] && !changes.includes(map[key])) {
          changes.push(map[key])
        }
      })

      if (changes.length > 0) {
        triggerConfetti()
        showSnackbar(t('settings.updated', { items: changes.join(t('common.listSeparator')) }))
      }
    }
  }, [settings, showSnackbar])

  const handleBlankAreaClick = (e) => {
    if (e.target === e.currentTarget && editPhrase) {
      handleSavePhrase()
    }
  }

  // 数据未准备好时只显示加载遮罩和主题 Provider，确保 CSS 变量仍能正常注入。
  if (!isReady) {
    return (
      <ThemeProvider theme={ghibliTheme}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default',
          zIndex: 99999
        }} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={ghibliTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default', color: 'text.primary', transition: 'background-color 0.3s, color 0.3s' }}
        onMouseDown={() => {
          setGroupMenuAnchor(null)
          setGroupContextMenu(null)
          setPhraseContextMenu(null)
          setCategoryMenuAnchor(null)
          setCategoryContextMenu(null)
        }}
        onClick={handleBlankAreaClick}
      >
        {/* 左侧分组栏 */}
        <Box id="guide-col-groups" sx={{ width: '20%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'none', bgcolor: 'transparent', position: 'relative' }} onClick={handleBlankAreaClick}>
          {/* 顶部：新建按钮 */}
          <Box sx={{ p: 1, pt: '10px', height: 52, display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-start' }} onClick={handleBlankAreaClick}>
            <Tooltip title={t('tooltip.newGroup')} disableFocusListener disableInteractive>
              <IconButton
                disableFocusRipple
                size="small"
                aria-label={t('tooltip.newGroup')}
                onClick={handleCreateGroup}
                sx={{
                  ...createButtonSx,
                  width: '100%',
                  height: 32,
                  borderRadius: '8px',
                  justifyContent: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  color: 'text.primary',
                  bgcolor: 'rgba(143, 181, 149, 0.15)',
                  '&:hover:not(.Mui-disabled)': {
                    color: 'text.primary',
                    bgcolor: isDark ? 'rgba(143, 181, 149, 0.23)' : 'rgba(93, 124, 102, 0.12)'
                  }
                }}
              >
                <LibraryAddOutlinedIcon fontSize="small" sx={{ transform: 'translate(0.15px, -0.15px)' }} />
                <Typography component="span" variant="body2" sx={{ fontFamily: interfaceFontStack, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('defaults.newGroup')}
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
          <List
            ref={groupListRef}
            data-selection-scope="groups"
            tabIndex={0}
            aria-label={t('section.groups')}
            sx={{ flex: 1, overflow: 'auto', px: 1, minHeight: 0, display: 'flex', flexDirection: 'column', outline: 'none', '&:focus, &:focus-visible': { outline: 'none' } }}
            onScroll={handleGroupListScroll}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e)}
            onClick={handleBlankAreaClick}
          >
            {filteredGroups.length === 0 ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                <Typography sx={{ fontSize: 15 }}>{t('empty.noGroups')}</Typography>
              </Box>
            ) : filteredGroups.slice(0, visibleGroupCount).map((group, index) => {
              const isEditing = inlineEditGroupId === group.编号
              const lifecycleKey = cardAnimationKey('group', group.编号)
              const isEntering = enteringCardKeys.has(lifecycleKey)
              const isExiting = exitingCardKeys.has(lifecycleKey)
              return (
                <ListItem
                  key={group.编号}
                  disablePadding
                  data-drag-type="group"
                  data-drag-id={group.编号}
                  draggable={false}
                  onPointerDown={e => !isEditing && !isExiting && handlePointerDragStart(e, 'group', group.编号)}
                  onDragStart={e => !isEditing && handleDragStart(e, 'group', group.编号)}
                  onDragEnter={e => !isEditing && handleDragEnter(e)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={e => !isEditing && handleDrop(e, 'group', group.编号)}
                  onContextMenu={e => !isEditing && handleGroupContextMenu(e, group)}
                  onMouseEnter={() => setHoverGroupId(group.编号)}
                  onMouseLeave={() => setHoverGroupId(null)}
                  onFocusCapture={() => setFocusGroupId(group.编号)}
                  onBlurCapture={e => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setFocusGroupId(null)
                  }}
                  sx={{
                    mb: 0.5,
                    borderRadius: '8px', // 圆角
                    contentVisibility: isDragSessionActive || isEntering || isExiting ? 'visible' : 'auto',
                    containIntrinsicSize: '0 36px',
                    border: draggingPhraseId === group.编号
                      ? (index !== dragItem.current?.initialIndex
                        ? (isDark ? '2px dashed #8FB595' : '2px dashed #5D7C66')
                        : (isDark ? '2px dashed rgba(255,255,255,0.2)' : '2px dashed rgba(0,0,0,0.2)'))
                      : '2px solid transparent',
                    opacity: draggingPhraseId === group.编号 ? 0.8 : 1,
                    ...getCardLifecycleStyles({
                      animationName: 'phraseManagerGroupCard',
                      isEntering,
                      isExiting,
                      maxHeight: 64,
                      marginBottom: '4px'
                    })
                  }}
                >
                  <ListItemButton
                    selected={batchMode ? selectedGroupIds.has(group.编号) : selectedGroupId === group.编号}
                    disableRipple={draggingPhraseId === group.编号} // 拖拽时禁用波纹
                    onKeyDown={(e) => {
                      if (e.key === 'F2') {
                        e.preventDefault()
                        if (!inlineEditGroupId) {
                          handleEditGroup(group)
                        }
                      }
                    }}
                    onClick={(e) => {
                      if (batchMode) {
                        toggleGroupSelection(e, group.编号)
                      } else {
                        setSelectedCategoryId(group.所属分类编号)
                        setSelectedGroupId(group.编号)
                      }
                    }}
                    onMouseMove={(e) => {
                      if (draggingPhraseId === group.编号) return // 拖拽时禁用光标跟随
                      schedulePointerVisual(e, 'highlight')
                    }}
                    onMouseLeave={(e) => {
                      resetPointerVisual(e, 'highlight')
                    }}
                    sx={{
                      py: 0.25,
                      px: 1,
                      pr: 3.5, // 只有按钮宽度
                      borderRadius: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      // 高光层
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(67, 52, 27, 0.05)'}, transparent 60%)`,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none',
                      },
                      '&:hover::before': {
                        opacity: draggingPhraseId === group.编号 ? 0 : 1, // 拖拽时禁用高光
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover:not(.Mui-disabled)': {
                        bgcolor: draggingPhraseId === group.编号 ? 'transparent' : 'rgba(143, 181, 149, 0.15)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(93, 124, 102, 0.15)',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        border: draggingPhraseId === group.编号 ? 'none' : '1px solid #8FB595',
                        boxShadow: '0 0 8px rgba(143, 181, 149, 0.4)',
                        '&:hover': { bgcolor: draggingPhraseId === group.编号 ? 'rgba(93, 124, 102, 0.15)' : 'rgba(143, 181, 149, 0.25)' }
                      },
                      ...(dragOverGroupId === group.编号 && {
                        bgcolor: 'rgba(93, 124, 102, 0.2)',
                        border: '2px dashed #5D7C66',
                        transform: 'scale(1.03)',
                        boxShadow: '0 0 12px rgba(93, 124, 102, 0.3)',
                        animation: 'pulse 0.8s ease-in-out infinite'
                      }),
                      '@keyframes pulse': {
                        '0%, 100%': { boxShadow: '0 0 8px rgba(93, 124, 102, 0.2)' },
                        '50%': { boxShadow: '0 0 16px rgba(93, 124, 102, 0.5)' }
                      },
                      '&:focus-within .item-menu-button': { opacity: 1, pointerEvents: 'auto' }
                    }}
                  >
                    {!batchMode && !isEditing && !isDragSessionActive && (
                      <IconButton
                        className="item-menu-button"
                        size="small"
                        aria-label={t('tooltip.more')}
                        tabIndex={hoverGroupId === group.编号 || focusGroupId === group.编号 ? 0 : -1}
                        onClick={(e) => { e.stopPropagation(); setGroupMenuAnchor(e.currentTarget); setMenuGroupId(group.编号) }}
                        sx={{
                          position: 'absolute',
                          right: 4,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 10,
                          p: 0.5,
                          opacity: hoverGroupId === group.编号 || focusGroupId === group.编号 ? 1 : 0,
                          pointerEvents: hoverGroupId === group.编号 || focusGroupId === group.编号 ? 'auto' : 'none',
                          '&:focus-visible': { opacity: 1, pointerEvents: 'auto' },
                          transition: 'opacity 0.15s, translate 140ms cubic-bezier(0.2, 0, 0, 1)'
                        }}
                      >
                        <MoreHorizIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                    {batchMode && (
                      <Checkbox
                        size="small"
                        checked={selectedGroupIds.has(group.编号)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': `checkbox-list-label-${group.编号}` }}
                        onClick={(e) => { e.stopPropagation(); toggleGroupSelection(e, group.编号) }}
                        sx={{ p: 0.5, mr: 1, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', '&.Mui-checked': { color: 'primary.main' } }}
                      />
                    )}

                    {inlineEditGroupId === group.编号 ? (
                      <Box
                        component="input"
                        ref={inlineEditInputRef}
                        autoFocus
                        value={inlineEditGroupName}
                        onChange={e => {
                          inlineGroupDraftRef.current = {
                            编号: inlineGroupDraftRef.current.编号 || group.编号,
                            名称: e.target.value
                          }
                          setInlineEditGroupName(e.target.value)
                          duplicateWarningShownRef.current = false // 用户修改时重置警告状态
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSaveInlineGroup()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            e.stopPropagation()
                            handleCancelInlineGroup()
                          }
                        }}
                        onBlur={handleSaveInlineGroup}
                        onClick={e => e.stopPropagation()}
                        sx={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          color: 'inherit',
                          font: 'inherit',
                          fontFamily: contentFontStack,
                          p: '4px 0',
                          '&::selection': { bgcolor: 'rgba(143, 181, 149, 0.4)', color: 'inherit' }
                        }}
                      />
                    ) : (
                      <ListItemText
                        primary={group.名称}
                        primaryTypographyProps={{ sx: { fontFamily: contentFontStack } }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          <Box id="guide-toolbar-bottom" sx={{ mt: 'auto', p: 0.5, display: 'flex', gap: 0.5 }} onClick={handleBlankAreaClick}>
            <Tooltip title={t('tooltip.settings')}>
              <IconButton size="small" aria-label={t('tooltip.settings')} onClick={() => setSettingsOpen(true)} sx={groupToolbarButtonSx}>
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('tooltip.help')}>
              <IconButton size="small" aria-label={t('tooltip.help')} onClick={() => setHelpOpen(true)} sx={groupToolbarButtonSx}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltip.import')}>
              <IconButton size="small" aria-label={t('tooltip.import')} onClick={handleImport} sx={groupToolbarButtonSx}>
                <FileDownloadOutlinedIcon className="toolbar-transfer-icon" sx={{ transform: 'rotate(-90deg)' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('tooltip.export')}>
              <IconButton size="small" aria-label={t('tooltip.export')} onClick={(e) => setExportMenuAnchor(e.currentTarget)} sx={groupToolbarButtonSx}>
                <FileUploadOutlinedIcon className="toolbar-transfer-icon" sx={{ transform: 'rotate(90deg)' }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 右侧分隔线 */}
          <Box sx={{
            position: 'absolute',
            right: 0,
            top: '58px',
            bottom: 0,
            width: '1px',
            backgroundImage: isDark
              ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 2px, transparent 2px)'
              : 'linear-gradient(to bottom, rgba(67, 52, 27, 0.15) 2px, transparent 2px)',
            backgroundSize: '1px 7px',
            backgroundRepeat: 'repeat-y',
            display: isGroupListOverflowing ? 'none' : 'block'
          }} />
        </Box>

        {/* 中间常用语卡片 */}
        <Box id="guide-col-phrases" sx={{ width: '40%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'none', bgcolor: 'transparent', position: 'relative' }} onClick={handleBlankAreaClick}>
          {/* 顶部：搜索栏和排序按钮 */}
          <Box id="guide-toolbar-search" sx={{ p: 1, pt: '10px', display: 'flex', gap: 0.5, alignItems: 'center', position: 'relative' }} onClick={handleBlankAreaClick}>
            {!batchMode ? (
              <>
                <Tooltip title={t('tooltip.newPhrase')} disableFocusListener disableInteractive>
                  <IconButton
                    disableFocusRipple
                    size="small"
                    aria-label={t('tooltip.newPhrase')}
                    onClick={handleCreatePhrase}
                    sx={{
                      ...createButtonSx,
                      mr: 0.5,
                      bgcolor: 'rgba(143, 181, 149, 0.15)',
                      '&:hover:not(.Mui-disabled)': {
                        color: isDark ? 'rgba(255, 255, 255, 0.86)' : 'rgba(67, 52, 27, 0.82)',
                        bgcolor: isDark ? 'rgba(143, 181, 149, 0.23)' : 'rgba(93, 124, 102, 0.12)'
                      }
                    }}
                  >
                    <NoteAddOutlinedIcon fontSize="small" sx={{ transform: 'translate(0.1px, -0.4px)' }} />
                  </IconButton>
                </Tooltip>
                <TextField
                  inputRef={searchInputRef}
                  placeholder={t('placeholder.searchPhrase')}
                  size="small"
                  fullWidth
                  value={searchText}
                  onChange={e => {
                    setSearchText(e.target.value)
                    if (!searchFocused) setSearchFocused(true)
                  }}
                  onClick={() => setSearchFocused(true)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    // 失焦时关闭搜索结果。下拉项通过 onMouseDown 阻止焦点转移，
                    // 因此点击下拉项不会提前触发关闭；按 Tab 或点击外部则由 onBlur 关闭。
                    setSearchFocused(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      e.stopPropagation()
                      setSearchFocused(false)
                      e.target.blur()
                    }
                  }}
                  InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 0.5 }} /> }}
                  sx={{
                    flex: 1,
                    '& .MuiInputBase-root': {
                      height: '34px',
                      minHeight: '34px'
                    }
                  }}
                />
                <Tooltip title={t('tooltip.sort')}>
                  <IconButton
                    size="small"
                    aria-label={t('tooltip.sort')}
                    onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                    sx={{ borderRadius: 1, color: 'text.secondary', p: 0.25 }}
                  >
                    <SortIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('tooltip.batchMode')}>
                  <IconButton
                    size="small"
                    aria-label={t('tooltip.batchMode')}
                    onClick={toggleBatchMode}
                    sx={{ borderRadius: 1, color: 'text.secondary', p: 0.25, ml: -0.5 }}
                  >
                    <CheckBoxOutlineBlankIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0, whiteSpace: 'normal' }}>
                  {t('count.batchSelected', { groups: selectedGroupIds.size, phrases: selectedPhraseIds.size })}
                </Typography>
                <Tooltip title={t('tooltip.selectAll')}>
                  <IconButton size="small" aria-label={t('tooltip.selectAll')} onClick={handleSelectAll}>
                    <SelectAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* 仅选中常用语且未选中分组时，允许“移动到分组”操作 */}
                {selectedPhraseIds.size > 0 && selectedGroupIds.size === 0 ? (
                  <Tooltip title={t('tooltip.moveToGroup')}>
                    <IconButton
                      size="small"
                      aria-label={t('tooltip.moveToGroup')}
                      onClick={(e) => setBatchMoveAnchor(e.currentTarget)}
                    >
                      <DriveFileMoveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton size="small" aria-label={t('tooltip.moveToGroup')} disabled>
                    <DriveFileMoveIcon fontSize="small" />
                  </IconButton>
                )}

                {/* 只要有任意选中项，即可导出 */}
                {selectedPhraseIds.size > 0 || selectedGroupIds.size > 0 ? (
                  <Tooltip title={t('tooltip.export')}>
                    <IconButton size="small" aria-label={t('tooltip.export')} onClick={handleBatchExport}>
                      <FileUploadOutlinedIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton size="small" aria-label={t('tooltip.export')} disabled>
                    <FileUploadOutlinedIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
                  </IconButton>
                )}

                {/* 只要有任意选中项，且为自定义排序模式，即可置顶/置底 */}
                {(selectedPhraseIds.size > 0 || selectedGroupIds.size > 0) && sortBy === 'custom' ? (
                  <Tooltip title={t('tooltip.moveToTop')}>
                    <IconButton size="small" aria-label={t('tooltip.moveToTop')} onClick={handleBatchMoveToTop}>
                      <VerticalAlignTopIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton size="small" aria-label={t('tooltip.moveToTop')} disabled>
                    <VerticalAlignTopIcon fontSize="small" />
                  </IconButton>
                )}

                {(selectedPhraseIds.size > 0 || selectedGroupIds.size > 0) && sortBy === 'custom' ? (
                  <Tooltip title={t('tooltip.moveToBottom')}>
                    <IconButton size="small" aria-label={t('tooltip.moveToBottom')} onClick={handleBatchMoveToBottom}>
                      <VerticalAlignBottomIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton size="small" aria-label={t('tooltip.moveToBottom')} disabled>
                    <VerticalAlignBottomIcon fontSize="small" />
                  </IconButton>
                )}

                {selectedPhraseIds.size > 0 || selectedGroupIds.size > 0 ? (
                  <Tooltip title={t('tooltip.delete')}>
                    <IconButton
                      size="small"
                      aria-label={t('tooltip.delete')}
                      onClick={handleBatchDelete}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton size="small" aria-label={t('tooltip.delete')} disabled>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                <Tooltip title={t('tooltip.exit')}>
                  <IconButton size="small" aria-label={t('tooltip.exit')} onClick={toggleBatchMode}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {/* 搜索下拉结果 */}
            <Box sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300 }}>
              <Collapse in={searchFocused} timeout={250}>
                <Paper
                  onMouseDown={(e) => e.preventDefault()}
                  sx={{
                    mt: 1,
                    maxHeight: 300,
                    overflow: 'auto',
                    bgcolor: isDark ? 'rgba(47, 49, 54, 0.85)' : 'rgba(255, 255, 255, 0.85)', // 玻璃拟态
                    backdropFilter: 'blur(16px) saturate(180%)', // 增强模糊和饱和度
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '16px',
                    p: 1,
                    boxShadow: isDark ? '0 16px 32px -4px rgba(0, 0, 0, 0.25)' : '0 16px 32px -4px rgba(67, 52, 27, 0.06)'
                  }}
                >
                  {(() => {
                    const searchLower = debouncedSearchText.toLowerCase()

                    // 空状态下显示分组标签
                    if (!searchLower.trim()) {
                      if (groups.length === 0) {
                        return <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }} onClick={() => editPhrase && handleSavePhrase()}><Typography variant="body2">{t('empty.noGroups')}</Typography></Box>
                      }
                      return (
                        <Box sx={{ p: 1.5, pb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', pl: 0.5, fontSize: '0.9rem', fontWeight: 500 }}>{t('empty.quickJump')}</Typography>
                          {quickJumpGroups.map(({ category: category, children }) => {
                            return (
                              <Box key={category.编号} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', pl: 0.5, fontSize: '0.85rem', fontWeight: 500, fontFamily: contentFontStack }}>
                                  {category.名称}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {children.map(group => (
                                    <Box
                                      key={group.编号}
                                      onClick={() => {
                                        setSelectedCategoryId(category.编号)
                                        setSelectedGroupId(group.编号)
                                        setSearchFocused(false)
                                      }}
                                      sx={{
                                         px: 1.5, py: 0.75,
                                         fontSize: '0.85rem',
                                         fontFamily: contentFontStack,
                                         borderRadius: '8px',
                                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(67, 52, 27, 0.1)',
                                        cursor: 'pointer',
                                        bgcolor: 'background.paper',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          bgcolor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.1)',
                                          borderColor: isDark ? '#8FB595' : '#5D7C66'
                                        }
                                      }}
                                    >
                                      {group.名称}
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )
                          })}
                        </Box>
                      )
                    }
                    const filtered = searchSuggestionPhrases

                    // 高亮函数
                    const highlightText = (text, maxLen = 50) => {
                      text = String(text || '')
                      const idx = text.toLowerCase().indexOf(searchLower)
                      if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? '...' : '')
                      const start = Math.max(0, idx - 10)
                      const end = Math.min(text.length, idx + searchLower.length + 40)
                      const before = text.slice(start, idx)
                      const match = text.slice(idx, idx + searchLower.length)
                      const after = text.slice(idx + searchLower.length, end)
                      return (
                        <>
                          {start > 0 && '...'}
                          {before}
                          <Box component="span" sx={{ bgcolor: '#f0b429', color: '#000', px: 0.25, borderRadius: 0.5 }}>{match}</Box>
                          {after}
                          {end < text.length && '...'}
                        </>
                      )
                    }

                    if (filtered.length === 0) {
                      return (
                        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                          <Typography variant="body2">{t('empty.noResults')}</Typography>
                        </Box>
                      )
                    }

                    return filtered.map((p, resultIndex) => (
                      <Box
                        key={p.编号}
                        onClick={() => {
                          // 1. 切换到对应的分类和分组
                          const group = groupsById.get(p.所属分组编号)
                          if (group?.所属分类编号) {
                            setSelectedCategoryId(group.所属分类编号)
                          }
                          setSelectedGroupId(p.所属分组编号)

                          // 2. 清空搜索，关闭搜索框
                          setSearchFocused(false)
                          setSearchText('')

                          // 3. 滚动到卡片位置并高亮（延迟执行以等待列表完成渲染）。
                          setTimeout(() => {
                            const el = document.getElementById(`phrase-${p.编号}`)
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              triggerFlip(p.编号)
                            }
                          }, 100)
                        }}
                        onMouseEnter={() => setHoverPhraseId(p.编号)}
                        onMouseLeave={() => setHoverPhraseId(null)}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          if (!p.内容?.trim()) {
                            showSnackbar(t('snackbar.contentEmpty'), 'warning')
                            return
                          }
                          handleCopyPhrase(p, { celebrate: false })
                        }}
                        sx={{
                          p: 1,
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          borderBottom: resultIndex < filtered.length - 1 ? '1px solid transparent' : 'none',
                          mb: 0.25,
                          '&:hover': { bgcolor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.1)' },
                          '&:last-child': { mb: 0 }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" noWrap sx={{ flex: 1, mr: 1, fontFamily: contentFontStack }}>{highlightText(p.标题, 100)}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', px: 0.75, py: 0.25, borderRadius: 1, fontFamily: contentFontStack }}>
                              {groupsById.get(p.所属分组编号)?.名称 || t('defaults.uncategorized')}
                            </Typography>
                            {(() => {
                              const group = groupsById.get(p.所属分组编号)
                              const category = categoriesById.get(group?.所属分类编号)
                              return category ? (
                                <Typography variant="caption" sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', px: 0.75, py: 0.25, borderRadius: 1, fontFamily: contentFontStack }}>
                                  {category.名称}
                                </Typography>
                              ) : null
                            })()}
                          </Box>
                        </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: contentFontStack }}>
                          {highlightText(p.内容, 60)}
                        </Typography>
                        {resultIndex < filtered.length - 1 && (
                          <BalancedDashedDivider
                            color={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(67, 52, 27, 0.1)'}
                          />
                        )}
                      </Box>
                    ))
                  })()}
                </Paper>
              </Collapse>
            </Box>
          </Box>
          {/* 排序菜单 */}
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={() => setSortMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: { sx: { p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' } },
              list: { sx: { p: 0 } }
            }}
            sx={{
              '& .MuiMenuItem-root': {
                borderRadius: 1,
                mb: 0.25,
                '&:last-child': { mb: 0 }
              }
            }}
          >
            <MenuItem onClick={() => handleSortChange('custom')} selected={sortBy === 'custom'}>{t('menu.sortCustom')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('usage-desc')} selected={sortBy === 'usage-desc'}>{t('menu.sortUsageDesc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('usage-asc')} selected={sortBy === 'usage-asc'}>{t('menu.sortUsageAsc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('created-desc')} selected={sortBy === 'created-desc'}>{t('menu.sortCreatedDesc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('created-asc')} selected={sortBy === 'created-asc'}>{t('menu.sortCreatedAsc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('updated-desc')} selected={sortBy === 'updated-desc'}>{t('menu.sortUpdatedDesc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('updated-asc')} selected={sortBy === 'updated-asc'}>{t('menu.sortUpdatedAsc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('title-asc')} selected={sortBy === 'title-asc'}>{t('menu.sortTitleAsc')}</MenuItem>
            <MenuItem onClick={() => handleSortChange('title-desc')} selected={sortBy === 'title-desc'}>{t('menu.sortTitleDesc')}</MenuItem>
          </Menu>
          {/* 导出格式菜单 */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            slotProps={{
              paper: { sx: { p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' } },
              list: { sx: { p: 0 } }
            }}
            sx={{
              '& .MuiMenuItem-root': {
                borderRadius: 1,
                mb: 0.25,
                '&:last-child': { mb: 0 }
              }
            }}
          >
            <MenuItem onClick={handleExport}>{t('menu.exportNative')}</MenuItem>
            <MenuItem onClick={handleExportIFlytek}>{t('menu.exportIflytek')}</MenuItem>
          </Menu>
          <Dialog
            open={Boolean(aiImportSource)}
            onClose={() => {
              if (aiImportLoading) return
              aiImportRequestIdRef.current++
              setAiImportSource(null)
              setAiImportError(null)
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon color="primary" />
              {t('ai.importTitle')}
            </DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('ai.importDirectFailed')}</Typography>
                <Typography variant="body2">{aiImportSource?.directError}</Typography>
              </Alert>
              <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                {t('ai.importFileSummary', {
                  file: aiImportSource?.fileName || '',
                  characters: (aiImportSource?.content?.length || 0).toLocaleString(actualLocale)
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('ai.currentModel', { model: settings.人工智能模型 || t('settings.defaultAiModel') })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {t('ai.importDescription')}
              </Typography>
              {aiImportError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">{aiImportError.message}</Typography>
                  {aiImportError.rawSummary && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.75, overflowWrap: 'anywhere' }}>
                      {t('ai.rawSummary', { summary: aiImportError.rawSummary })}
                    </Typography>
                  )}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  aiImportRequestIdRef.current++
                  setAiImportSource(null)
                  setAiImportError(null)
                }}
                disabled={aiImportLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleAiImportConversion}
                disabled={aiImportLoading}
                startIcon={aiImportLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
              >
                {aiImportLoading ? t('ai.importConverting') : aiImportError ? t('ai.retry') : t('ai.importConvert')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={Boolean(importPreview)}
            onClose={() => !importApplying && setImportPreview(null)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{t('importPreview.title')}</DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" sx={{ mb: 2, overflowWrap: 'anywhere' }}>
                {importPreview?.文件名} · {importPreview?.格式?.toUpperCase()}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1, mb: 2 }}>
                {[
                  ['分类', t('importPreview.categories')],
                  ['分组', t('importPreview.groups')],
                  ['常用语', t('importPreview.phrases')],
                  ['重复项', t('importPreview.duplicates')],
                  ['无效行', t('importPreview.invalidRows')]
                ].map(([key, label]) => (
                  <Box key={key} sx={{ textAlign: 'center', py: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{importPreview?.统计?.[key] ?? 0}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ mb: 1, fontWeight: 600 }}>{t('importPreview.strategy')}</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={importStrategy}
                onChange={(_, value) => value && setImportStrategy(value)}
                aria-label={t('importPreview.strategy')}
              >
                <ToggleButton value="merge">{t('importPreview.merge')}</ToggleButton>
                <ToggleButton value="copies">{t('importPreview.copies')}</ToggleButton>
                <ToggleButton value="overwrite">{t('importPreview.overwrite')}</ToggleButton>
              </ToggleButtonGroup>
              <Typography color={importStrategy === 'overwrite' ? 'error' : 'text.secondary'} sx={{ mt: 1.25, minHeight: 40 }}>
                {t(`importPreview.${importStrategy}Description`)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setImportPreview(null)} disabled={importApplying}>{t('common.cancel')}</Button>
              <Button
                variant="contained"
                color={importStrategy === 'overwrite' ? 'error' : 'primary'}
                onClick={handleApplyImport}
                disabled={importApplying}
              >
                {importApplying ? t('importPreview.applying') : t('importPreview.apply')}
              </Button>
            </DialogActions>
          </Dialog>
          <Box
            ref={phraseListRef}
            data-selection-scope="phrases"
            tabIndex={0}
            role="list"
            aria-label={t('section.phrases')}
            sx={{ flex: 1, overflow: 'auto', overflowAnchor: 'none', p: 1, minHeight: 0, display: 'flex', flexDirection: 'column', outline: 'none', '&:focus, &:focus-visible': { outline: 'none' } }}
            onScroll={handlePhraseListScroll}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e)}
            onClick={handleBlankAreaClick}
          >
            {filteredPhrases.slice(0, visibleCount).map((phrase, index) => {
              const lifecycleKey = cardAnimationKey('phrase', phrase.编号)
              const isEntering = enteringCardKeys.has(lifecycleKey)
              const isExiting = exitingCardKeys.has(lifecycleKey)
              const isPreviewed = isPreviewMode && previewPhraseId === phrase.编号
              return (
                <Card
                id={`phrase-${phrase.编号}`}
                key={phrase.编号}
                data-drag-type="phrase"
                data-drag-id={phrase.编号}
                role="button"
                tabIndex={isExiting ? -1 : 0}
                aria-disabled={isExiting || undefined}
                aria-label={t('accessibility.copyPhrase', { title: String(phrase.标题 || '') })}
                draggable={false}
                onPointerDown={e => sortBy === 'custom' && !isExiting && handlePointerDragStart(e, 'phrase', phrase.编号)}
                onDragStart={e => !isExiting && handleDragStart(e, 'phrase', phrase.编号)}
                onDragEnter={e => !isExiting && handleDragEnter(e)}
                onDragEnd={e => !isExiting && handleDragEnd(e)}
                onDragOver={e => !isExiting && handleDragOver(e)}
                onDrop={e => !isExiting && handleDrop(e)}
                onContextMenu={e => {
                  if (isExiting) {
                    e.preventDefault()
                    return
                  }
                  handlePhraseContextMenu(e, phrase)
                }}
                onWheel={(e) => {
                  if (isPreviewMode && previewPhraseId != null && previewScrollRef.current) {
                    previewScrollRef.current.scrollTop += e.deltaY * 0.5
                    e.stopPropagation()
                  }
                }}
                onMouseEnter={() => {
                  if (isExiting) return
                  hoverPhraseIdRef.current = phrase.编号
                  setHoverPhraseId(phrase.编号)
                  if (isPreviewMode && !previewKeyboardNavigationRef.current) {
                    setPreviewPhraseId(phrase.编号)
                  }
                }}
                onMouseMove={(e) => {
                  if (isExiting) return
                  if (isPreviewMode && previewKeyboardNavigationRef.current) {
                    const movementX = Number.isFinite(e.movementX) ? e.movementX : 0
                    const movementY = Number.isFinite(e.movementY) ? e.movementY : 0
                    if (movementX === 0 && movementY === 0) return
                    previewKeyboardNavigationRef.current = false
                    setPreviewPhraseId(phrase.编号)
                    return
                  }
                  if (flippingPhraseIds.has(phrase.编号)) return
                  if (draggingPhraseId === phrase.编号) return // 拖拽时禁用3D效果
                  if (isPreviewed) return
                  schedulePointerVisual(e, 'tilt')
                }}
                onMouseLeave={(e) => {
                  hoverPhraseIdRef.current = null
                  setHoverPhraseId(null)
                  if (flippingPhraseIds.has(phrase.编号)) return
                  resetPointerVisual(e, 'tilt')
                }}
                onClick={(e) => {
                  if (isExiting) return
                  if (batchMode) {
                    togglePhraseSelection(e, phrase.编号)
                  } else {
                    e.currentTarget.style.transform = '' // 清除倾斜效果，避免干扰动画
                    triggerFlip(phrase.编号)
                    handleCopyPhrase(phrase)
                  }
                }}
                onKeyDown={e => {
                  if (isExiting) return
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  if (batchMode) {
                    togglePhraseSelection(e, phrase.编号)
                  } else {
                    triggerFlip(phrase.编号)
                    handleCopyPhrase(phrase)
                  }
                }}
                sx={{
                  mb: 1,
                  outline: 'none',
                  '&:focus, &:focus-visible': { outline: 'none' },
                  cursor: isExiting ? 'default' : 'pointer',
                  contentVisibility: isDragSessionActive || isEntering || isExiting || isPreviewed ? 'visible' : 'auto',
                  containIntrinsicSize: '0 132px',
                  bgcolor: selectedPhraseIds.has(phrase.编号) ? (isDark ? 'rgba(143, 181, 149, 0.15)' : 'rgba(93, 124, 102, 0.15)') : (selectedPhraseId === phrase.编号 ? (isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.1)') : (isDark ? '#2d2e32' : 'background.paper')),
                  border: selectedPhraseIds.has(phrase.编号) ? (isDark ? '1px solid #8FB595' : '1px solid #5D7C66') : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(67, 52, 27, 0.05)'),
                  borderRadius: '12px',
                  boxShadow: (selectedPhraseIds.has(phrase.编号) || selectedPhraseId === phrase.编号)
                    ? (isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(67, 52, 27, 0.08)')
                    : 'none',
                  // 使用 transition 让卡片平滑回正；鼠标移动时暂时移除过渡，避免跟手操作产生延迟。
                  transition: isExiting ? 'none' : (hoverPhraseId === phrase.编号 ? 'box-shadow 0.1s, border 0.3s' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'), // 弹性回正
                  position: 'relative',
                  overflow: 'visible', // 保持可见以显示右上角按钮和标签；高亮边界由伪元素限制在卡片内部。
                  transformStyle: 'preserve-3d', // 为卡片翻转效果保留三维变换空间。

                  '@keyframes flip': {
                    '0%': { transform: 'perspective(1000px) rotateY(0)' },
                    '50%': { transform: 'perspective(1000px) rotateY(180deg)' },
                    '100%': { transform: 'perspective(1000px) rotateY(360deg)' }
                  },
                  ...getCardLifecycleStyles({
                    animationName: 'phraseManagerPhraseCard',
                    isEntering,
                    isExiting,
                    maxHeight: 96 + settings.卡片预览行数 * 24,
                    marginBottom: '8px',
                    idleAnimation: flippingPhraseIds.has(phrase.编号) && !isPreviewed
                      ? 'flip 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      : 'none'
                  }),

                  '&:hover': isPreviewed && !isExiting ? {
                    boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(67, 52, 27, 0.2)',
                    borderColor: isDark ? '#8FB595' : '#5D7C66',
                    zIndex: 100
                  } : isExiting ? {
                    boxShadow: (selectedPhraseIds.has(phrase.编号) || selectedPhraseId === phrase.编号)
                      ? (isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(67, 52, 27, 0.08)')
                      : 'none',
                    borderColor: selectedPhraseIds.has(phrase.编号)
                      ? (isDark ? '#8FB595' : '#5D7C66')
                      : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(67, 52, 27, 0.05)'),
                    zIndex: 'auto'
                  } : {
                    // 使用较小扩散范围和负扩散半径，让未选中卡片的阴影更紧致。
                    boxShadow: isDark ? '0 6px 16px -4px rgba(0,0,0,0.3)' : '0 6px 16px -4px rgba(67, 52, 27, 0.08)',
                    borderColor: draggingPhraseId === phrase.编号
                      ? (index !== dragItem.current?.initialIndex
                        ? (isDark ? '#8FB595' : '#5D7C66')
                        : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'))
                      : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(67, 52, 27, 0.15)'),
                    zIndex: 10,
                  },
                  ...(draggingPhraseId === phrase.编号 && {
                    opacity: 0.8,
                    transform: 'scale(0.95) rotate(-1deg)',
                    boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(67, 52, 27, 0.2)',
                    zIndex: 100,
                    border: index !== dragItem.current?.initialIndex
                      ? (isDark ? '2px dashed #8FB595' : '2px dashed #5D7C66')
                      : (isDark ? '2px dashed rgba(255,255,255,0.2)' : '2px dashed rgba(0,0,0,0.2)')
                  }),
                  ...(isPreviewed && !isExiting && {
                    animation: 'none',
                    opacity: 0.8,
                    transform: 'scale(0.95) rotate(-1deg)',
                    boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(67, 52, 27, 0.2)',
                    zIndex: 100,
                    border: isDark ? '2px dashed #8FB595' : '2px dashed #5D7C66'
                  })
                }}
              >
                {/* 左上角复制标识（圆角矩形） */}
                {copiedPhraseIds.has(phrase.编号) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 12,
                      height: 12,
                      bgcolor: '#f0b429',
                      borderTopLeftRadius: theme => theme.shape.borderRadius,
                      borderBottomRightRadius: 8,
                      zIndex: 1
                    }}
                  />
                )}
                {/* 右上角操作按钮 */}
                <Box sx={{ position: 'absolute', top: 6, right: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {hoverPhraseId === phrase.编号 && !isDragSessionActive && !isExiting && (
                    <>
                      <Tooltip title={t('tooltip.edit')}>
                        <IconButton
                          size="small"
                          aria-label={t('tooltip.edit')}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPhraseClick(phrase)
                          }}
                          sx={{ p: 0.25, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('tooltip.clone')}>
                        <IconButton
                          size="small"
                          aria-label={t('tooltip.clone')}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClonePhrase(phrase)
                          }}
                          sx={{ p: 0.25, color: 'text.secondary', '&:hover': { color: 'info.main' } }}
                        >
                          <PostAddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('tooltip.delete')}>
                        <IconButton
                          size="small"
                          aria-label={t('tooltip.delete')}
                          onClick={(e) => { e.stopPropagation(); handleDeletePhrase(phrase.编号) }}
                          sx={{ p: 0.25, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {/* 序号标签 */}
                  <Box sx={{
                    bgcolor: 'rgba(230, 180, 80, 0.2)',
                    color: '#E6B450',
                    px: 0.5,
                    borderRadius: '50%',
                    fontSize: 10,
                    fontWeight: 500,
                    minWidth: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {index + 1}
                  </Box>
                </Box>
                <CardContent sx={{ pt: 1, pb: 1.5, '&:last-child': { pb: 1.5 } }}>
                  {/* 元信息行：日期、字符数 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                      {phrase.创建时间 ? new Date(phrase.创建时间).toLocaleDateString(actualLocale, { month: 'numeric', day: 'numeric' }) : ''}
                      {phrase.创建时间 ? ' ' + new Date(phrase.创建时间).toLocaleTimeString(actualLocale, { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                      {t('count.characters', { count: String(phrase.内容 || '').length })}
                    </Typography>
                  </Box>
                  {/* 标题 */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, fontFamily: contentFontStack }} noWrap>{phrase.标题}</Typography>
                  {/* 内容预览 */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: settings.卡片预览行数,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '1rem',
                      lineHeight: 1.5,
                      mt: 0.5,
                      fontFamily: contentFontStack
                    }}
                  >
                    {phrase.内容}
                  </Typography>
                </CardContent>
                </Card>
              )
            })}
            {filteredPhrases.length === 0 && (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', pb: 3.95 }} onClick={() => editPhrase && handleSavePhrase()}>
                <Typography sx={{ fontSize: 15 }}>{t('empty.noPhrases')}</Typography>
              </Box>
            )}
          </Box>

          {/* 右侧分隔线 */}
          <Box sx={{
            position: 'absolute',
            right: 0,
            top: '58px',
            bottom: 0,
            width: '1px',
            backgroundImage: isDark
              ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 2px, transparent 2px)'
              : 'linear-gradient(to bottom, rgba(67, 52, 27, 0.15) 2px, transparent 2px)',
            backgroundSize: '1px 7px',
            backgroundRepeat: 'repeat-y',
            display: isPhraseListOverflowing ? 'none' : 'block'
          }} />
        </Box>

        {/* 右侧编辑区 */}
        <Box id="guide-col-categories" sx={{ width: '40%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'none', bgcolor: 'transparent', position: 'relative', zIndex: isPreviewMode ? 10010 : 'auto' }} onClick={handleBlankAreaClick}>
          <EmptyCategoryHandDrawnGuide
            active={categories.length === 0 && !editPhrase && !isPreviewMode}
            isDark={isDark}
            startRef={emptyCategoryGuideRef}
            endRef={newCategoryButtonRef}
          />
          {isPreviewMode && previewPhraseId != null ? (
            /* 预览模式：独占显示 */
            (() => {
              const p = phrasesById.get(previewPhraseId)
              if (!p) return null
              return (
                <Box
                  ref={previewScrollRef}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    animation: 'fadeIn 0.2s ease-out',
                    '@keyframes fadeIn': { from: { opacity: 0, transform: 'scale(0.98)' }, to: { opacity: 1, transform: 'scale(1)' } },
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary', fontSize: '1.1rem', fontFamily: contentFontStack }}>{p.内容}</Typography>
                </Box>
              )
            })()
          ) : editPhrase ? (
            <Box
              sx={{
                p: 2,
                pt: '10px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && editPhrase) {
                  handleSavePhrase(editPhrase)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  // 全屏模式下，ESC 仅退出全屏
                  if (isFullscreenEdit) {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsFullscreenEdit(false)
                    return
                  }
                  // 非全屏模式下，ESC 退出编辑
                  if (e.defaultPrevented) return
                  e.preventDefault()
                  e.stopPropagation()
                  handleExitEdit()
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 34,
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Tooltip title={t('ai.categorize')}>
                    <span>
                      <IconButton
                        size="small"
                        aria-label={t('ai.categorize')}
                        onClick={handleAiCategorizeEditPhrase}
                        disabled={aiCategorizeLoading || groups.length === 0}
                        sx={EDIT_TOOLBAR_BUTTON_SX}
                      >
                        <CategoryOutlinedIcon sx={{ fontSize: 17, stroke: 'currentColor', strokeWidth: 0.6, strokeLinejoin: 'round' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('ai.generateTitle')}>
                    <span>
                      <IconButton
                        size="small"
                        aria-label={t('ai.generateTitle')}
                        onClick={handleAiTitleEditPhrase}
                        disabled={aiTitleLoading}
                        sx={EDIT_TOOLBAR_BUTTON_SX}
                      >
                        {aiTitleLoading ? <CircularProgress size={16} /> : <TextFormatOutlinedIcon sx={{ fontSize: 24 }} />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('ai.generateContent')}>
                    <span>
                      <IconButton
                        size="small"
                        aria-label={t('ai.generateContent')}
                        onClick={() => {
                          setAiError(null)
                          setAiDialogOpen(true)
                        }}
                        disabled={aiContentLoading}
                        sx={EDIT_TOOLBAR_BUTTON_SX}
                      >
                        {aiContentLoading ? <CircularProgress size={16} /> : <ArticleOutlinedIcon sx={{ fontSize: 19, stroke: 'currentColor', strokeWidth: 0.5, strokeLinejoin: 'round' }} />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Tooltip title={isFullscreenEdit ? t('tooltip.exitFullscreen') : t('tooltip.fullscreen')}>
                    <IconButton
                      onClick={() => setIsFullscreenEdit(prev => !prev)}
                      size="small"
                      aria-label={isFullscreenEdit ? t('tooltip.exitFullscreen') : t('tooltip.fullscreen')}
                      sx={EDIT_TOOLBAR_BUTTON_SX}
                    >
                      {isFullscreenEdit ? <FullscreenExitIcon fontSize="medium" /> : <FullscreenIcon fontSize="medium" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('tooltip.exitEdit')}>
                    <IconButton
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleExitEdit()
                      }}
                      size="small"
                      aria-label={t('tooltip.exitEdit')}
                      sx={EDIT_TOOLBAR_BUTTON_SX}
                    >
                      <CloseIcon fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {aiError && aiError.operation !== 'content' && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={<Button color="inherit" size="small" onClick={handleAiRetry}>{t('ai.retry')}</Button>}
                >
                  <Typography variant="body2">{aiError.message}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {t('ai.currentModel', { model: settings.人工智能模型 || t('settings.defaultAiModel') })}
                  </Typography>
                  {aiError.rawSummary && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, overflowWrap: 'anywhere' }}>
                      {t('ai.rawSummary', { summary: aiError.rawSummary })}
                    </Typography>
                  )}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                        <InputLabel>{t('label.category')}</InputLabel>
                  <Select
                    value={(() => {
                      const group = groupsById.get(editPhrase.所属分组编号)
                      return group?.所属分类编号 || ''
                    })()}
                    label={t('label.category')}
                    sx={{ '& .MuiSelect-select': { py: 0.5, fontFamily: contentFontStack } }}
                    onChange={e => {
                      if (e.target.value === '__new__') {
                        openCreateCollectionDialog('category')
                      } else {
                        const firstGroup = (groupsByCategory.get(e.target.value) || [])[0]
                        if (firstGroup) {
                          applyEditPhraseChange({ 所属分组编号: firstGroup.编号 })
                        } else {
                          openCreateCollectionDialog('group', e.target.value)
                        }
                      }
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: { sx: { p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' } },
                        list: { sx: { p: 0 } }
                      },
                      sx: {
                        '& .MuiMenuItem-root': {
                          borderRadius: 1,
                          mb: 0.25,
                          '&:last-child': { mb: 0 }
                        }
                      }
                    }}
                  >
                    {categories.map(category => (
                      <MenuItem key={category.编号} value={category.编号} sx={{ fontFamily: contentFontStack }}>{category.名称}</MenuItem>
                    ))}
                    <MenuItem value="__new__" sx={{ borderTop: '1px solid #4a4b4e', color: 'primary.main' }}>
                        <AddIcon sx={{ mr: 0.5, fontSize: 18 }} /> {t('menu.newCategory')}
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel>{t('label.group')}</InputLabel>
                  <Select
                    value={editPhrase.所属分组编号 || ''}
                    label={t('label.group')}
                    sx={{ '& .MuiSelect-select': { py: 0.5, fontFamily: contentFontStack } }}
                    onChange={e => {
                      if (e.target.value === '__new__') {
                        openCreateCollectionDialog('group')
                      } else {
                        applyEditPhraseChange({ 所属分组编号: e.target.value })
                      }
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: { sx: { p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' } },
                        list: { sx: { p: 0 } }
                      },
                      sx: {
                        '& .MuiMenuItem-root': {
                          borderRadius: 1,
                          mb: 0.25,
                          '&:last-child': { mb: 0 }
                        }
                      }
                    }}
                  >
                    {(groupsByCategory.get(groupsById.get(editPhrase.所属分组编号)?.所属分类编号) || []).map(group => (
                      <MenuItem key={group.编号} value={group.编号} sx={{ fontFamily: contentFontStack }}>{group.名称}</MenuItem>
                    ))}
                    <MenuItem value="__new__" sx={{ borderTop: '1px solid #4a4b4e', color: 'primary.main' }}>
                        <AddIcon sx={{ mr: 0.5, fontSize: 18 }} /> {t('menu.newGroup')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                label={t('label.title')}
                fullWidth
                size="small"
                value={editPhrase.标题}
                onChange={e => updateEditPhraseDraft({ 标题: e.target.value })}
                sx={{ mb: 2, '& .MuiInputBase-input': { fontFamily: contentFontStack } }}
              />
              <TextField
                inputRef={contentInputRef}
                label={t('label.content')}
                multiline
                fullWidth
                minRows={10}
                maxRows={Infinity}
                value={editPhrase.内容}
                onChange={e => updateEditPhraseDraft({ 内容: e.target.value })}
                sx={{
                  flex: 1,
                  mb: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  '& .MuiInputBase-root': { flex: 1, alignItems: 'flex-start', pr: 0.5 },
                  '& .MuiInputBase-input': { height: '100% !important', overflow: 'auto !important', mr: 0.5, cursor: 'auto', fontFamily: contentFontStack },
                  ...(isFullscreenEdit && {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    width: '100vw',
                    height: '100vh',
                    m: 0,
                    pt: 3,
                    pb: 3,
                    pl: 3,
                    pr: 3,
                    bgcolor: isDark ? '#2b2b2b' : '#FDFBF7',
                    '& .MuiInputBase-root': {
                      height: '100%',
                    },
                    '& .MuiInputLabel-root': {
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontSize: '1rem',
                      zIndex: 1,
                      top: '24px',
                      left: '24px',
                      '&.Mui-focused': {
                        color: isDark ? '#8FB595' : '#5D7C66'
                      }
                    }
                  })
                }}
              />
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 1, pt: '10px' }} onClick={handleBlankAreaClick}>
              {/* 分类列表 */}
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, minHeight: '34px' }}>
                <Tooltip title={t('tooltip.newCategory')} disableInteractive>
                  <IconButton
                    ref={newCategoryButtonRef}
                    size="small"
                    aria-label={t('tooltip.newCategory')}
                    onClick={handleCreateCategory}
                    sx={{
                      ...createButtonSx,
                      bgcolor: 'rgba(143, 181, 149, 0.15)',
                      '&:hover:not(.Mui-disabled)': {
                        color: isDark ? 'rgba(255, 255, 255, 0.86)' : 'rgba(67, 52, 27, 0.82)',
                        bgcolor: isDark ? 'rgba(143, 181, 149, 0.23)' : 'rgba(93, 124, 102, 0.12)'
                      }
                    }}
                  >
                    <CreateNewFolderOutlinedIcon fontSize="small" sx={{ transform: 'translate(-0.15px, -0.4px)' }} />
                  </IconButton>
                </Tooltip>
                <Typography variant="body1" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: 'text.primary', fontSize: '1.125rem', fontWeight: 500, textAlign: 'center' }}>{t('section.categories')}</Typography>
              </Box>
              <List
                ref={categoryListRef}
                data-selection-scope="categories"
                tabIndex={0}
                aria-label={t('section.categories')}
                sx={{ flex: 1, overflow: 'auto', px: 0.5, minHeight: 0, display: 'flex', flexDirection: 'column', outline: 'none', '&:focus, &:focus-visible': { outline: 'none' } }}
                onScroll={handleCategoryListScroll}
                onDragOver={handleDragOver}
              >
                {categories.length === 0 ? (
                  <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#8FB595' : '#5D7C66', pb: 3 }}>
                    <Typography
                      ref={emptyCategoryGuideRef}
                      component="span"
                      sx={{
                        display: 'inline-block',
                        zIndex: 1,
                        px: 2.5,
                        py: 1.25,
                        color: 'inherit',
                        fontSize: 15,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {t('empty.noCategories')}
                    </Typography>
                  </Box>
                ) : (
                  categories.slice(0, visibleCategoryCount).map((category, index) => {
                    const isEditing = inlineEditCategoryId === category.编号
                    const lifecycleKey = cardAnimationKey('category', category.编号)
                    const isEntering = enteringCardKeys.has(lifecycleKey)
                    const isExiting = exitingCardKeys.has(lifecycleKey)
                    return (
                      <ListItem
                        key={category.编号}
                        disablePadding
                        data-drag-type="category"
                        data-drag-id={category.编号}
                        onFocusCapture={() => setFocusCategoryId(category.编号)}
                        onBlurCapture={e => {
                          if (!e.currentTarget.contains(e.relatedTarget)) setFocusCategoryId(null)
                        }}
                        onContextMenu={(e) => {
                          if (!isEditing) {
                            e.preventDefault()
                            e.stopPropagation()
                            setCategoryContextMenu({
                              mouseX: e.clientX + 2,
                              mouseY: e.clientY - 6,
                              category: category
                            })
                          }
                        }}
                        onMouseEnter={() => setHoverCategoryId(category.编号)}
                        onMouseLeave={() => setHoverCategoryId(null)}
                        draggable={false}
                        onPointerDown={(e) => !isEditing && !isExiting && handlePointerDragStart(e, 'category', category.编号)}
                        onDragStart={(e) => handleDragStart(e, 'category', category.编号)}
                        onDragEnd={handleDragEnd}
                        sx={{
                          mb: 0.5,
                          borderRadius: '8px', // 圆角
                          contentVisibility: isDragSessionActive || isEntering || isExiting ? 'visible' : 'auto',
                          containIntrinsicSize: '0 36px',
                          // 拖拽悬停时显示虚线边框预览。
                          border: draggingPhraseId === category.编号
                            ? (index !== dragItem.current?.initialIndex
                              ? (isDark ? '2px dashed #8FB595' : '2px dashed #5D7C66') // 位置改变：绿色
                              : (isDark ? '2px dashed rgba(255,255,255,0.2)' : '2px dashed rgba(0,0,0,0.2)')) // 位置不变：灰色
                            : '2px solid transparent',
                          opacity: draggingPhraseId === category.编号 ? 0.8 : 1,
                          ...getCardLifecycleStyles({
                            animationName: 'phraseManagerGroupCard',
                            isEntering,
                            isExiting,
                            maxHeight: 80,
                            marginBottom: '4px'
                          })
                        }}
                        onDragOver={(e) => {
                          handleDragOver(e) // 触发滚动检查
                          handleDragEnter(e) // 触发排序检查
                        }}
                        onDrop={(e) => {
                          // 批量模式下拖拽到分类
                          if (batchMode && (selectedGroupIds.size > 0 || selectedPhraseIds.size > 0)) {
                            e.preventDefault()
                            e.stopPropagation()
                            handleBatchDragToCategory(category.编号)
                            return
                          }
                          handleDrop(e, 'category', category.编号)
                        }}
                      >
                        <ListItemButton
                          selected={selectedCategoryId === category.编号}
                          disableRipple={draggingPhraseId === category.编号} // 拖拽时禁用波纹
                          onClick={() => {
                            if (!isEditing) {
                              const firstChild = [...latestCollectionsRef.current.分组]
                                .filter(group => group.所属分类编号 === category.编号 && !group.是否新建)
                                .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))[0]
                              setSelectedCategoryId(category.编号)
                              setSelectedGroupId(firstChild?.编号 || null)
                              // 切换分类时清空批量选择
                              setSelectedPhraseIds(new Set())
                              setSelectedGroupIds(new Set())
                            }
                          }}
                          onMouseMove={(e) => {
                            if (draggingPhraseId === category.编号) return // 拖拽时禁用光标跟随
                            schedulePointerVisual(e, 'highlight')
                          }}
                          onMouseLeave={(e) => {
                            resetPointerVisual(e, 'highlight')
                          }}
                          sx={{
                            borderRadius: '8px',
                            pr: 3.5, // 只有按钮宽度，极小间距
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(67, 52, 27, 0.05)'}, transparent 60%)`,
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              pointerEvents: 'none',
                              zIndex: 1
                            },
                            '&:hover::before': {
                              opacity: draggingPhraseId === category.编号 ? 0 : 1, // 拖拽时禁用高光
                            },
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              bgcolor: draggingPhraseId === category.编号 ? 'transparent' : 'rgba(143, 181, 149, 0.15)' // 拖拽时禁用悬停背景。
                            },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(93, 124, 102, 0.15)',
                              color: 'primary.main',
                              fontWeight: 'bold',
                              '&:hover': { bgcolor: draggingPhraseId === category.编号 ? 'rgba(93, 124, 102, 0.15)' : 'rgba(143, 181, 149, 0.25)' }
                            },
                            '&:focus-within .item-menu-button': { opacity: 1, pointerEvents: 'auto' }
                          }}
                        >
                          {/* 移入内部的菜单按钮 */}
                          {!isEditing && !isDragSessionActive && (
                            <IconButton
                              className="item-menu-button"
                              size="small"
                              aria-label={t('tooltip.more')}
                              tabIndex={hoverCategoryId === category.编号 || focusCategoryId === category.编号 ? 0 : -1}
                              onClick={(e) => {
                                e.stopPropagation()
                                setCategoryMenuAnchor(e.currentTarget)
                                setMenuCategoryId(category.编号)
                              }}
                              sx={{
                                position: 'absolute',
                                right: 4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                p: 0.5,
                                opacity: hoverCategoryId === category.编号 || focusCategoryId === category.编号 ? 1 : 0,
                                pointerEvents: hoverCategoryId === category.编号 || focusCategoryId === category.编号 ? 'auto' : 'none',
                                '&:focus-visible': { opacity: 1, pointerEvents: 'auto' },
                                transition: 'opacity 0.15s, translate 140ms cubic-bezier(0.2, 0, 0, 1)'
                              }}
                            >
                              <MoreHorizIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          )}

                          {isEditing ? (
                            <Box
                              component="input"
                              ref={inlineEditCategoryInputRef}
                              autoFocus
                              value={inlineEditCategoryName}
                              onChange={e => {
                                inlineCategoryDraftRef.current = {
                                  编号: inlineCategoryDraftRef.current.编号 || category.编号,
                                  名称: e.target.value
                                }
                                setInlineEditCategoryName(e.target.value)
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleSaveInlineCategory()
                                } else if (e.key === 'Escape') {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleCancelInlineCategory()
                                }
                              }}
                              onBlur={handleSaveInlineCategory}
                              onClick={e => e.stopPropagation()}
                              sx={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                 color: 'inherit',
                                 font: 'inherit',
                                 fontFamily: contentFontStack,
                                 p: '4px 0',
                                '&::selection': { bgcolor: 'rgba(143, 181, 149, 0.4)', color: 'inherit' },
                                zIndex: 2, position: 'relative'
                              }}
                            />
                          ) : (
                            <ListItemText
                              primary={category.名称}
                              primaryTypographyProps={{ sx: { zIndex: 2, position: 'relative', fontFamily: contentFontStack } }}
                              secondary={t('count.groups', { count: (groupsByCategory.get(category.编号) || []).length })}
                              secondaryTypographyProps={{ sx: { zIndex: 2, position: 'relative', fontSize: '0.8125rem' } }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    )
                  })
                )}
              </List>
            </Box>
          )}
        </Box>


        {/* 从编辑区创建分类或分组时，先让用户确认名称。 */}
        <GhibliDialog
          open={Boolean(createCollectionDialog)}
          onClose={() => {
            pendingCollectionCreationRef.current = null
            setCreateCollectionDialog(null)
          }}
          isDark={isDark}
          title={createCollectionDialog?.type === 'category' ? t('menu.newCategory') : t('menu.newGroup')}
          icon={createCollectionDialog?.type === 'category' ? CategoryOutlinedIcon : CreateNewFolderOutlinedIcon}
          content={createCollectionDialog && (
            <Box
              component="form"
              id="create-collection-form"
              onSubmit={e => {
                e.preventDefault()
                handleCreateCollectionDialogSubmit()
              }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              {createCollectionDialog.type === 'category' && (
                <TextField
                  autoFocus
                  required
                  fullWidth
                  size="small"
                  label={t('label.category')}
                  value={createCollectionDialog.categoryName}
                  onChange={e => setCreateCollectionDialog(previous => ({ ...previous, categoryName: e.target.value }))}
                  sx={{ '& .MuiInputBase-input': { fontFamily: contentFontStack } }}
                />
              )}
              <TextField
                autoFocus={createCollectionDialog.type !== 'category'}
                required
                fullWidth
                size="small"
                label={t('label.group')}
                value={createCollectionDialog.groupName}
                onChange={e => setCreateCollectionDialog(previous => ({ ...previous, groupName: e.target.value }))}
                sx={{ '& .MuiInputBase-input': { fontFamily: contentFontStack } }}
              />
            </Box>
          )}
          actions={
            <>
              <Button
                onClick={() => {
                  pendingCollectionCreationRef.current = null
                  setCreateCollectionDialog(null)
                }}
                disableRipple
                size="small"
                sx={{ minWidth: 'auto', color: 'text.secondary', borderRadius: 2 }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                form="create-collection-form"
                variant="contained"
                disabled={!String(createCollectionDialog?.groupName || '').trim() || (
                  createCollectionDialog?.type === 'category' && !String(createCollectionDialog?.categoryName || '').trim()
                )}
                disableRipple
                size="small"
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  minWidth: 80,
                  bgcolor: isDark ? '#4a6651' : '#5D7C66',
                  color: '#fff',
                  '&:hover:not(.Mui-disabled)': { bgcolor: isDark ? '#55755d' : '#668970' }
                }}
              >
                {t('common.apply')}
              </Button>
            </>
          }
        />

        {/* 退出编辑确认弹窗 */}
        <GhibliDialog
          open={exitDialogOpen}
          onClose={() => {
            setExitDialogOpen(false)
            pendingPhraseSelectionRef.current = null
            pendingPhraseCreationRef.current = null
            isExitingRef.current = false
          }}
          isDark={isDark}
          title={t('dialog.unsavedChanges')}
          icon={HelpOutlineIcon}
          content={
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 220, fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t('dialog.unsavedContent')}<br />{t('dialog.unsavedContentNote')}
            </Typography>
          }
          actions={
            <>
              <Button
                onClick={() => handleConfirmExit(false)}
                disableRipple
                size="small"
                sx={{
                  color: 'error.main',
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  bgcolor: 'transparent',
                  padding: '6px 12px',
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover:not(.Mui-disabled)': {
                    bgcolor: isDark ? 'rgba(229, 115, 115, 0.12)' : 'rgba(204, 122, 111, 0.09)',
                    color: 'error.main',
                    boxShadow: 'none'
                  }
                }}
              >
                {t('dialog.discard')}
              </Button>
              <Button
                onClick={() => {
                  setExitDialogOpen(false)
                  pendingPhraseSelectionRef.current = null
                  pendingPhraseCreationRef.current = null
                  isExitingRef.current = false
                }}
                disableRipple
                size="small"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  minWidth: 'auto',
                  bgcolor: 'transparent',
                  padding: '6px 12px',
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover:not(.Mui-disabled)': {
                    bgcolor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.07)',
                    color: 'text.primary',
                    boxShadow: 'none'
                  }
                }}
              >
                {t('dialog.thinkAgain')}
              </Button>
              <Button
                onClick={() => handleConfirmExit(true)}
                variant="contained"
                autoFocus
                disableRipple
                disableFocusRipple
                size="small"
                sx={{
                  borderRadius: 2, // 与其他操作按钮保持一致的圆角。
                  px: 2.5,
                  minWidth: 80,
                  boxShadow: isDark ? '0 2px 5px rgba(0, 0, 0, 0.24)' : '0 2px 5px rgba(67, 52, 27, 0.14)',
                  bgcolor: isDark ? '#4a6651' : '#5D7C66',
                  color: '#fff',
                  '&:hover:not(.Mui-disabled)': {
                    boxShadow: isDark ? '0 4px 10px rgba(0, 0, 0, 0.3)' : '0 4px 10px rgba(67, 52, 27, 0.18)',
                    bgcolor: isDark ? '#55755d' : '#668970'
                  },
                  '&:focus': { boxShadow: 'none', outline: 'none' }
                }}
              >
                {t('dialog.save')}
              </Button>
            </>
          }
        />

        {/* 批量移动分组菜单 */}
        <Menu
          anchorEl={batchMoveAnchor}
          open={Boolean(batchMoveAnchor)}
          onClose={() => setBatchMoveAnchor(null)}
          slotProps={{
            paper: { sx: { minWidth: 120, p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' } },
            list: { sx: { p: 0 } }
          }}
          sx={{
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mb: 0.25,
              '&:last-child': { mb: 0 }
            }
          }}
        >
          {groups.map(group => (
            <MenuItem
              key={group.编号}
              onClick={() => handleBatchMove(group.编号)}
              sx={{ py: 0.75, px: 1.5, fontSize: 13, fontFamily: contentFontStack }}
            >
              {group.名称}
            </MenuItem>
          ))}
        </Menu>

        {/* 分类右键菜单 */}
        <Menu
          key="group-context-menu"
          open={Boolean(categoryContextMenu)}
          onClose={() => setCategoryContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={categoryContextMenu ? { top: categoryContextMenu.mouseY, left: categoryContextMenu.mouseX } : undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            root: { sx: { pointerEvents: 'none' } },
            paper: {
              onMouseDown: (e) => e.stopPropagation(),
              sx: { pointerEvents: 'auto', minWidth: 80, p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' }
            },
            list: { sx: { p: 0 } }
          }}
          sx={{
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mb: 0.25,
              '&:last-child': { mb: 0 }
            }
          }}
        >
          <MenuItem
            onClick={() => {
              handleEditCategory(categoryContextMenu.category)
              setCategoryContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <EditIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.rename')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMoveCategoryToTop(categoryContextMenu.category.编号)
              setCategoryContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignTopIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToTop')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMoveCategoryToBottom(categoryContextMenu.category.编号)
              setCategoryContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignBottomIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToBottom')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteCategory(categoryContextMenu.category.编号)
              setCategoryContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13, color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.delete')}
          </MenuItem>
        </Menu>

        {/* 分类更多菜单 */}
        <Menu
          key="group-more-menu"
          anchorEl={categoryMenuAnchor}
          open={Boolean(categoryMenuAnchor)}
          onClose={() => setCategoryMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              onMouseDown: (e) => e.stopPropagation(),
              sx: { pointerEvents: 'auto', minWidth: 80, p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' }
            },
            list: { sx: { p: 0 } }
          }}
          sx={{
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mb: 0.25,
              '&:last-child': { mb: 0 }
            }
          }}
        >
          <MenuItem
            onClick={() => {
              const category = categoriesById.get(menuCategoryId)
              if (category) handleEditCategory(category)
              setCategoryMenuAnchor(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <EditIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.rename')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMoveCategoryToTop(menuCategoryId)
              setCategoryMenuAnchor(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignTopIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToTop')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMoveCategoryToBottom(menuCategoryId)
              setCategoryMenuAnchor(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignBottomIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToBottom')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteCategory(menuCategoryId)
              setCategoryMenuAnchor(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13, color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.delete')}
          </MenuItem>
        </Menu>

        {/* 分组操作菜单（支持按钮点击和右键） */}
        <Menu
          key="category-menu"
          anchorEl={groupMenuAnchor}
          open={Boolean(groupMenuAnchor) || groupContextMenu !== null}
          onClose={() => { setGroupMenuAnchor(null); setGroupContextMenu(null) }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          anchorReference={groupContextMenu !== null ? "anchorPosition" : "anchorEl"}
          anchorPosition={
            groupContextMenu !== null
              ? { top: groupContextMenu.mouseY, left: groupContextMenu.mouseX }
              : undefined
          }
          slotProps={{
            root: { sx: { pointerEvents: 'none' } },
            paper: {
              onMouseDown: (e) => e.stopPropagation(),
              sx: { pointerEvents: 'auto', minWidth: 80, p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' }
            },
            list: { sx: { p: 0 } }
          }}
          sx={{
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mb: 0.25,
              '&:last-child': { mb: 0 }
            }
          }}
        >
          <MenuItem
            onClick={() => {
              const groupId = groupContextMenu?.group?.编号 || menuGroupId
              const group = groupsById.get(groupId)
              setGroupMenuAnchor(null)
              setGroupContextMenu(null)
              if (group) handleEditGroup(group)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <EditIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.rename')}
          </MenuItem>
          <MenuItem
            onClick={() => { setGroupMenuAnchor(null); setGroupContextMenu(null); handleGroupMoveToTop(menuGroupId) }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignTopIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToTop')}
          </MenuItem>
          <MenuItem
            onClick={() => { setGroupMenuAnchor(null); setGroupContextMenu(null); handleGroupMoveToBottom(menuGroupId) }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignBottomIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToBottom')}
          </MenuItem>
          <MenuItem
            onClick={() => { setGroupMenuAnchor(null); setGroupContextMenu(null); handleDeleteGroup(menuGroupId) }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13, color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.delete')}
          </MenuItem>
        </Menu>

        {/* 常用语右键菜单 */}
        <Menu
          key="phrase-menu"
          open={phraseContextMenu !== null}
          onClose={() => setPhraseContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={
            phraseContextMenu !== null
              ? { top: phraseContextMenu.mouseY, left: phraseContextMenu.mouseX }
              : undefined
          }
          slotProps={{
            paper: {
              onMouseDown: (e) => e.stopPropagation(),
              sx: { pointerEvents: 'auto', minWidth: 80, p: 0.5, borderRadius: 2, border: '1px solid #4a4b4e' }
            },
            list: { sx: { p: 0 } }
          }}
          sx={{
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              mb: 0.25,
              '&:last-child': { mb: 0 }
            }
          }}
        >
          <MenuItem
            onClick={() => {
              if (phraseContextMenu?.phrase) handleCopyPhrase(phraseContextMenu.phrase);
              setPhraseContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <ContentCopyIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.copyContent')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (phraseContextMenu?.phrase) handleClonePhrase(phraseContextMenu.phrase)
              setPhraseContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <PostAddIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.clone')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (phraseContextMenu?.phrase) handleEditPhraseClick(phraseContextMenu.phrase)
              setPhraseContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <EditIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.edit')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (phraseContextMenu?.phrase) handlePhraseMoveToTop(phraseContextMenu.phrase.编号);
              setPhraseContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignTopIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToTop')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (phraseContextMenu?.phrase) handlePhraseMoveToBottom(phraseContextMenu.phrase.编号);
              setPhraseContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13 }}
          >
            <VerticalAlignBottomIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.moveToBottom')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (phraseContextMenu?.phrase) handleDeletePhrase(phraseContextMenu.phrase.编号);
              setPhraseContextMenu(null)
            }}
            sx={{ py: 0.75, px: 1.5, fontSize: 13, color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 0.75, fontSize: 16 }} /> {t('menu.delete')}
          </MenuItem>
        </Menu>

        {/* 提示 */}
        <Snackbar
          key={snackbar.id}
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={(_, reason) => {
            if (reason === 'clickaway') return
            setSnackbar(p => ({ ...p, open: false }))
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            icon={false}
            sx={{
              width: 'auto',
              minWidth: 120,
              bgcolor: isDark ? '#4A6651' : '#5D7C66', // 深色模式调深
              color: '#fff',      // 统一白色文字
              boxShadow: isDark ? '0 6px 16px rgba(0,0,0,0.4)' : '0 6px 16px rgba(93, 124, 102, 0.3)',
              borderRadius: '12px',
              border: 'none', // 移除边框，保持干净
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiAlert-message': { textAlign: 'center', width: '100%', py: 1, fontSize: '1rem', fontWeight: 600 },
              '& .MuiAlert-icon': { display: 'none' } // 隐藏默认图标（如果有）
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box >
      <HelpDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        isDark={isDark}
        onStartGuide={handleStartGuide}
        onDonationThanks={() => showSnackbar(t('donation.thanks'))}
      />

      {/* 新手引导遮罩层。 */}
      <GuideOverlay
        steps={guideSteps}
        currentStep={guideStep}
        onNext={() => setGuideStep(prev => prev + 1)}
        onPrev={() => setGuideStep(prev => prev - 1)}
        onComplete={handleEndGuide}
        isDark={isDark}
        isPreviewMode={isPreviewMode}
      />

      {/* 设置对话框 */}
      <Dialog
        open={settingsOpen}
        onClose={handleSettingsClose}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
        PaperProps={{
          sx: {
            height: 700,
            maxHeight: 'calc(100% - 16px)',
            borderRadius: 3,
            bgcolor: isDark ? '#2b2b2b' : '#fff'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsOutlinedIcon color="primary" />
            {t('settings.title')}
          </Box>
        </DialogTitle>
        <Tabs
          value={settingsTab}
          onChange={(_, value) => {
            setLanguageMenuAnchor(null)
            setInterfaceFontMenuAnchor(null)
            setContentFontMenuAnchor(null)
            setSettingsTab(value)
          }}
          aria-label={t('settings.title')}
          sx={{
            px: 3,
            height: 48,
            minHeight: 48,
            borderBottom: '1px dashed',
            borderColor: 'divider',
            '& .MuiTabs-scroller': { height: '100%' },
            '& .MuiTabs-flexContainer': {
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box',
              pb: 0.5,
              gap: 1
            },
            '& .MuiTabs-indicator': { display: 'none' }
          }}
        >
          <Tab
            value="general"
            label={t('settings.generalGroup')}
            id="settings-tab-general"
            aria-controls="settings-panel-general"
            sx={settingsTabSx}
          />
          <Tab
            value="ai"
            label={t('settings.aiGroup')}
            id="settings-tab-ai"
            aria-controls="settings-panel-ai"
            sx={settingsTabSx}
          />
        </Tabs>
        <DialogContent sx={{
          minHeight: 0,
          pt: 2.5,
          pb: 3,
          overflowY: 'auto',
          '@media (min-height: 716px)': {
            overflowY: settingsTab === 'general' ? 'hidden' : 'auto'
          }
        }}>
          {settingsTab === 'general' && (
            <Box
              role="tabpanel"
              id="settings-panel-general"
              aria-labelledby="settings-tab-general"
            >
              {/* 界面语言 */}
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
            {t('settings.language')}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<TranslateIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={e => setLanguageMenuAnchor(e.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={Boolean(languageMenuAnchor)}
            sx={{
              justifyContent: 'flex-start',
              '& .MuiButton-endIcon': { ml: 'auto' },
              '&:hover:not(.Mui-disabled)': { translate: '0 0' }
            }}
          >
            {settings.界面语言 === 'auto'
              ? t('settings.languageAuto')
              : (LANGUAGE_OPTIONS.find(option => option.value === settings.界面语言)?.label || t('settings.languageAuto'))}
          </Button>
          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={() => setLanguageMenuAnchor(null)}
            disableScrollLock
            MenuListProps={{ dense: true, 'aria-label': t('settings.language') }}
            PaperProps={{ sx: { mt: 0.5, minWidth: 260, maxHeight: 360, borderRadius: 2 } }}
          >
            <MenuItem
              selected={settings.界面语言 === 'auto'}
              onClick={() => {
                updateSettings({ 界面语言: 'auto' })
                setLanguageMenuAnchor(null)
              }}
            >
              {t('settings.languageAuto')}
            </MenuItem>
            {LANGUAGE_OPTIONS.map(option => (
              <MenuItem
                key={option.value}
                selected={settings.界面语言 === option.value}
                onClick={() => {
                  updateSettings({ 界面语言: option.value })
                  setLanguageMenuAnchor(null)
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {/* 界面字体 */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5, color: 'text.secondary' }}>
            {t('settings.interfaceFont')}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FontDownloadOutlinedIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleFontMenuOpen}
            aria-haspopup="menu"
            aria-expanded={Boolean(interfaceFontMenuAnchor)}
            sx={{
              justifyContent: 'flex-start',
              fontFamily: interfaceFontStack,
              '& .MuiButton-endIcon': { ml: 'auto' },
              '&:hover:not(.Mui-disabled)': { translate: '0 0' }
            }}
          >
            {settings.界面字体 === DEFAULT_INTERFACE_FONT
              ? t('settings.defaultInterfaceFont')
              : settings.界面字体}
          </Button>
          <Menu
            anchorEl={interfaceFontMenuAnchor}
            open={Boolean(interfaceFontMenuAnchor)}
            onClose={() => setInterfaceFontMenuAnchor(null)}
            disableScrollLock
            MenuListProps={{
              dense: true,
              'aria-label': t('settings.interfaceFont')
            }}
            PaperProps={{
              onScroll: event => {
                const menu = event.currentTarget
                if (menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 80) {
                  setInterfaceFontMenuLimit(limit => Math.min(limit + FONT_MENU_BATCH_SIZE, visibleInterfaceFontFamilies.length))
                }
              },
              sx: { mt: 0.5, minWidth: 300, maxHeight: 360, borderRadius: 2 }
            }}
          >
            {renderedInterfaceFontFamilies.map(font => (
              <MenuItem
                key={font}
                selected={settings.界面字体 === font}
                onClick={() => {
                  updateSettings({ 界面字体: font })
                  setInterfaceFontMenuAnchor(null)
                }}
                sx={{ fontFamily: createInterfaceFontStack(font) }}
              >
                {font === DEFAULT_INTERFACE_FONT ? t('settings.defaultInterfaceFont') : font}
              </MenuItem>
            ))}
            {localFontStatus === 'loading' && (
              <MenuItem disabled>{t('settings.fontLoading')}</MenuItem>
            )}
            {localFontStatus === 'unavailable' && (
              <MenuItem disabled>{t('settings.fontUnavailable')}</MenuItem>
            )}
          </Menu>

          {/* 内容字体 */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5, color: 'text.secondary' }}>
            {t('settings.contentFont')}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FontDownloadOutlinedIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleContentFontMenuOpen}
            aria-haspopup="menu"
            aria-expanded={Boolean(contentFontMenuAnchor)}
            sx={{
              justifyContent: 'flex-start',
              fontFamily: contentFontStack,
              '& .MuiButton-endIcon': { ml: 'auto' },
              '&:hover:not(.Mui-disabled)': { translate: '0 0' }
            }}
          >
            {settings.内容字体 === DEFAULT_CONTENT_FONT
              ? t('settings.defaultContentFont')
              : settings.内容字体}
          </Button>
          <Menu
            anchorEl={contentFontMenuAnchor}
            open={Boolean(contentFontMenuAnchor)}
            onClose={() => setContentFontMenuAnchor(null)}
            disableScrollLock
            MenuListProps={{
              dense: true,
              'aria-label': t('settings.contentFont')
            }}
            PaperProps={{
              onScroll: event => {
                const menu = event.currentTarget
                if (menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 80) {
                  setContentFontMenuLimit(limit => Math.min(limit + FONT_MENU_BATCH_SIZE, visibleContentFontFamilies.length))
                }
              },
              sx: { mt: 0.5, minWidth: 300, maxHeight: 360, borderRadius: 2 }
            }}
          >
            {renderedContentFontFamilies.map(font => (
              <MenuItem
                key={font}
                selected={settings.内容字体 === font}
                onClick={() => {
                  updateSettings({ 内容字体: font })
                  setContentFontMenuAnchor(null)
                }}
                sx={{ fontFamily: createContentFontStack(font) }}
              >
                {font === DEFAULT_CONTENT_FONT ? t('settings.defaultContentFont') : font}
              </MenuItem>
            ))}
            {localFontStatus === 'loading' && (
              <MenuItem disabled>{t('settings.fontLoading')}</MenuItem>
            )}
            {localFontStatus === 'unavailable' && (
              <MenuItem disabled>{t('settings.fontUnavailable')}</MenuItem>
            )}
          </Menu>

          {/* 主题模式 */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5, color: 'text.secondary' }}>
            {t('settings.themeMode')}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
            <Button
              variant={settings.主题模式 === 'auto' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => updateSettings({ 主题模式: 'auto' })}
              fullWidth
              sx={{ minWidth: 0, minHeight: 34, px: 1, whiteSpace: 'normal', lineHeight: 1.25 }}
            >
              {t('settings.themeAuto')}
            </Button>
            <Button
              variant={settings.主题模式 === 'light' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => updateSettings({ 主题模式: 'light' })}
              fullWidth
              sx={{ minWidth: 0, minHeight: 34, px: 1, whiteSpace: 'normal', lineHeight: 1.25 }}
            >
              {t('settings.themeLight')}
            </Button>
            <Button
              variant={settings.主题模式 === 'dark' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => updateSettings({ 主题模式: 'dark' })}
              fullWidth
              sx={{ minWidth: 0, minHeight: 34, px: 1, whiteSpace: 'normal', lineHeight: 1.25 }}
            >
              {t('settings.themeDark')}
            </Button>
          </Box>

          {/* 启动位置 */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5, color: 'text.secondary' }}>
            {t('settings.startupSelection')}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Button
              variant={settings.启动时打开 === 'last' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => updateSettings({ 启动时打开: 'last' })}
              sx={{ minWidth: 0, minHeight: 34, whiteSpace: 'normal', lineHeight: 1.25 }}
            >
              {t('settings.startupLast')}
            </Button>
            <Button
              variant={settings.启动时打开 === 'first' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => updateSettings({ 启动时打开: 'first' })}
              sx={{ minWidth: 0, minHeight: 34, whiteSpace: 'normal', lineHeight: 1.25 }}
            >
              {t('settings.startupFirst')}
            </Button>
          </Box>

          {/* 预览行数 */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>
            {t('settings.previewLines', { count: settings.卡片预览行数 })}
          </Typography>
          <Slider
            value={settings.卡片预览行数}
            onChange={(_, v) => updateSettings({ 卡片预览行数: v })}
            min={1}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ mx: 1, width: 'calc(100% - 16px)' }}
          />
            </Box>
          )}

          {settingsTab === 'ai' && (
            <Box
              role="tabpanel"
              id="settings-panel-ai"
              aria-labelledby="settings-tab-ai"
            >
              {/* AI 模型 */}
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                {t('settings.aiModel')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                <Select
                  value={settings.人工智能模型}
                  onChange={(e) => updateSettings({ 人工智能模型: e.target.value })}
                  sx={{
                    width: 300,
                    minWidth: 0,
                    height: 40,
                    '.MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      py: 1
                    }
                  }}
                  size="small"
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        mt: 0.5,
                        maxHeight: 300
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left'
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left'
                    },
                    disableScrollLock: true
                  }}
                >
                  <MenuItem value="">{t('settings.defaultAiModel')}</MenuItem>
                  {availableAiModels.map(m => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.label || m.id}
                    </MenuItem>
                  ))}
                  {aiModelsLoading && <MenuItem disabled>{t('ai.modelLoading')}</MenuItem>}
                </Select>
                <Tooltip title={t('ai.refreshModels')}>
                  <span>
                    <IconButton
                      size="small"
                      aria-label={t('ai.refreshModels')}
                      onClick={() => refreshAiModels(true)}
                      disabled={aiModelsLoading}
                      sx={{ width: 40, height: 40, color: 'text.secondary' }}
                    >
                      {aiModelsLoading
                        ? <CircularProgress size={20} color="inherit" />
                        : <RefreshOutlinedIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('ai.openModelsSettings')}>
                  <IconButton
                    size="small"
                    aria-label={t('ai.openModelsSettings')}
                    onClick={() => host.openAiModelsSettings()}
                    sx={{ width: 40, height: 40, color: 'text.secondary' }}
                  >
                    <ChecklistOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
            <TextField
              label={t('settings.aiImportPrompt')}
              value={settings.人工智能导入提示词 ?? t('ai.prompt.importSystem')}
              placeholder={t('ai.prompt.importSystem')}
              onChange={(e) => updateSettings({ 人工智能导入提示词: e.target.value })}
              multiline
              minRows={5}
              maxRows={10}
              fullWidth
              size="small"
            />
            <TextField
              label={t('settings.aiCategorizePrompt')}
              value={settings.人工智能归类提示词 ?? t('ai.prompt.categorizeSystem')}
              placeholder={t('ai.prompt.categorizeSystem')}
              onChange={(e) => updateSettings({ 人工智能归类提示词: e.target.value })}
              multiline
              minRows={4}
              maxRows={8}
              fullWidth
              size="small"
            />
            <TextField
              label={t('settings.aiTitlePrompt')}
              value={settings.人工智能标题提示词 ?? t('ai.prompt.titleSystem')}
              placeholder={t('ai.prompt.titleSystem')}
              onChange={(e) => updateSettings({ 人工智能标题提示词: e.target.value })}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              size="small"
            />
            <TextField
              label={t('settings.aiContentPrompt')}
              value={settings.人工智能内容提示词 ?? t('ai.prompt.generateSystem')}
              placeholder={t('ai.prompt.generateSystem')}
              onChange={(e) => updateSettings({ 人工智能内容提示词: e.target.value })}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              size="small"
            />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* AI 内容生成对话框 */}
      <Dialog
        open={aiDialogOpen}
        onClose={() => {
          cancelAiContentRequest()
          setAiDialogOpen(false)
          setAiResult('')
          setAiError(null)
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: isDark ? '#2f3136' : '#fff'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            {aiMode === 'optimize' ? t('ai.optimizeContent') : aiMode === 'theme' ? t('ai.themeGeneration') : t('ai.generateContent')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('ai.currentModel', { model: settings.人工智能模型 || t('settings.defaultAiModel') })}
          </Typography>
          {/* 如果有现有内容，显示模式选择 */}
          {editPhrase?.内容?.trim() && !aiResult && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button variant={aiMode === 'generate' ? 'contained' : 'outlined'} size="small" onClick={() => setAiMode('generate')} disabled={aiContentLoading}>{t('ai.newGeneration')}</Button>
              <Button variant={aiMode === 'optimize' ? 'contained' : 'outlined'} size="small" onClick={() => setAiMode('optimize')} disabled={aiContentLoading}>{t('ai.optimizeExisting')}</Button>
              <Button variant={aiMode === 'theme' ? 'contained' : 'outlined'} size="small" onClick={() => setAiMode('theme')} disabled={aiContentLoading}>{t('ai.useAsTheme')}</Button>
            </Box>
          )}
          {aiMode === 'optimize' ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>{t('ai.optimizeDescription')}</Typography>
          ) : (
            <TextField
              autoFocus
              label={aiMode === 'theme' ? t('ai.extraRequirementsLabel') : t('ai.descriptionLabel')}
              placeholder={aiMode === 'theme' ? t('ai.extraRequirementsPlaceholder') : t('ai.descriptionPlaceholder')}
              fullWidth
              multiline
              rows={2}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              sx={{ mt: 1 }}
              disabled={aiContentLoading}
            />
          )}
          {aiResult && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: contentFontStack }}>
                {aiResult}
              </Typography>
            </Paper>
          )}
          {aiError?.operation === 'content' && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
              action={<Button color="inherit" size="small" onClick={handleAiRetry}>{t('ai.retry')}</Button>}
            >
              <Typography variant="body2">{aiError.message}</Typography>
              {aiError.rawSummary && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, overflowWrap: 'anywhere' }}>
                  {t('ai.rawSummary', { summary: aiError.rawSummary })}
                </Typography>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              cancelAiContentRequest()
              setAiDialogOpen(false)
              setAiResult('')
              setAiError(null)
            }}
            color="inherit"
          >
            {t('common.cancel')}
          </Button>
          {aiResult ? (
            <Button
              onClick={() => {
                if (String(aiResult) === String(editPhraseRef.current?.内容 ?? '')) {
                  setAiDialogOpen(false)
                  setAiPrompt('')
                  setAiResult('')
                  setAiMode('generate')
                  showSnackbar(t('ai.noChange'), 'info')
                  return
                }
                applyEditPhraseChange({ 内容: aiResult })
                setAiDialogOpen(false)
                setAiPrompt('')
                setAiResult('')
                setAiMode('generate')
                showSnackbar(t('ai.contentApplied'))
              }}
              variant="contained"
              disabled={aiContentLoading}
              color="primary"
            >
              {t('common.apply')}
            </Button>
          ) : (
            <Button
              onClick={() => handleAiGenerateContent(aiPrompt, aiMode, editPhrase?.内容 || '')}
              variant="contained"
              disabled={aiContentLoading || (aiMode === 'generate' && !aiPrompt.trim())}
              startIcon={aiContentLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {aiContentLoading ? t('ai.generating') : aiMode === 'optimize' ? t('ai.startOptimize') : t('ai.generate')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider >
  )
}
