import React from 'react'
import Dialog from '@mui/material/Dialog'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'

/**
 * 自定义 Fade 过渡组件
 */
const CustomFade = React.forwardRef((props, ref) => {
    return <Fade ref={ref} {...props} timeout={300} />
})

/**
 * 吉卜力风格通用对话框组件
 * @param {Object} props
 * @param {boolean} props.open - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {string} props.title - 标题
 * @param {React.ElementType} props.icon - 图标组件
 * @param {React.ReactNode} props.content - 内容
 * @param {React.ReactNode} props.actions - 操作按钮
 * @param {boolean} props.isDark - 是否深色模式
 * @param {boolean} props.disableAnimation - 是否禁用动画
 */
export default function GhibliDialog({
    open,
    onClose,
    title,
    icon: Icon,
    content,
    actions,
    isDark,
    disableAnimation = false
}) {
    return (
        <Dialog
            open={open}
            TransitionComponent={disableAnimation ? undefined : CustomFade}
            transitionDuration={disableAnimation ? 0 : undefined}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    backgroundImage: 'none',
                    minWidth: 280,
                    boxShadow: 'var(--ghibli-shadow)',
                    border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(67, 52, 27, 0.08)',
                    p: 0.5
                }
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(1px)',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease-in-out'
                    }
                }
            }}
        >
            <Box
                sx={{
                    p: 2.5,
                    pb: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                {Icon && (
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: isDark
                                ? 'rgba(143, 181, 149, 0.1)'
                                : 'rgba(93, 124, 102, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                            color: 'primary.main'
                        }}
                    >
                        <Icon sx={{ fontSize: 24 }} />
                    </Box>
                )}

                {title && (
                    <Typography
                        variant="subtitle1"
                        sx={{ mb: content ? 0.5 : 2, fontWeight: 700, fontFamily: 'inherit' }}
                    >
                        {title}
                    </Typography>
                )}

                {content && (
                    <Box sx={{ width: '100%', mb: 3 }}>
                        {content}
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                    {actions}
                </Box>
            </Box>
        </Dialog>
    )
}
