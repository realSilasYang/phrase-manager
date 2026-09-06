import React, { useEffect, useRef, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CloseIcon from '@mui/icons-material/Close'
import FavoriteIcon from '@mui/icons-material/Favorite'
import GitHubIcon from '@mui/icons-material/GitHub'
import { t } from './locales'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import SchoolIcon from '@mui/icons-material/School'
import DonationDialog from './DonationDialog'
import { triggerConfetti } from './utils'
import { host } from './services/host'

const SOURCE_REPOSITORY_URL = 'https://github.com/realSilasYang/phrase-manager'

const JSON_BACKUP_EXAMPLE = [
    '{',
    '  "分组": [',
    '    { "编号": "group-1", "名称": "..." }',
    '  ],',
    '  "分类": [',
    '    {',
    '      "编号": "category-1",',
    '      "名称": "...",',
    '      "所属分组编号": "group-1"',
    '    }',
    '  ],',
    '  "常用语": [',
    '    {',
    '      "编号": "phrase-1",',
    '      "标题": "...",',
    '      "内容": "...",',
    '      "所属分类编号": "category-1"',
    '    }',
    '  ]',
    '}'
].join('\n')

export default function HelpDialog({ open, onClose, isDark, onStartGuide, onDonationThanks }) {
    const [donationOpen, setDonationOpen] = useState(false)
    const donationThanksPendingRef = useRef(false)

    useEffect(() => {
        if (!open) {
            donationThanksPendingRef.current = false
            setDonationOpen(false)
        }
    }, [open])

    const handleDonationOpen = () => {
        donationThanksPendingRef.current = false
        setDonationOpen(true)
    }

    const handleOpenSource = () => {
        host.openExternal(SOURCE_REPOSITORY_URL)
    }

    const handleDonationClose = () => {
        donationThanksPendingRef.current = true
        setDonationOpen(false)
    }

    const handleDonationEntered = () => {
        if (open && donationOpen) triggerConfetti({ zIndex: 1350 })
    }

    const handleDonationExited = () => {
        const shouldThank = donationThanksPendingRef.current && open
        donationThanksPendingRef.current = false
        if (!shouldThank) return

        triggerConfetti({ zIndex: 1350 })
        onDonationThanks?.()
    }

    const KeyTag = ({ children }) => (
        <Box component="span" sx={{
            display: 'inline-block',
            px: 0.75,
            py: 0.25,
            mx: 0.3,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
            borderRadius: '5px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            fontSize: '0.8em',
            fontFamily: 'Consolas, monospace',
            fontWeight: 600
        }}>
            {children}
        </Box>
    )

    const TipCard = ({ emoji, title, children, code }) => (
        <Box sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(143, 181, 149, 0.08)' : 'rgba(93, 124, 102, 0.06)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(143, 181, 149, 0.2)' : 'rgba(93, 124, 102, 0.15)',
            height: '100%'
        }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.2em' }}>{emoji}</span> {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {children}
            </Typography>
            {code && (
                <Box
                    component="pre"
                    sx={{
                        m: 0,
                        mt: 1.5,
                        p: 1.5,
                        maxWidth: '100%',
                        overflowX: 'auto',
                        borderRadius: 1.5,
                        bgcolor: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.72)',
                        color: 'text.primary',
                        fontFamily: 'Consolas, "SFMono-Regular", monospace',
                        fontSize: 12,
                        lineHeight: 1.55
                    }}
                >
                    {code}
                </Box>
            )}
        </Box>
    )

    // 将文案中的占位标记替换为 React 节点，例如用于显示快捷键的 KeyTag。
    const tr = (key, params = {}) => {
        const text = t(key)
        if (!text) return key
        return text.split(/(\{.*?\})/).map((part, index) => {
            if (part.startsWith('{') && part.endsWith('}')) {
                const pKey = part.slice(1, -1)
                return params[pKey] !== undefined ? <React.Fragment key={index}>{params[pKey]}</React.Fragment> : part
            }
            return part
        })
    }

    return (
        <React.Fragment>
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    backgroundImage: 'none',
                    bgcolor: isDark ? '#2b2b2b' : '#FDFBF7',
                    maxHeight: '85vh'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    startIcon={<SchoolIcon />}
                    onClick={onStartGuide}
                    size="small"
                    sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: '#93a7e9',
                        boxShadow: isDark ? '0 2px 6px rgba(0, 0, 0, 0.18)' : '0 2px 6px rgba(67, 52, 27, 0.1)',
                        '&:hover:not(.Mui-disabled)': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                            color: '#93a7e9',
                            boxShadow: isDark ? '0 4px 10px rgba(0, 0, 0, 0.24)' : '0 4px 10px rgba(67, 52, 27, 0.14)'
                        }
                    }}
                >
                    {t('help.startGuide')}
                </Button>
                <Tooltip title={t('donation.openSourceTooltip')} describeChild>
                    <Button
                        variant="contained"
                        startIcon={<GitHubIcon />}
                        onClick={handleOpenSource}
                        size="small"
                        aria-label={t('donation.openSourceTooltip')}
                        sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            color: isDark ? 'rgba(255,255,255,0.9)' : 'text.primary',
                            boxShadow: isDark ? '0 2px 6px rgba(0, 0, 0, 0.18)' : '0 2px 6px rgba(67, 52, 27, 0.1)',
                            '&:hover:not(.Mui-disabled)': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                                color: isDark ? '#fff' : 'text.primary',
                                boxShadow: isDark ? '0 4px 10px rgba(0, 0, 0, 0.24)' : '0 4px 10px rgba(67, 52, 27, 0.14)'
                            }
                        }}
                    >
                        {t('donation.openSource')}
                    </Button>
                </Tooltip>
                <Tooltip title={t('donation.tooltip')} describeChild>
                    <Button
                        variant="contained"
                        startIcon={<FavoriteIcon />}
                        onClick={handleDonationOpen}
                        size="small"
                        sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: 'error.main',
                        boxShadow: isDark ? '0 2px 6px rgba(0, 0, 0, 0.18)' : '0 2px 6px rgba(67, 52, 27, 0.1)',
                            '&:hover:not(.Mui-disabled)': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                            color: 'error.main',
                            boxShadow: isDark ? '0 4px 10px rgba(0, 0, 0, 0.24)' : '0 4px 10px rgba(67, 52, 27, 0.14)'
                            }
                        }}
                    >
                        {t('donation.button')}
                    </Button>
                </Tooltip>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    aria-label={t('common.close')}
                    sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: { xs: 2, md: 4 }, py: 3 }}>

                {/* 数据层级介绍 */}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {t('help.sectionHierarchy')}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ mb: 0.5 }}>📁</Typography>
                        <Typography variant="subtitle2" fontWeight={700}>{t('help.hierarchyGroup')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('help.hierarchyGroupDesc')}</Typography>
                    </Box>
                    <Typography variant="h5" color="text.secondary">→</Typography>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ mb: 0.5 }}>📂</Typography>
                        <Typography variant="subtitle2" fontWeight={700}>{t('help.hierarchyCategory')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('help.hierarchyCategoryDesc')}</Typography>
                    </Box>
                    <Typography variant="h5" color="text.secondary">→</Typography>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ mb: 0.5 }}>📝</Typography>
                        <Typography variant="subtitle2" fontWeight={700}>{t('help.hierarchyPhrase')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('help.hierarchyPhraseDesc')}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 功能介绍 */}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {t('help.sectionFeatures')}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {[
                        { emoji: "📋", title: t('help.featureCopyTitle'), desc: t('help.featureCopyDesc') },
                        { emoji: "✏️", title: t('help.featureEditTitle'), desc: tr('help.featureEditDesc', { key: <KeyTag>F2</KeyTag> }) },
                        { emoji: "🗑️", title: t('help.featureDeleteTitle'), desc: tr('help.featureDeleteDesc', { delKey: <KeyTag>Del</KeyTag>, ctrlKey: <KeyTag>Ctrl</KeyTag>, zKey: <KeyTag>Z</KeyTag> }) },
                        { emoji: "🖱️", title: t('help.featureDragTitle'), desc: tr('help.featureDragDesc', { key: <KeyTag>Ctrl</KeyTag> }) },
                        { emoji: "🔍", title: t('help.featureSearchTitle'), desc: t('help.featureSearchDesc') },
                        { emoji: "📦", title: t('help.featureBatchTitle'), desc: t('help.featureBatchDesc') },
                        { emoji: "👀", title: t('help.featurePreviewTitle'), desc: tr('help.featurePreviewDesc', { key: <KeyTag>Space</KeyTag> }) },
                        { emoji: "💾", title: t('help.featureAutoSaveTitle'), desc: t('help.featureAutoSaveDesc') },
                        { emoji: "🎨", title: t('help.featureThemeTitle'), desc: t('help.featureThemeDesc') }
                    ].map((feature, index) => (
                        <Box key={index}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                                <span>{feature.emoji}</span> {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, lineHeight: 1.6 }}>
                                {feature.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 快捷键速查 */}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {t('help.sectionShortcuts')}
                </Typography>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}>
                    {[
                        { keys: ['Ctrl', 'N'], desc: t('help.shortcutNewPhrase') },
                        { keys: ['Ctrl', 'Shift', 'N'], desc: t('help.shortcutNewCategory') },
                        { keys: ['Ctrl', 'F'], desc: t('help.shortcutFocusSearch') },
                        { keys: ['Ctrl', 'S'], desc: t('help.shortcutForceSave') },
                        { keys: ['Ctrl', 'Z'], desc: t('help.shortcutUndo') },
                        { keys: ['Ctrl', 'Shift', 'Z'], desc: t('help.shortcutRedo') },
                        { keys: ['Ctrl', 'A'], desc: t('help.shortcutSelectAll') },
                        { keys: ['Ctrl', 'C'], desc: t('help.shortcutCopy') },
                        { keys: ['Ctrl', 'D'], desc: t('help.shortcutClone') },
                        { keys: ['F2'], desc: t('help.shortcutEdit') },
                        { keys: ['Del'], desc: t('help.shortcutDelete') },
                        { keys: ['Esc'], desc: t('help.shortcutEscape') },
                        { keys: ['F11'], desc: t('help.shortcutFullscreen') },
                        { keys: ['Space'], desc: t('help.shortcutPreview') },
                        { keys: ['Ctrl', t('help.dragAction')], desc: t('help.shortcutDragCopy') },
                    ].map(({ keys, desc }, index) => (
                        <Box key={index} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 0.75,
                            px: 1,
                            borderRadius: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                {keys.map((key, i) => (
                                    <React.Fragment key={i}>
                                        <KeyTag>{key}</KeyTag>
                                        {i < keys.length - 1 && <span style={{ opacity: 0.5 }}>+</span>}
                                    </React.Fragment>
                                ))}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                                {desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 导入与导出 */}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    {t('help.sectionImport')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                    {t('help.importIntro')}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.5
                }}>
                    <TipCard emoji="JSON" title={t('help.importJsonTitle')} code={JSON_BACKUP_EXAMPLE}>
                        {t('help.importJsonDesc')}
                    </TipCard>
                    <TipCard emoji="CSV" title={t('help.importCsvTitle')}>
                        {t('help.importCsvDesc')}
                    </TipCard>
                    <TipCard emoji="AI" title={t('help.importAiTitle')}>
                        {t('help.importAiDesc')}
                    </TipCard>
                    <TipCard emoji="✓" title={t('help.importReviewTitle')}>
                        {t('help.importReviewDesc')}
                    </TipCard>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.7 }}>
                    {t('help.importLimits')}
                </Typography>

            </DialogContent>
        </Dialog>
        <DonationDialog
            open={open && donationOpen}
            onClose={handleDonationClose}
            onEntered={handleDonationEntered}
            onExited={handleDonationExited}
            isDark={isDark}
        />
        </React.Fragment>
    )
}
