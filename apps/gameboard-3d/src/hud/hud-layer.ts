import * as THREE from "three"

export type HudSize = { width: number; height: number }

export type HudLayer = {
    scene: THREE.Scene
    /** Viewport size, in CSS pixels — HUD coordinates are CSS pixels too. */
    size: HudSize
    add: (object: THREE.Object3D) => void
    /**
     * Places an object using CSS-like coordinates: `left`/`top` are the
     * distances from the top-left corner of the viewport to the object center.
     */
    place: (object: THREE.Object3D, left: number, top: number) => void
    /** Runs `listener` on every viewport change (and never on the first frame). */
    onResize: (listener: (size: HudSize) => void) => void
    /** Draws the HUD on top of the scene already rendered by `renderer`. */
    render: (renderer: THREE.WebGLRenderer) => void
    dispose: () => void
}

/**
 * Screen-space overlay rendered in a second pass with its own orthographic
 * camera, in CSS pixels.
 *
 * Because that camera is never touched by OrbitControls, everything added here
 * is structurally immune to camera rotation, zoom and pan — no per-frame
 * correction needed.
 */
export function createHudLayer(): HudLayer {
    const scene = new THREE.Scene()
    const size: HudSize = { width: window.innerWidth, height: window.innerHeight }
    const camera = new THREE.OrthographicCamera(0, size.width, size.height, 0, -1000, 1000)
    const listeners: Array<(size: HudSize) => void> = []
    let pixelRatioQuery: MediaQueryList | null = null

    const syncCamera = () => {
        camera.left = 0
        camera.right = size.width
        camera.top = size.height
        camera.bottom = 0
        camera.updateProjectionMatrix()
    }

    const handleResize = () => {
        size.width = window.innerWidth
        size.height = window.innerHeight
        syncCamera()
        listeners.forEach((listener) => listener(size))
    }

    /**
     * Canvases are drawn at device resolution, so a DPR change (window moved to
     * another screen, browser zoom) has to trigger a full redraw too.
     */
    const watchPixelRatio = () => {
        pixelRatioQuery?.removeEventListener("change", handlePixelRatioChange)
        pixelRatioQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
        pixelRatioQuery.addEventListener("change", handlePixelRatioChange)
    }

    function handlePixelRatioChange() {
        watchPixelRatio()
        handleResize()
    }

    window.addEventListener("resize", handleResize)
    watchPixelRatio()

    return {
        scene,
        size,
        add: (object) => scene.add(object),
        // The ortho camera is Y-up; CSS coordinates are Y-down. Positions are
        // snapped to whole pixels so panel edges never land on a half pixel.
        place: (object, left, top) =>
            object.position.set(Math.round(left), Math.round(size.height - top), object.position.z),
        onResize: (listener) => listeners.push(listener),
        render: (renderer) => {
            const previousAutoClear = renderer.autoClear
            renderer.autoClear = false
            renderer.clearDepth()
            renderer.render(scene, camera)
            renderer.autoClear = previousAutoClear
        },
        dispose: () => {
            window.removeEventListener("resize", handleResize)
            pixelRatioQuery?.removeEventListener("change", handlePixelRatioChange)
            listeners.length = 0
            scene.clear()
        },
    }
}
