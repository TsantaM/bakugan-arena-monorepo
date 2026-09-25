import type * as THREE from "three"
import { createHudLayer, type HudLayer } from "./hud-layer"
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

/**
 * Colors of the HTML HUD this layer replaces (ui.css). Only the ones that
 * cannot be read back from the DOM: the rest (positions, sizes, fonts, KO
 * state) comes straight from the elements themselves.
 */
const COLORS = {
    profileGradientTop: "#7b3306",
    profileGradientBottom: "#fbbf24",
    circle: "#c2410c",
    circleDead: "#0f172a",
    shadow: "#0f172a",
}

const DEFAULT_PROFILE_IMAGE = "/images/default-profil-picture.png"

/** DOM element each panel mirrors — the single source of layout truth. */
const SOURCES = {
    profileLeft: "#left-profile-picture",
    profileRight: "#right-profile-picture",
    eliminatedLeft: ".left-eliminated",
    eliminatedRight: ".right-eliminated",
    timerLeft: "#left-timer",
    timerRight: "#right-timer",
    turnCount: "#turn-counter",
} as const

type PanelName = keyof typeof SOURCES

type TextStyle = {
    font: string
    /** Resolved font size in pixels, used to size the panel. */
    fontSize: number
    color: string
    align: CanvasTextAlign
}

type CircleSpec = { x: number; y: number; radius: number; dead: boolean }

/** Shared context used only to measure text before sizing a panel. */
const measuringContext = document.createElement("canvas").getContext("2d")

/**
 * Panels holding text are sized from the text itself, not from the rectangle of
 * the DOM element: the element may lag behind by a frame (the value reaches the
 * HUD and the DOM in no guaranteed order), and a panel too small would clip or
 * distort what it draws.
 */
function measureText(text: string, font: string): number {
    if (!measuringContext) return 0
    measuringContext.font = font
    return measuringContext.measureText(text).width
}

function shape(points: Array<[number, number]>, context: CanvasRenderingContext2D) {
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

/** Reads the font the DOM element actually uses, breakpoints included. */
function readTextStyle(element: Element): TextStyle {
    const computed = getComputedStyle(element)
    const style = computed.fontStyle === "normal" ? "" : `${computed.fontStyle} `
    const weight = computed.fontWeight === "400" ? "" : `${computed.fontWeight} `

    return {
        font: `${style}${weight}${computed.fontSize} ${computed.fontFamily}`,
        fontSize: parseFloat(computed.fontSize) || 16,
        color: computed.color,
        align:
            computed.textAlign === "right" || computed.textAlign === "end"
                ? "right"
                : computed.textAlign === "center"
                  ? "center"
                  : "left",
    }
}

/**
 * In-scene replacement of the HTML HUD: player pictures, timers, turn counter
 * and KO markers, drawn in the orthographic HUD layer.
 *
 * Every panel is placed and sized from the rectangle of the DOM element it
 * replaces (kept in the page, hidden). The HUD can therefore never drift from
 * the elements that stay in the DOM — the bakugan preview cards in particular,
 * which sit right under the player pictures.
 */
export function createPlayerHud(layer: HudLayer = createHudLayer()): PlayerHud {
    const state = {
        profile: { left: DEFAULT_PROFILE_IMAGE, right: DEFAULT_PROFILE_IMAGE },
        image: {
            left: null as HTMLImageElement | null,
            right: null as HTMLImageElement | null,
        },
        timer: { left: "", right: "" },
        turnCount: "",
        style: {
            timerLeft: null as TextStyle | null,
            timerRight: null as TextStyle | null,
            turnCount: null as TextStyle | null,
        },
        circles: { left: [] as CircleSpec[], right: [] as CircleSpec[] },
    }

    const source = (name: PanelName) => document.querySelector(SOURCES[name])

    /** Panels that draw text, and where their text comes from. */
    const TEXT_PANELS: Partial<Record<PanelName, () => string>> = {
        timerLeft: () => state.timer.left,
        timerRight: () => state.timer.right,
        turnCount: () => state.turnCount,
    }

    const drawProfile =
        (side: HudSide) =>
        (context: CanvasRenderingContext2D, size: { width: number; height: number }) => {
            const outline =
                side === "left"
                    ? leftProfileShape(size.width, size.height)
                    : rightProfileShape(size.width, size.height)

            context.save()
            shape(outline, context)
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
            shape(outline, context)
            context.lineWidth = Math.max(2, size.width * 0.008)
            context.strokeStyle = COLORS.profileGradientBottom
            context.stroke()
            context.restore()
        }

    const drawEliminated = (side: HudSide) => (context: CanvasRenderingContext2D) => {
        for (const circle of state.circles[side]) {
            context.beginPath()
            context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
            context.fillStyle = circle.dead ? COLORS.circleDead : COLORS.circle
            context.fill()
        }
    }

    const drawText =
        (text: () => string, style: () => TextStyle | null) =>
        (context: CanvasRenderingContext2D, size: { width: number; height: number }) => {
            const value = text()
            const textStyle = style()
            if (!value || !textStyle) return

            const x = size.width / 2
            const y = size.height / 2

            context.save()
            context.font = textStyle.font
            // The panel is sized to the text, so centering in it reproduces the
            // DOM alignment exactly — the panel itself is anchored by `layout`.
            context.textAlign = "center"
            context.textBaseline = "middle"

            // Dark outline then glow: the sky behind is now black in places and
            // a bright galaxy in others, and the CSS text-shadow alone left the
            // small text unreadable over a galaxy.
            context.strokeStyle = COLORS.shadow
            context.lineWidth = Math.max(2, textStyle.fontSize * 0.14)
            context.lineJoin = "round"
            context.miterLimit = 2
            context.strokeText(value, x, y)

            context.fillStyle = textStyle.color
            context.shadowColor = COLORS.shadow
            context.shadowBlur = 6
            context.fillText(value, x, y)
            context.restore()
        }

    const panels: Record<PanelName, HudPanel> = {
        profileLeft: createHudPanel(1, 1, drawProfile("left")),
        profileRight: createHudPanel(1, 1, drawProfile("right")),
        eliminatedLeft: createHudPanel(1, 1, drawEliminated("left")),
        eliminatedRight: createHudPanel(1, 1, drawEliminated("right")),
        timerLeft: createHudPanel(
            1,
            1,
            drawText(() => state.timer.left, () => state.style.timerLeft),
        ),
        timerRight: createHudPanel(
            1,
            1,
            drawText(() => state.timer.right, () => state.style.timerRight),
        ),
        turnCount: createHudPanel(
            1,
            1,
            drawText(() => state.turnCount, () => state.style.turnCount),
        ),
    }

    Object.values(panels).forEach((panel) => layer.add(panel.mesh))

    /** Circle positions and KO state, read from the DOM circles themselves. */
    const readCircles = (side: HudSide, groupRect: DOMRect): CircleSpec[] => {
        const group = source(side === "left" ? "eliminatedLeft" : "eliminatedRight")
        if (!group) return []

        return Array.from(group.querySelectorAll<HTMLElement>(".circle")).map((circle) => {
            const rect = circle.getBoundingClientRect()
            return {
                x: rect.left - groupRect.left + rect.width / 2,
                y: rect.top - groupRect.top + rect.height / 2,
                radius: rect.width / 2,
                dead: circle.classList.contains("dead"),
            }
        })
    }

    const layout = () => {
        for (const name of Object.keys(panels) as PanelName[]) {
            const panel = panels[name]
            const element = source(name)

            if (!element) {
                panel.mesh.visible = false
                continue
            }

            const rect = element.getBoundingClientRect()
            if (rect.width < 1 || rect.height < 1) {
                panel.mesh.visible = false
                continue
            }

            panel.mesh.visible = true

            if (name === "eliminatedLeft") state.circles.left = readCircles("left", rect)
            if (name === "eliminatedRight") state.circles.right = readCircles("right", rect)

            const text = TEXT_PANELS[name]
            if (text) {
                const style = readTextStyle(element)
                state.style[name as keyof typeof state.style] = style

                const value = text()
                // Room for the outline on both sides.
                const padding = Math.max(4, style.fontSize * 0.3)
                const width = Math.ceil(measureText(value, style.font) + padding)
                const height = Math.max(rect.height, style.fontSize * 1.5)

                panel.resize(width, height)

                // Anchor the panel the way the DOM aligns its text.
                const anchorX =
                    style.align === "right"
                        ? rect.right - panel.size.width / 2
                        : style.align === "center"
                          ? rect.left + rect.width / 2
                          : rect.left + panel.size.width / 2

                layer.place(panel.mesh, anchorX, rect.top + rect.height / 2)
                continue
            }

            panel.resize(rect.width, rect.height)
            layer.place(panel.mesh, rect.left + rect.width / 2, rect.top + rect.height / 2)
        }
    }

    // Values reach the DOM and the HUD in no guaranteed order, and text width
    // changes the layout: re-read the rectangles on the next frame, once.
    let pendingLayout = 0
    const scheduleLayout = () => {
        if (pendingLayout) return
        pendingLayout = requestAnimationFrame(() => {
            pendingLayout = 0
            layout()
        })
    }

    layout()
    layer.onResize(layout)
    // The HUD font is the same webfont as the DOM: re-read once it is ready.
    void document.fonts?.ready.then(scheduleLayout)

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
            // Draw now so the value can never be stale, re-measure next frame.
            panels[side === "left" ? "timerLeft" : "timerRight"].redraw()
            scheduleLayout()
        },
        setTurnCount: (text) => {
            if (state.turnCount === text) return
            state.turnCount = text
            panels.turnCount.redraw()
            scheduleLayout()
        },
        setEliminated: () => {
            // KO state is read back from the DOM circles.
            scheduleLayout()
        },
        render: (renderer) => layer.render(renderer),
        dispose: () => {
            cancelAnimationFrame(pendingLayout)
            Object.values(panels).forEach((panel) => panel.dispose())
            layer.dispose()
        },
    }
}
