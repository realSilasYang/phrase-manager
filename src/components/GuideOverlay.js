import React, { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import { t } from '../locales'

export default function GuideOverlay({ steps, currentStep, onNext, onPrev, onComplete, isDark, isPreviewMode }) {
    const [targetRect, setTargetRect] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
    const tooltipRef = useRef(null)

    const step = (currentStep >= 0 && currentStep < steps.length) ? steps[currentStep] : null

    // 切换步骤后重新测量目标和提示框，避免上一阶段的尺寸残留。
    const [layoutVersion, setLayoutVersion] = useState(0)
    useEffect(() => {
        setLayoutVersion(v => v + 1)
    }, [currentStep])

    useEffect(() => {
        if (!step) return

        const updatePosition = () => {
            const el = document.querySelector(step.selector)
            if (!el) {
                console.warn(`Guide element not found: ${step.selector}`)
                return
            }

            const viewportW = window.innerWidth
            const viewportH = window.innerHeight

            const rect = el.getBoundingClientRect()

            // 为高亮区域增加少量留白，并把结果限制在当前视口内。
            const expandPadding = 4
            let t = rect.top - expandPadding
            let l = rect.left - expandPadding
            let w = rect.width + (expandPadding * 2)
            let h = rect.height + (expandPadding * 2)

            // 处理顶部和左侧越界；被裁掉的部分要从宽高里同步扣除。
            if (t < 0) { h += t; t = 0 }
            if (l < 0) { w += l; l = 0 }

            // 处理底部和右侧越界，保证遮罩计算不会产生负尺寸。
            if (t + h > viewportH) { h = viewportH - t }
            if (l + w > viewportW) { w = viewportW - l }

            const target = {
                top: t,
                left: l,
                width: w,
                height: h,
                // 保存原始顶部位置，当前对象主要用于绘制四块遮罩区域。
                originalTop: rect.top,
                bottom: t + h,
                right: l + w
            }
            setTargetRect(target)

            // 优先读取已渲染提示框的真实尺寸；首次渲染或引用尚未建立时使用估算值。
            let tooltipW = 300
            let tooltipH = 400 // 提示框较窄，按偏高尺寸估算以避免初始溢出。

            if (tooltipRef.current) {
                const navRect = tooltipRef.current.getBoundingClientRect()
                if (navRect.width > 0 && navRect.height > 0) {
                    tooltipW = navRect.width
                    tooltipH = navRect.height
                }
            }

            const padding = 2

            // 判断候选位置是否完整落在视口安全边距内。
            const fits = (t, l, w, h) => {
                return t >= padding && l >= padding && (t + h) <= (viewportH - padding) && (l + w) <= (viewportW - padding)
            }

            // 计算四个候选方向。
            const targetCenterY = target.top + (target.height / 2)
            const targetCenterX = target.left + (target.width / 2)
            const isHuge = target.height > viewportH * 0.6

            // 智能对齐：提示框位于目标上方或下方时，先按水平方向对齐。
            let verticalX
            if (targetCenterX < viewportW * 0.33) {
                verticalX = target.left // 目标偏左时左对齐。
            } else if (targetCenterX > viewportW * 0.66) {
                verticalX = target.right - tooltipW // 目标偏右时右对齐。
            } else {
                verticalX = targetCenterX - (tooltipW / 2) // 目标居中时中心对齐。
            }

            // 提示框位于目标左右两侧时，按垂直方向选择对齐方式。
            let sideY
            if (isHuge || targetCenterY < viewportH * 0.4) {
                sideY = target.top // 目标靠上时顶部对齐。
            } else if (targetCenterY > viewportH * 0.6) {
                sideY = target.bottom - tooltipH // 目标靠下时底部对齐。
            } else {
                sideY = targetCenterY - (tooltipH / 2) // 目标位于中部时中心对齐。
            }

            // 1. 下方。
            const posBottom = {
                top: target.bottom + 8,
                left: verticalX
            }
            // 上下方位共享同一套水平边界限制。
            if (posBottom.left < padding) posBottom.left = padding
            if (posBottom.left + tooltipW > viewportW - padding) posBottom.left = viewportW - padding - tooltipW

            // 2. 上方。
            const posTop = {
                top: target.top - tooltipH - 8,
                left: verticalX
            }
            // 重用上面的水平边界限制逻辑。
            if (posTop.left < padding) posTop.left = padding
            if (posTop.left + tooltipW > viewportW - padding) posTop.left = viewportW - padding - tooltipW

            // 3. 右侧。
            const posRight = {
                top: sideY,
                left: target.right + 8
            }
            // 左右方位需要限制垂直位置。
            if (posRight.top + tooltipH > viewportH - padding) posRight.top = viewportH - padding - tooltipH
            if (posRight.top < padding) posRight.top = padding

            // 4. 左侧。
            const posLeft = {
                top: sideY,
                left: target.left - tooltipW - 8
            }
            if (posLeft.top + tooltipH > viewportH - padding) posLeft.top = viewportH - padding - tooltipH
            if (posLeft.top < padding) posLeft.top = padding

            let bestPos = posBottom
            let found = false

            // 选择策略：普通目标优先尝试下方、上方、右侧、左侧；
            // 对高度占比较大的目标优先尝试左右两侧，减少遮挡目标内容。

            const sequence = isHuge
                ? [posRight, posLeft, posBottom, posTop]
                : [posBottom, posTop, posRight, posLeft]

            for (const pos of sequence) {
                if (fits(pos.top, pos.left, tooltipW, tooltipH)) {
                    bestPos = pos
                    found = true
                    break
                }
            }

            // 如果四个候选位置都无法完全容纳，则按可用空间选择一个方向，
            // 再做最终裁切；在空间允许时尽量避免覆盖被引导的目标。
            if (!found) {
                // 根据目标四周的剩余空间选择兜底位置。
                const spaceBottom = viewportH - target.bottom
                const spaceTop = target.top
                const spaceRight = viewportW - target.right
                const spaceLeft = target.left

                if (isHuge) {
                    // 大目标优先选择左右两侧剩余空间较大的一侧。
                    if (spaceRight >= spaceLeft && spaceRight > 220) bestPos = posRight
                    else if (spaceLeft > 220) bestPos = posLeft
                    else bestPos = posBottom // 两侧都不足时退回下方叠加。
                } else {
                    // 普通目标优先选择上下方剩余空间较大的一侧。
                    if (spaceBottom >= spaceTop && spaceBottom > 200) bestPos = posBottom
                    else if (spaceTop > 200) bestPos = posTop
                    else bestPos = posBottom
                }

                // 最后一次硬限制，防止提示框超出视口。
                if (bestPos.top < padding) bestPos.top = padding
                if (bestPos.left < padding) bestPos.left = padding
                if (bestPos.top + tooltipH > viewportH - padding) bestPos.top = viewportH - padding - tooltipH
                if (bestPos.left + tooltipW > viewportW - padding) bestPos.left = viewportW - padding - tooltipW
            }

            setTooltipPos(bestPos)

            // 目标不在视口内时，滚动到适合阅读的位置。
            if (!isHuge) {
                // 高度很大的目标不主动滚动，避免用户视线突然跳动。
                const isInView = (
                    target.top >= 0 &&
                    target.left >= 0 &&
                    target.bottom <= viewportH &&
                    target.right <= viewportW
                )
                if (!isInView) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }
        }

        // 首次计算立即执行，并在布局稳定后再补测一次。
        updatePosition()
        const timer = setTimeout(updatePosition, 100)
        window.addEventListener('resize', updatePosition)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updatePosition)
        }
    }, [step, layoutVersion])

    // 用于渲染快捷键和重点文字的辅助组件。
    const KeyTag = ({ children }) => (
        <Box component="span" sx={{
            display: 'inline-block',
            px: 0.6,
            py: 0.1,
            mx: 0.3,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            fontSize: '0.75em',
            fontFamily: 'Consolas, monospace',
            fontWeight: 600,
            lineHeight: 1,
            verticalAlign: 'middle',
            boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.1)' : '0 1px 0 rgba(0,0,0,0.1)'
        }}>
            {children}
        </Box>
    )

    const Highlight = ({ children }) => (
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{children}</Box>
    )

    // 将引导文案中的换行、项目符号、快捷键和重点标记转换为 React 节点。
    const formatMessage = (text) => {
        if (!text) return null
        const lines = text.split('\n')
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {lines.map((line, i) => {
                    if (!line.trim()) return <Box key={i} sx={{ height: 8 }} />
                    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-')
                    const cleanLine = isBullet ? line.trim().substring(1).trim() : line
                    const parts = cleanLine.split(/(\{.*?\})/)
                    const content = parts.map((part, j) => {
                        if (part.startsWith('{key:') && part.endsWith('}')) return <KeyTag key={j}>{part.slice(5, -1)}</KeyTag>
                        if (part.startsWith('{bold:') && part.endsWith('}')) return <Highlight key={j}>{part.slice(6, -1)}</Highlight>
                        return part
                    })
                    if (isBullet) {
                        return (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, ml: 0.5 }}>
                                <Typography variant="caption" sx={{ color: 'primary.main', mt: 0.5 }}>●</Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>{content}</Typography>
                            </Box>
                        )
                    }
                    return (
                        <Typography key={i} variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary', mb: 0.5 }}>{content}</Typography>
                    )
                })}
            </Box>
        )
    }

    if (!step || !targetRect) return null

    return (
        <React.Fragment>
            {/* 1. 遮罩层：由四块区域组成，中间保留目标位置供用户点击。 */}
            {/* 四块区域比整屏遮罩叠加阴影更容易精确控制点击穿透范围。 */}

            {/* 2. 四块遮罩区域：仅目标区域不被遮挡。 */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10002,
                pointerEvents: 'none', // 外层不拦截事件，具体遮罩块负责拦截。
            }}>
                {/* 四块遮罩使用相同的定位和颜色规则。 */}
                {[
                    { // 上方区域。
                        top: 0, left: 0, right: 0,
                        height: targetRect.top
                    },
                    { // 下方区域。
                        top: targetRect.top + targetRect.height, left: 0, right: 0,
                        bottom: 0
                    },
                    { // 左侧区域。
                        top: targetRect.top, left: 0,
                        width: targetRect.left,
                        height: targetRect.height
                    },
                    { // 右侧区域。
                        top: targetRect.top, left: targetRect.left + targetRect.width,
                        right: 0,
                        height: targetRect.height
                    }
                ].map((pos, i) => {
                    // 预览模式下隐藏右侧遮罩（索引 3），让预览内容保持可见。
                    if (isPreviewMode && i === 3) return null
                    return (
                        <Box key={i} sx={{
                            position: 'absolute',
                            bgcolor: `rgba(0, 0, 0, ${isDark ? 0.7 : 0.5})`,
                            pointerEvents: 'auto', // 遮罩区域拦截点击。
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            ...pos
                        }} />
                    )
                })}

                {/* 聚光边框仅用于视觉提示，不参与事件处理。 */}
                <Box sx={{
                    position: 'absolute',
                    top: targetRect.top,
                    left: targetRect.left,
                    width: targetRect.width,
                    height: targetRect.height,
                    borderRadius: '12px',
                    border: '1px solid #E6B450', // 吉卜力风格的金色高亮边框。
                    boxShadow: '0 0 20px rgba(230, 180, 80, 0.5)',
                    animation: 'pulse-guide 1s infinite',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'none',
                    '@keyframes pulse-guide': {
                        '0%': { boxShadow: '0 0 0 0px rgba(230, 180, 80, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(230, 180, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0px rgba(230, 180, 80, 0)' }
                    }
                }} />
            </Box>

            {/* 3. 引导提示框。 */}
            {!isPreviewMode && (
                <Fade in={true}>
                    <Paper
                        ref={tooltipRef}
                        sx={{
                            position: 'fixed',
                            top: tooltipPos.top,
                            left: tooltipPos.left,
                            width: 300, // 保持窄版宽度，便于在小视口内完整显示。
                            maxWidth: '90vw',
                            zIndex: 10003,
                            p: 3,
                            borderRadius: 3,
                            bgcolor: isDark ? '#2f3136' : '#fff',
                            color: isDark ? '#fff' : 'rgba(0,0,0,0.87)',
                            boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                            transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', // 使用带回弹效果的位移动画。
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontSize: '1.2rem', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                {step.title}
                            </Typography>
                            <Box sx={{
                                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                px: 1.2, py: 0.4,
                                borderRadius: 4,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'text.secondary'
                            }}>
                                {currentStep + 1} / {steps.length}
                            </Box>
                        </Box>

                        <Box sx={{ mb: 3, flex: 1, overflowY: 'auto', maxHeight: '60vh', pr: 1 }}>
                            {formatMessage(step.message)}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                            <Button
                                size="small"
                                onClick={() => onComplete(true)}
                                sx={{ color: 'text.secondary', minWidth: 'auto', px: 1, '&:hover': { color: 'error.main' } }}
                            >
                                {t('guide.controls.skip')}
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {currentStep > 0 && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={onPrev}
                                        startIcon={<ArrowBackIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {t('guide.controls.back')}
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={currentStep === steps.length - 1 ? () => onComplete(false) : onNext}
                                    endIcon={currentStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: 'primary.main',
                                        color: '#fff',
                                        boxShadow: isDark
                                            ? '0 2px 6px rgba(0, 0, 0, 0.24)'
                                            : '0 2px 6px rgba(67, 52, 27, 0.14)',
                                        '&:hover:not(.Mui-disabled)': {
                                            boxShadow: isDark
                                                ? '0 4px 11px rgba(0, 0, 0, 0.3)'
                                                : '0 4px 11px rgba(67, 52, 27, 0.18)'
                                        }
                                    }}
                                >
                                    {currentStep === steps.length - 1 ? t('guide.controls.finish') : t('guide.controls.next')}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            )}
        </React.Fragment >
    )
}
