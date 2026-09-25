import * as THREE from "three"

export type StarfieldOptions = {
    /** Total number of stars, split over the three size layers. */
    count?: number
    /**
     * Radius of the shell the stars sit on. Must leave room for the camera
     * dolly inside the far plane (100).
     */
    radius?: number
    /** Seconds for one full rotation of the whole sky. */
    rotationSeconds?: number
}

export type StarfieldHandle = {
    group: THREE.Group
    update: (delta: number) => void
    dispose: () => void
}

const DEFAULTS = {
    count: 3000,
    radius: 70,
    rotationSeconds: 1200,
}

/**
 * Size (in device pixels) and share of the total count, per layer. Three layers
 * is how the stars get varied sizes while staying at three draw calls:
 * `PointsMaterial` has a single size for the whole object.
 */
const LAYERS = [
    { size: 1.2, share: 0.6, twinklePeriod: 7.3, twinkleAmount: 0.1 },
    { size: 1.9, share: 0.3, twinklePeriod: 5.1, twinkleAmount: 0.07 },
    { size: 2.8, share: 0.1, twinklePeriod: 9.7, twinkleAmount: 0.05 },
]

/** Cold to warm white, the way real star colors read on screen. */
const STAR_TINTS = [
    new THREE.Color(0xbfd4ff),
    new THREE.Color(0xffffff),
    new THREE.Color(0xfff1d0),
    new THREE.Color(0xffd9b0),
]

function createLayer(count: number, radius: number, size: number): THREE.Points {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
        // Uniform on the sphere: the sky is covered evenly whatever the camera
        // is pointing at, with no clustering at the poles.
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const index = i * 3

        positions[index] = Math.sin(phi) * Math.cos(theta) * radius
        positions[index + 1] = Math.cos(phi) * radius
        positions[index + 2] = Math.sin(phi) * Math.sin(theta) * radius

        // Most stars are faint; a few are bright.
        const brightness = 0.35 + Math.random() ** 2 * 0.65
        color.copy(STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)])
        colors[index] = color.r * brightness
        colors[index + 1] = color.g * brightness
        colors[index + 2] = color.b * brightness
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
        // Stars keep the same on-screen size whatever their distance.
        sizeAttenuation: false,
        size: size * Math.min(window.devicePixelRatio || 1, 2),
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    // Behind the galaxies, which are themselves behind the board.
    points.renderOrder = -3
    points.frustumCulled = false
    return points
}

/**
 * Star shell around the board: random positions over the whole sphere, so the
 * sky is filled wherever the camera looks, with a very slow rotation and a
 * light twinkle.
 *
 * Three draw calls, no per-frame CPU work on the points themselves.
 */
export function createStarfield(
    scene: THREE.Scene,
    options: StarfieldOptions = {},
): StarfieldHandle {
    const {
        count = DEFAULTS.count,
        radius = DEFAULTS.radius,
        rotationSeconds = DEFAULTS.rotationSeconds,
    } = options

    const group = new THREE.Group()
    group.name = "starfield"

    const layers = LAYERS.map((layer) => {
        const points = createLayer(Math.round(count * layer.share), radius, layer.size)
        group.add(points)
        return { points, config: layer, phase: Math.random() * Math.PI * 2 }
    })

    scene.add(group)

    const rotationSpeed = (Math.PI * 2) / Math.max(rotationSeconds, 1)
    let elapsed = 0

    return {
        group,
        update: (delta) => {
            elapsed += delta
            group.rotation.y += rotationSpeed * delta

            // Each layer breathes on its own period, so the sky never blinks
            // as one block.
            for (const layer of layers) {
                const { twinklePeriod, twinkleAmount } = layer.config
                const material = layer.points.material as THREE.PointsMaterial
                material.opacity =
                    1 - twinkleAmount +
                    twinkleAmount * Math.sin((elapsed / twinklePeriod) * Math.PI * 2 + layer.phase)
            }
        },
        dispose: () => {
            for (const layer of layers) {
                layer.points.geometry.dispose()
                ;(layer.points.material as THREE.PointsMaterial).dispose()
            }
            group.removeFromParent()
            group.clear()
        },
    }
}
