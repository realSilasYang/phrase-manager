import { createTheme } from '@mui/material/styles'

// 吉卜力风格主题使用的颜色常量，集中定义便于浅色和深色主题复用。
const GHIBLI_COLORS = {
    PRIMARY_LIGHT: '#5D7C66',
    PRIMARY_DARK: '#8FB595',
    BG_LIGHT: '#FDFBF7',
    BG_DARK: '#1f2023',
    TEXT_LIGHT: '#43341B',
    TEXT_DARK: '#E2E2E2'
}

const BUTTON_HOVER_LIFT = {
    translate: '0 0',
    transition: [
        'translate 160ms cubic-bezier(0.2, 0, 0, 1)',
        'box-shadow 180ms ease',
        'background-color 180ms ease',
        'border-color 180ms ease',
        'color 180ms ease'
    ].join(', '),
    '@media (hover: hover) and (pointer: fine)': {
        '&:hover:not(.Mui-disabled)': {
            translate: '0 -1px'
        }
    },
    '&:active:not(.Mui-disabled)': {
        translate: '0 0'
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
        '&:hover:not(.Mui-disabled)': {
            translate: '0 0'
        }
    }
}

/**
 * 创建吉卜力风格主题
 * @param {boolean} isDark - 是否为深色模式
 * @returns {Theme} MUI主题对象
 */
export function createGhibliTheme(
    isDark,
    fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
) {
    const {
        PRIMARY_LIGHT,
        PRIMARY_DARK,
        BG_DARK,
        TEXT_LIGHT,
        TEXT_DARK
    } = GHIBLI_COLORS

    return createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: {
                main: isDark ? PRIMARY_DARK : PRIMARY_LIGHT,
                contrastText: isDark ? 'rgba(0, 0, 0, 0.72)' : '#fff'
            },
            secondary: { main: '#A89F91' },
            background: {
                default: 'transparent',
                paper: isDark ? '#2b2b2b' : '#FDFBF7'
            },
            text: {
                primary: isDark ? TEXT_DARK : TEXT_LIGHT,
                secondary: isDark ? 'rgba(235, 230, 220, 0.7)' : 'rgba(67, 52, 27, 0.7)'
            },
            error: { main: isDark ? '#E57373' : '#CC7A6F' },
            divider: isDark ? 'rgba(235, 230, 220, 0.12)' : 'rgba(67, 52, 27, 0.12)'
        },
        typography: {
            fontFamily,
            fontSize: 15,
            button: { textTransform: 'none', fontWeight: 600 }
        },
        components: {
            MuiModal: {
                defaultProps: {
                    disableRestoreFocus: true
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
                        transition: 'border-color 180ms ease, box-shadow 180ms ease',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(143, 181, 149, 0.5)' : 'rgba(93, 124, 102, 0.5)'
                        },
                        '&:hover:not(.Mui-disabled):not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(143, 181, 149, 0.72)' : 'rgba(93, 124, 102, 0.62)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? PRIMARY_DARK : PRIMARY_LIGHT,
                            borderWidth: '2px'
                        },
                        // Select 关闭菜单后可能暂时保留 Mui-focused 类，真实失焦时恢复基础边框。
                        '&.Mui-focused:not(:focus-within):not(:has([aria-expanded="true"])) .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(143, 181, 149, 0.5)' : 'rgba(93, 124, 102, 0.5)',
                            borderWidth: '1px'
                        }
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        boxShadow: 'var(--ghibli-shadow)',
                        backgroundImage: 'none',
                        border: isDark ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(67, 52, 27, 0.1)',
                        borderRadius: '2px',
                        '&.ghibli-card': {
                            border: isDark ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid #43341B',
                            borderRadius: '12px'
                        }
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        ...BUTTON_HOVER_LIFT,
                        borderRadius: '12px',
                        boxShadow: 'none',
                        '&:hover:not(.Mui-disabled)': {
                            boxShadow: 'none'
                        }
                    },
                    contained: {
                        boxShadow: isDark
                            ? '0 2px 5px rgba(0, 0, 0, 0.28)'
                            : '0 2px 5px rgba(67, 52, 27, 0.16)',
                        '&:hover:not(.Mui-disabled)': {
                            boxShadow: isDark
                                ? '0 4px 11px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(143, 181, 149, 0.08)'
                                : '0 4px 11px rgba(67, 52, 27, 0.18), 0 0 0 1px rgba(93, 124, 102, 0.08)'
                        },
                        '&:active:not(.Mui-disabled)': {
                            boxShadow: isDark
                                ? '0 1px 3px rgba(0, 0, 0, 0.24)'
                                : '0 1px 3px rgba(67, 52, 27, 0.13)'
                        }
                    },
                    containedPrimary: {
                        '&:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? '#99bda0' : '#668970'
                        }
                    },
                    outlined: {
                        '&:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.07)',
                            borderColor: isDark ? 'rgba(143, 181, 149, 0.72)' : 'rgba(93, 124, 102, 0.62)'
                        }
                    },
                    text: {
                        '&:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.07)'
                        }
                    }
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        ...BUTTON_HOVER_LIFT,
                        color: 'var(--ghibli-text)',
                        '&:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.14)' : 'rgba(93, 124, 102, 0.1)',
                            boxShadow: isDark
                                ? '0 2px 7px rgba(0, 0, 0, 0.18)'
                                : '0 2px 7px rgba(67, 52, 27, 0.1)'
                        }
                    }
                },
                defaultProps: {
                    disableFocusRipple: true
                }
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: {
                        ...BUTTON_HOVER_LIFT,
                        '&:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.07)',
                            borderColor: isDark ? 'rgba(143, 181, 149, 0.64)' : 'rgba(93, 124, 102, 0.56)'
                        },
                        '&.Mui-selected:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.28)' : 'rgba(93, 124, 102, 0.19)'
                        }
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        ...BUTTON_HOVER_LIFT,
                        '&:hover:not(.Mui-disabled)': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.1)' : 'rgba(93, 124, 102, 0.07)'
                        }
                    }
                }
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: '#4A6651',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        borderRadius: '6px',
                        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(93, 124, 102, 0.3)',
                        border: 'none'
                    }
                }
            },
            MuiSnackbar: {
                styleOverrides: {
                    root: {
                        top: '24px !important',
                        left: '50% !important',
                        transform: 'translateX(-50%) !important'
                    }
                }
            },
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: isDark ? BG_DARK : 'transparent',
                        overflow: 'hidden'
                    }
                }
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        margin: '2px 4px',
                        transition: 'background-color 180ms ease, color 180ms ease',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.15)' : 'rgba(93, 124, 102, 0.15)'
                        },
                        '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.25)' : 'rgba(93, 124, 102, 0.25)',
                            '&:hover': {
                                backgroundColor: isDark ? 'rgba(143, 181, 149, 0.35)' : 'rgba(93, 124, 102, 0.35)'
                            }
                        }
                    }
                }
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        transition: 'background-color 180ms ease, color 180ms ease',
                        '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(143, 181, 149, 0.25)' : 'rgba(93, 124, 102, 0.25)',
                            '&:hover': {
                                backgroundColor: isDark ? 'rgba(143, 181, 149, 0.35)' : 'rgba(93, 124, 102, 0.35)'
                            }
                        }
                    }
                }
            }
        }
    })
}
