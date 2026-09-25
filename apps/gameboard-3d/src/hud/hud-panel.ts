import * as THREE from "three"

export type HudPanelDraw = (
    context: CanvasRenderingContext2D,
    size: { width: number; height: number },
) => void

export type HudPanel = {
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    /** Panel size in CSS pixels. */
    size: { width: number; height: number }
    /** Redraws the canvas. Call it when the displayed value changes — not per frame. */
    redraw: () => void
    /** Resizes the panel (and redraws it). */
    resize: (width: number, height: number) => void
    dispose: () => void
}

/** Canvases are drawn at device resolution so HUD text stays crisp. */
const MAX_PIXEL_RATIO = 3

/**
 * Panels must cover a whole number of pixels, and an even one: the plane is
 * centered on its position, so an odd size would put its edges on half pixels
 * and the texture would be resampled — that is what made the HUD look blurry
 * at most window sizes.
 */
function alignSize(value: number): number {
    return Math.max(2, Math.round(value / 2) * 2)
}

/**
 * A HUD element backed by a 2D canvas: anything the DOM used to render (frames,
 * gradients, clipped shapes, text) is drawn with the same Canvas2D primitives,
 * then shown as a textured plane in the HUD layer.
 */
export function createHudPanel(width: number, height: number, draw: HudPanelDraw): HudPanel {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    const size = { width: alignSize(width), height: alignSize(height) }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.generateMipmaps = false

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size.width, size.height),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            // The HUD pass owns the screen: never depth-test against the board.
            depthTest: false,
            depthWrite: false,
        }),
    )

    const redraw = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
        const pixelWidth = Math.max(1, Math.round(size.width * ratio))
        const pixelHeight = Math.max(1, Math.round(size.height * ratio))

        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth
            canvas.height = pixelHeight
        }

        if (!context) return
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        context.clearRect(0, 0, size.width, size.height)
        draw(context, size)
        texture.needsUpdate = true
    }

    redraw()

    return {
        mesh,
        size,
        redraw,
        resize: (nextWidth, nextHeight) => {
            const alignedWidth = alignSize(nextWidth)
            const alignedHeight = alignSize(nextHeight)
            const sameSize = alignedWidth === size.width && alignedHeight === size.height

            size.width = alignedWidth
            size.height = alignedHeight

            if (!sameSize) {
                mesh.geometry.dispose()
                mesh.geometry = new THREE.PlaneGeometry(alignedWidth, alignedHeight)
            }

            // Redraw even at identical size: the device pixel ratio may have changed.
            redraw()
        },
        dispose: () => {
            mesh.removeFromParent()
            mesh.geometry.dispose()
            mesh.material.dispose()
            texture.dispose()
        },
    }
}
