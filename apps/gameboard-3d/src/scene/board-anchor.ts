import * as THREE from "three"

export type BoardAnchorOptions = {
    /** Width of the glow, in board units (the board itself is 12 x 12). */
    size?: number
    /** Glow color. */
    color?: THREE.ColorRepresentation
    /** Seconds for one full breath of the glow. */
    breathSeconds?: number
}

export type BoardAnchorHandle = {
    group: THREE.Group
    update: (delta: number) => void
    dispose: () => void
}

const DEFAULTS = {
    size: 34,
    color: 0x5bc8ff,
    breathSeconds: 7,
}

/**
 * Just under the board plane (y = 0) and just above the legacy floor plane
 * (y = -0.01), so the glow reads correctly whichever background is active.
 */
const ANCHOR_HEIGHT = -0.005

const OPACITY_BASE = 0.5
const OPACITY_BREATH = 0.12

/** Radial gradient, built once in a canvas — no extra HTTP request. */
function createGlowTexture(color: THREE.Color): THREE.Texture {
    const size = 256
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext("2d")
    if (context) {
        const gradient = context.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2,
        )
        const rgb = `${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}`
        // Bright core, long soft tail: the board should look lit from under,
        // not sitting on a disc.
        gradient.addColorStop(0, `rgba(${rgb}, 0.85)`)
        gradient.addColorStop(0.25, `rgba(${rgb}, 0.38)`)
        gradient.addColorStop(0.55, `rgba(${rgb}, 0.12)`)
        gradient.addColorStop(1, `rgba(${rgb}, 0)`)
        context.fillStyle = gradient
        context.fillRect(0, 0, size, size)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

/**
 * Grounds the board in the void: a soft halo under it, so it reads as a lit
 * object in space instead of a shape cut out of the black.
 *
 * One draw call, one transform update per frame.
 */
export function createBoardAnchor(
    scene: THREE.Scene,
    options: BoardAnchorOptions = {},
): BoardAnchorHandle {
    const {
        size = DEFAULTS.size,
        color = DEFAULTS.color,
        breathSeconds = DEFAULTS.breathSeconds,
    } = options

    const glowColor = new THREE.Color(color)
    const texture = createGlowTexture(glowColor)

    const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: OPACITY_BASE,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }),
    )
    glow.rotation.x = -Math.PI / 2
    glow.position.y = ANCHOR_HEIGHT
    // Behind the cards, in front of the sky.
    glow.renderOrder = -1

    const group = new THREE.Group()
    group.name = "board-anchor"
    group.add(glow)
    scene.add(group)

    let elapsed = 0

    return {
        group,
        update: (delta) => {
            elapsed += delta
            // Slow breath so the board feels alive rather than lit by a decal.
            const breath = Math.sin((elapsed / breathSeconds) * Math.PI * 2)
            glow.material.opacity = OPACITY_BASE + breath * OPACITY_BREATH
            const scale = 1 + breath * 0.02
            glow.scale.set(scale, scale, 1)
        },
        dispose: () => {
            glow.geometry.dispose()
            glow.material.dispose()
            texture.dispose()
            group.removeFromParent()
            group.clear()
        },
    }
}
