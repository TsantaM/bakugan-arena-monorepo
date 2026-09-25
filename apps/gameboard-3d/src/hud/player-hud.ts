import type * as THREE from "three"
import { createHudLayer, type HudLayer, type HudSize } from "./hud-layer"
import { createHudPanel, type HudPanel } from "./hud-panel"

export type HudSide = "left" | "right"

export type PlayerHud = {
    setProfileImage: (side: HudSide, url: string | null | undefined) => void
    setTimer: (side: HudSide, text: string) => void
    setTurnCount: (text: string) => void
    setEliminated: (side: HudSide, count: number) => void
    render: (renderer: THREE.WebGLRenderer) => void
    dispose: () => void
}

/** Same values as the CSS the HUD replaces (ui.css + media.css breakpoints). */
const COLORS = {
    profileGradientTop: "#7b3306",
    profileGradientBottom: "#fbbf24",
    circle: "#c2410c",
    circleDead: "#0f172a",
    timer: "whitesmoke",
    turnCount: "#f97316",
    shadow: "#0f172a",
}

const DEFAULT_PROFILE_IMAGE = "/images/default-profil-picture.png"
const ELIMINATED_SLOTS = 3

type Metrics = {
    vw: number
    padX: number
    padY: number
    profileWidth: number
    profileHeight: number
    circleSize: number
    circleGap: number
    timerFontSize: number
    turnFontSize: number
}

function metricsFor({ width }: HudSize): Metrics {
    const vw = width / 100
    // Breakpoints mirrored from media.css (48rem / 64rem).
    const large = width >= 1024
    const medium = width >= 768

    const profileVw = large ? 15 : medium ? 20 : 25
    const profileWidth = profileVw * vw

    return {
        vw,
        padX: vw,
        padY: 0.5 * vw,
        profileWidth,
        profileHeight: (profileWidth * 3) / 4,
        circleSize: large ? 28 : 12,
        circleGap: (large ? 2 : medium ? 1 : 0.5) * vw,
        timerFontSize: large ? 30 : 20,
        turnFontSize: large ? 72 : medium ? 56 : 16,
    }
}

function roundedPath(
    context: CanvasRenderingContext2D,
    points: Array<[number, number]>,
) {
    context.beginPath()
    points.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
    })
    context.closePath()
}

/** `clip-path: polygon(...)` of `#left-profile-picture`, in panel coordinates. */
function leftProfileShape(width: number, height: number): Array<[number, number]> {
    return [
        [width, 0],
        [width, height],
        [width * 0.45, height],
        [width * 0.35, height * 0.9],
        [0, height * 0.9],
        [0, 0],
    ]
}

/** `clip-path: polygon(...)` of `#right-profile-picture`. */
function rightProfileShape(width: number, height: number): Array<[number, number]> {
    return [
        [width, 0],
        [width, height * 0.9],
        [width * 0.65, height * 0.9],
        [width * 0.55, height],
        [0, height],
        [0, 0],
    ]
}

function drawText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    {
        font,
        color,
        align,
    }: { font: string; color: string; align: CanvasTextAlign },
) {
    context.save()
    context.font = font
    context.fillStyle = color
    context.textAlign = align
    context.textBaseline = "middle"
    // Same idea as the CSS text-shadow: keep the HUD readable on any background.
    context.shadowColor = COLORS.shadow
    context.shadowBlur = 8
    context.shadowOffsetX = 1
    context.shadowOffsetY = 1
    context.fillText(text, x, y)
    context.restore()
}

/**
 * In-scene replacement of the HTML HUD: player pictures, timers, turn counter
 * and eliminated markers, drawn in the orthographic HUD layer.
 *
 * Same layout, colors and breakpoints as the CSS it replaces — only crisper
 * (canvases drawn at device resolution) and immune to camera moves.
 */
export function createPlayerHud(layer: HudLayer = createHudLayer()): PlayerHud {
    let metrics = metricsFor(layer.size)

    const state = {
        profile: { left: DEFAULT_PROFILE_IMAGE, right: DEFAULT_PROFILE_IMAGE },
        image: {
            left: null as HTMLImageElement | null,
            right: null as HTMLImageElement | null,
        },
        timer: { left: "05:00", right: "05:00" },
        turnCount: "",
        eliminated: { left: 0, right: 0 },
    }

    const drawProfile = (side: HudSide) => (context: CanvasRenderingContext2D, size: HudSize) => {
        const shape =
            side === "left"
                ? leftProfileShape(size.width, size.height)
                : rightProfileShape(size.width, size.height)

        context.save()
        roundedPath(context, shape)
        context.clip()

        const gradient = context.createLinearGradient(0, 0, 0, size.height)
        gradient.addColorStop(0, COLORS.profileGradientTop)
        gradient.addColorStop(1, COLORS.profileGradientBottom)
        context.fillStyle = gradient
        context.fillRect(0, 0, size.width, size.height)

        // `.image-container` is 85% of the panel height, `.profile-image` fills it.
        const image = state.image[side]
        if (image?.complete && image.naturalWidth > 0) {
            const inset = size.width * 0.01
            context.drawImage(
                image,
                inset,
                inset,
                size.width - inset * 2,
                size.height * 0.85 - inset,
            )
        }
        context.restore()

        // Crisper than the CSS version: a thin rim following the same shape.
        context.save()
        roundedPath(context, shape)
        context.lineWidth = Math.max(2, size.width * 0.008)
        context.strokeStyle = COLORS.profileGradientBottom
        context.stroke()
        context.restore()
    }

    const drawEliminated =
        (side: HudSide) => (context: CanvasRenderingContext2D, size: HudSize) => {
            const { circleSize, circleGap } = metrics
            const radius = circleSize / 2
            const dead = Math.max(0, Math.min(state.eliminated[side], ELIMINATED_SLOTS))

            for (let index = 0; index < ELIMINATED_SLOTS; index++) {
                // Left side fills from the end, right side from the start — as in
                // `setEliminatedCircles`.
                const isDead =
                    side === "left"
                        ? index >= ELIMINATED_SLOTS - dead
                        : index < dead

                context.beginPath()
                context.arc(
                    index * (circleSize + circleGap) + radius,
                    size.height / 2,
                    radius,
                    0,
                    Math.PI * 2,
                )
                context.fillStyle = isDead ? COLORS.circleDead : COLORS.circle
                context.fill()
            }
        }

    const drawTimer = (side: HudSide) => (context: CanvasRenderingContext2D, size: HudSize) => {
        drawText(context, state.timer[side], side === "left" ? 0 : size.width, size.height / 2, {
            font: `${metrics.timerFontSize}px metal, sans-serif`,
            color: COLORS.timer,
            align: side === "left" ? "left" : "right",
        })
    }

    const drawTurnCount = (context: CanvasRenderingContext2D, size: HudSize) => {
        drawText(context, state.turnCount, size.width / 2, size.height / 2, {
            font: `italic bold ${metrics.turnFontSize}px metal, sans-serif`,
            color: COLORS.turnCount,
            align: "center",
        })
    }

    const panels = {
        profileLeft: createHudPanel(1, 1, drawProfile("left")),
        profileRight: createHudPanel(1, 1, drawProfile("right")),
        eliminatedLeft: createHudPanel(1, 1, drawEliminated("left")),
        eliminatedRight: createHudPanel(1, 1, drawEliminated("right")),
        timerLeft: createHudPanel(1, 1, drawTimer("left")),
        timerRight: createHudPanel(1, 1, drawTimer("right")),
        turnCount: createHudPanel(1, 1, drawTurnCount),
    }

    Object.values(panels).forEach((panel: HudPanel) => layer.add(panel.mesh))

    const layout = () => {
        metrics = metricsFor(layer.size)
        const { padX, padY, profileWidth, profileHeight, circleSize, circleGap, vw } = metrics
        const { width } = layer.size

        panels.profileLeft.resize(profileWidth, profileHeight)
        panels.profileRight.resize(profileWidth, profileHeight)
        layer.place(panels.profileLeft.mesh, padX + profileWidth / 2, padY + profileHeight / 2)
        layer.place(
            panels.profileRight.mesh,
            width - padX - profileWidth / 2,
            padY + profileHeight / 2,
        )

        // `.turn-and-eliminated`: flex:1 between the two profiles, padding 0 2vw.
        const areaLeft = padX + profileWidth + 2 * vw
        const areaRight = width - padX - profileWidth - 2 * vw

        const circlesWidth = ELIMINATED_SLOTS * circleSize + (ELIMINATED_SLOTS - 1) * circleGap
        const circlesHeight = circleSize
        const timerHeight = metrics.timerFontSize * 1.4
        const timerWidth = metrics.timerFontSize * 4

        panels.eliminatedLeft.resize(circlesWidth, circlesHeight)
        panels.eliminatedRight.resize(circlesWidth, circlesHeight)
        panels.timerLeft.resize(timerWidth, timerHeight)
        panels.timerRight.resize(timerWidth, timerHeight)
        panels.turnCount.resize(areaRight - areaLeft, metrics.turnFontSize * 1.4)

        const groupTop = padY
        layer.place(panels.eliminatedLeft.mesh, areaLeft + circlesWidth / 2, groupTop + circlesHeight / 2)
        layer.place(
            panels.timerLeft.mesh,
            areaLeft + timerWidth / 2,
            groupTop + circlesHeight + timerHeight / 2,
        )

        layer.place(
            panels.eliminatedRight.mesh,
            areaRight - circlesWidth / 2,
            groupTop + circlesHeight / 2,
        )
        layer.place(
            panels.timerRight.mesh,
            areaRight - timerWidth / 2,
            groupTop + circlesHeight + timerHeight / 2,
        )

        layer.place(
            panels.turnCount.mesh,
            (areaLeft + areaRight) / 2,
            groupTop + metrics.turnFontSize * 0.7,
        )
    }

    layout()
    layer.onResize(layout)

    // The HUD font is the same webfont as the DOM: redraw once it is ready.
    void document.fonts?.ready.then(() => {
        panels.timerLeft.redraw()
        panels.timerRight.redraw()
        panels.turnCount.redraw()
    })

    const loadProfile = (side: HudSide, url: string) => {
        const image = new Image()
        image.crossOrigin = "anonymous"
        image.onload = () => {
            state.image[side] = image
            panels[side === "left" ? "profileLeft" : "profileRight"].redraw()
        }
        image.onerror = () => {
            if (url === DEFAULT_PROFILE_IMAGE) return
            loadProfile(side, DEFAULT_PROFILE_IMAGE)
        }
        image.src = url
    }

    loadProfile("left", DEFAULT_PROFILE_IMAGE)
    loadProfile("right", DEFAULT_PROFILE_IMAGE)

    return {
        setProfileImage: (side, url) => {
            const next = url || DEFAULT_PROFILE_IMAGE
            if (state.profile[side] === next) return
            state.profile[side] = next
            loadProfile(side, next)
        },
        setTimer: (side, text) => {
            if (state.timer[side] === text) return
            state.timer[side] = text
            panels[side === "left" ? "timerLeft" : "timerRight"].redraw()
        },
        setTurnCount: (text) => {
            if (state.turnCount === text) return
            state.turnCount = text
            panels.turnCount.redraw()
        },
        setEliminated: (side, count) => {
            if (state.eliminated[side] === count) return
            state.eliminated[side] = count
            panels[side === "left" ? "eliminatedLeft" : "eliminatedRight"].redraw()
        },
        render: (renderer) => layer.render(renderer),
        dispose: () => {
            Object.values(panels).forEach((panel: HudPanel) => panel.dispose())
            layer.dispose()
        },
    }
}
