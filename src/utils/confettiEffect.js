let confettiFrame = null
let confettiEnd = 0
let confettiZIndex = 100
let rectangleShape = null
let confettiApi = null
let confettiLoading = null

function loadConfetti() {
    if (confettiApi) return Promise.resolve(confettiApi)
    if (!confettiLoading) {
        confettiLoading = import(/* webpackChunkName: "canvas-confetti" */ 'canvas-confetti').then(module => {
            confettiApi = module.default
            return confettiApi
        })
    }
    return confettiLoading
}

export function triggerConfetti({ zIndex = 100 } = {}) {
    const duration = 800 // 持续 0.8 秒
    const now = Date.now()

    // 复制等操作可能在短时间内连续触发。复用当前动画循环，避免每次点击
    // 都创建独立的 RAF 循环，从而减少重复计算和视觉抖动。
    if (confettiFrame !== null) {
        confettiEnd = Math.min(Math.max(confettiEnd, now + duration), now + 1200)
        confettiZIndex = Math.max(confettiZIndex, zIndex)
        return
    }
    confettiEnd = now + duration
    confettiZIndex = zIndex

    loadConfetti().then(confetti => startConfetti(confetti)).catch(error => {
        confettiFrame = null
        console.warn('[Confetti] Failed to load effect:', error)
    })
}

function startConfetti(confetti) {
    if (confettiFrame !== null) return
    confettiEnd = Math.max(confettiEnd, Date.now() + 200)

    // 颜色: #fce18a, #009688, #f4306d, #b48def, #95FF82, #FF9800
    const colors = ['#fce18a', '#009688', '#f4306d', '#b48def', '#95FF82', '#FF9800']

    // 形状：正方形、圆形和长方形（长宽比例为 0.2）。
    if (!rectangleShape) {
        rectangleShape = confetti.shapeFromPath({
            path: 'M0 0 L10 0 L10 2 L0 2 Z'
        })
    }

    ;(function frame() {
        const now = Date.now()
        if (now > confettiEnd) {
            confettiFrame = null
            confettiZIndex = 100
            return
        }

        // 随机打乱颜色数组以确保全部用上且分布随机
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5)

        // 发射源 A：从顶部向下散射。
        confetti({
            particleCount: 2,
            angle: 270,
            spread: 360,
            origin: { x: Math.random(), y: 0 },
            startVelocity: Math.random() * 15,
            decay: 0.9,
            colors: shuffledColors,
            shapes: ['square', 'circle', rectangleShape],
            zIndex: confettiZIndex,
            scalar: 1,
            ticks: 70 // 淡出速度
        })

        // 发射源 B：从左下角向右上方喷射。
        confetti({
            particleCount: 2,
            angle: 45,
            spread: 60,
            origin: { x: 0, y: 1 },
            startVelocity: 20 + Math.random() * 20,
            decay: 0.9,
            colors: shuffledColors,
            shapes: ['square', 'circle', rectangleShape],
            zIndex: confettiZIndex,
            scalar: 1,
            ticks: 70
        })

        // 发射源 C：从右下角向左上方喷射。
        confetti({
            particleCount: 2,
            angle: 135,
            spread: 60,
            origin: { x: 1, y: 1 },
            startVelocity: 20 + Math.random() * 20,
            decay: 0.9,
            colors: shuffledColors,
            shapes: ['square', 'circle', rectangleShape],
            zIndex: confettiZIndex,
            scalar: 1,
            ticks: 70
        })

        confettiFrame = requestAnimationFrame(frame)
    }())
}
