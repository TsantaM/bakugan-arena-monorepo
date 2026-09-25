import type { attribut } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../functions/get-attrubut-color"

export type BattlefieldBackgroundOptions = {
    /** Particles per galaxy (default 900 — 6 galaxies, one draw call each). */
    particlesPerGalaxy?: number
    /** Bounds the galaxies must stay within, measured from the board. */
    minDistance?: number
    maxDistance?: number
    /** Drift speed in world units per second. */
    driftSpeed?: number
    /**
     * Camera of the scene. When given, the galaxies are laid out inside its
     * opening view so the first frame already shows most of them.
     */
    camera?: THREE.PerspectiveCamera
}

export type BattlefieldBackgroundHandle = {
    group: THREE.Group
    /** Fades the galaxies out (an environment animation takes over). */
    hide: (duration?: number) => Promise<void>
    /** Brings the galaxies back. */
    show: (duration?: number) => Promise<void>
    dispose: () => void
}

type Galaxy = {
    points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
    /**
     * Position in the view frame: x/y across the screen, z = depth from the
     * camera. Orthonormal frame, so distances are the same as in world space.
     */
    view: THREE.Vector3
    velocity: THREE.Vector3
    /** Own spin, radians per second, around the disc normal. */
    spin: number
    /** Current spin angle. */
    spinAngle: number
    /** Fixed orientation of the disc, from face-on to almost flat. */
    orientation: THREE.Quaternion
    /** Collision radius (visual radius + margin). */
    radius: number
}

/**
 * The slice of space the galaxies live in: the opening view cone, between two
 * depths. They wander freely inside it and bounce on its walls, so they always
 * stay on screen — and always behind the board.
 */
type ViewRegion = {
    origin: THREE.Vector3
    right: THREE.Vector3
    up: THREE.Vector3
    forward: THREE.Vector3
    depthMin: number
    depthMax: number
    /** Half-width / half-height of the usable frame, per unit of depth. */
    spreadH: number
    spreadV: number
}

/**
 * Opening order around the ring, clockwise from the top of the frame.
 * Also the creation order, so `galaxies[i]` matches the ring slot i.
 */
const ATTRIBUTS: attribut[] = ["Pyrus", "Subterra", "Haos", "Darkus", "Aquos", "Ventus"]

/** Camera far plane is 100: everything must stay well inside it. */
const DEFAULTS = {
    particlesPerGalaxy: 900,
    // Galaxies drift anywhere on a shell around the board — above, beside, and
    // below it. `minDistance` keeps them out of the play area (and, with the
    // camera dolly capped by `applyBoardCameraLimits`, always behind the gate
    // cards); `maxDistance` keeps them inside the camera far plane (100).
    minDistance: 28,
    maxDistance: 62,
    driftSpeed: 0.7,
}

/** What the camera frames, and what the galaxy discs turn toward. */
const BOARD_CENTER = new THREE.Vector3(0, 2, 0)

/** Opening view of every entry point, used when no camera is passed. */
/** Local normal of a galaxy disc (it lies in its own XZ plane). */
const DISC_NORMAL = new THREE.Vector3(0, 1, 0)

const DEFAULT_VIEW_CAMERA = (() => {
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 100)
    camera.position.set(3, 5, 8)
    return camera
})()

/**
 * How much of the frame the galaxy centers may use. Below 1 they never reach
 * the edge, so a galaxy is never off screen — the wandering used to take them
 * out of frame and leave the sky empty.
 */
const FRAME_USAGE = 0.56

/**
 * Widest a disc may lean away from facing the camera. Near 0 it is seen
 * face-on, near the max almost edge-on — like the board itself.
 */
const DISC_LEAN_MAX = THREE.MathUtils.degToRad(74)

const GALAXY_RADIUS = 10
const GALAXY_ARMS = 3
const GALAXY_TWIST = 0.9
const GALAXY_THICKNESS = 1.1

/** One background per scene, so a scene.clear() + re-create never leaks. */
const backgrounds = new WeakMap<THREE.Scene, BattlefieldBackgroundHandle>()

/** Soft round sprite, built once in a canvas (no extra HTTP request). */
let particleTexture: THREE.Texture | null = null
function getParticleTexture(): THREE.Texture {
    if (particleTexture) return particleTexture

    const size = 64
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
        gradient.addColorStop(0, "rgba(255,255,255,1)")
        gradient.addColorStop(0.35, "rgba(255,255,255,0.55)")
        gradient.addColorStop(1, "rgba(255,255,255,0)")
        context.fillStyle = gradient
        context.fillRect(0, 0, size, size)
    }

    particleTexture = new THREE.CanvasTexture(canvas)
    particleTexture.colorSpace = THREE.SRGBColorSpace
    return particleTexture
}

/** Gaussian-ish noise in [-1, 1], denser around 0. */
function noise(): number {
    return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

function createGalaxy(attribut: attribut, particleCount: number): Galaxy {
    const edgeColor = new THREE.Color(getAttributColor(attribut))
    const coreColor = edgeColor.clone().lerp(new THREE.Color(0xffffff), 0.8)

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
        // sqrt keeps the core denser than the rim
        const distance = Math.sqrt(Math.random()) * GALAXY_RADIUS
        const arm = (i % GALAXY_ARMS) * ((Math.PI * 2) / GALAXY_ARMS)
        const angle = arm + distance * GALAXY_TWIST + noise() * 0.35

        const spreadFactor = 0.25 + distance / GALAXY_RADIUS
        const index = i * 3
        positions[index] = Math.cos(angle) * distance + noise() * spreadFactor
        positions[index + 1] =
            noise() * GALAXY_THICKNESS * (1 - distance / GALAXY_RADIUS / 1.4)
        positions[index + 2] = Math.sin(angle) * distance + noise() * spreadFactor

        const color = coreColor.clone().lerp(edgeColor, distance / GALAXY_RADIUS)
        colors[index] = color.r
        colors[index + 1] = color.g
        colors[index + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
        size: 0.75,
        sizeAttenuation: true,
        map: getParticleTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    points.frustumCulled = true
    points.renderOrder = -2

    return {
        points,
        view: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        orientation: new THREE.Quaternion(),
        radius: GALAXY_RADIUS * 1.15,
        spin: (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.02),
        spinAngle: Math.random() * Math.PI * 2,
    }
}

/**
 * The slice of space the galaxies live in, built from the opening view.
 *
 * The camera orientation is not read from its quaternion: at creation time
 * OrbitControls has not necessarily updated it yet. Every entry point frames
 * the board center, so the view direction is derived from that instead.
 */
function buildViewRegion(
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3,
    minDistance: number,
    maxDistance: number,
): ViewRegion {
    const forward = target.clone().sub(camera.position).normalize()
    const right = forward.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
    const up = right.clone().cross(forward).normalize()

    const halfV = THREE.MathUtils.degToRad(camera.fov) / 2
    const halfH = Math.atan(Math.tan(halfV) * camera.aspect)

    // Depths are measured from the camera; the bounds keep every galaxy out of
    // the play area (and behind the board, the dolly being capped at 24) while
    // staying inside the camera far plane.
    const boardDistance = camera.position.distanceTo(target)

    return {
        origin: camera.position.clone(),
        right,
        up,
        forward,
        depthMin: boardDistance + minDistance,
        depthMax: boardDistance + maxDistance,
        spreadH: Math.tan(halfH) * FRAME_USAGE,
        spreadV: Math.tan(halfV) * FRAME_USAGE,
    }
}

/**
 * Deep-space battlefield background: six attribute-colored galaxies slowly
 * drifting around the board on a black sky, never overlapping.
 *
 * Replaces the tiled floor plane. Self-driven (own rAF), so entry points only
 * have to create it; `playAttributeEnvironmentShift` fades it out while an
 * elementary gate takes over the environment.
 */
export function createBattlefieldBackground(
    scene: THREE.Scene,
    options: BattlefieldBackgroundOptions = {},
): BattlefieldBackgroundHandle {
    // A scene may be rebuilt (scene.clear()) — never keep two backgrounds alive.
    backgrounds.get(scene)?.dispose()

    const {
        particlesPerGalaxy = DEFAULTS.particlesPerGalaxy,
        minDistance = DEFAULTS.minDistance,
        maxDistance = DEFAULTS.maxDistance,
        driftSpeed = DEFAULTS.driftSpeed,
        camera,
    } = options

    scene.background = new THREE.Color(0x000000)

    const group = new THREE.Group()
    group.name = "battlefield-background"
    scene.add(group)

    const galaxies: Galaxy[] = []
    const region = buildViewRegion(
        camera ?? DEFAULT_VIEW_CAMERA,
        BOARD_CENTER,
        minDistance,
        maxDistance,
    )

    const leanAxis = new THREE.Vector3()
    const facingCamera = new THREE.Quaternion()
    const lean = new THREE.Quaternion()

    /**
     * One lean stratum per galaxy, shuffled: the range face-on → almost flat is
     * always covered, but never by the same attribute twice in a row.
     */
    const leanStrata = ATTRIBUTS.map((_, index) => index)
    /** Same idea for depth: one galaxy in the foreground, one far back, etc. */
    const depthStrata = ATTRIBUTS.map((_, index) => index)
    for (let i = ATTRIBUTS.length - 1; i > 0; i--) {
        const a = Math.floor(Math.random() * (i + 1))
        ;[leanStrata[i], leanStrata[a]] = [leanStrata[a], leanStrata[i]]
        const b = Math.floor(Math.random() * (i + 1))
        ;[depthStrata[i], depthStrata[b]] = [depthStrata[b], depthStrata[i]]
    }

    ATTRIBUTS.forEach((attribut, index) => {
        const galaxy = createGalaxy(attribut, particlesPerGalaxy)

        // Depth stratum: spread over the whole range instead of clustering, so
        // some galaxies really do open in the foreground.
        const depthRatio = (depthStrata[index] + Math.random()) / ATTRIBUTS.length
        const depth = region.depthMin + depthRatio * (region.depthMax - region.depthMin)

        for (let attempt = 0; attempt < 30; attempt++) {
            galaxy.view.set(
                (Math.random() * 2 - 1) * region.spreadH * depth,
                (Math.random() * 2 - 1) * region.spreadV * depth,
                depth,
            )

            const overlaps = galaxies.some(
                (other) => other.view.distanceTo(galaxy.view) < other.radius + galaxy.radius,
            )
            if (!overlaps) break
        }

        galaxy.velocity
            .set(Math.random() - 0.5, (Math.random() - 0.5) * 0.7, Math.random() - 0.5)
            .normalize()
            .multiplyScalar(driftSpeed * (0.5 + Math.random()))

        // Orientation: start face-on to the camera, then lean by a random angle
        // around a random axis of the view plane — face-on, almost flat, or
        // anywhere in between, the way the board itself is seen.
        facingCamera.setFromUnitVectors(DISC_NORMAL, region.forward.clone().negate())

        const leanDirection = Math.random() * Math.PI * 2
        leanAxis
            .copy(region.right)
            .multiplyScalar(Math.cos(leanDirection))
            .addScaledVector(region.up, Math.sin(leanDirection))
            .normalize()
        const leanRatio = (leanStrata[index] + Math.random()) / ATTRIBUTS.length
        lean.setFromAxisAngle(leanAxis, leanRatio * DISC_LEAN_MAX)

        galaxy.orientation.copy(lean).multiply(facingCamera)

        galaxies.push(galaxy)
        group.add(galaxy.points)
    })

    const clock = new THREE.Clock()
    let frameId = 0
    let disposed = false

    // Scratch objects reused every frame — no per-frame allocation.
    const spinning = new THREE.Quaternion()
    const separation = new THREE.Vector3()

    /** Keeps a galaxy inside the region, bouncing it back when it reaches a wall. */
    const confine = (galaxy: Galaxy) => {
        const { view, velocity } = galaxy

        if (view.z < region.depthMin) {
            view.z = region.depthMin
            velocity.z = Math.abs(velocity.z)
        } else if (view.z > region.depthMax) {
            view.z = region.depthMax
            velocity.z = -Math.abs(velocity.z)
        }

        // The usable frame widens with depth, so the walls are recomputed here.
        const limitX = region.spreadH * view.z
        const limitY = region.spreadV * view.z

        if (view.x < -limitX) {
            view.x = -limitX
            velocity.x = Math.abs(velocity.x)
        } else if (view.x > limitX) {
            view.x = limitX
            velocity.x = -Math.abs(velocity.x)
        }

        if (view.y < -limitY) {
            view.y = -limitY
            velocity.y = Math.abs(velocity.y)
        } else if (view.y > limitY) {
            view.y = limitY
            velocity.y = -Math.abs(velocity.y)
        }
    }

    const update = () => {
        frameId = requestAnimationFrame(update)
        // Capped: a backgrounded tab resumes with a huge delta otherwise.
        const delta = Math.min(clock.getDelta(), 0.1)

        for (const galaxy of galaxies) {
            galaxy.view.addScaledVector(galaxy.velocity, delta)
            confine(galaxy)
        }

        // Pairwise separation — 15 checks per frame for 6 galaxies. Distances
        // are Euclidean in the view frame, so this works there directly.
        for (let i = 0; i < galaxies.length; i++) {
            for (let j = i + 1; j < galaxies.length; j++) {
                const a = galaxies[i]
                const b = galaxies[j]
                separation.subVectors(b.view, a.view)

                const distance = separation.length()
                const minSeparation = a.radius + b.radius
                if (distance === 0 || distance >= minSeparation) continue

                separation.divideScalar(distance)
                const push = (minSeparation - distance) / 2
                a.view.addScaledVector(separation, -push)
                b.view.addScaledVector(separation, push)

                // Steer away from each other instead of bouncing hard.
                a.velocity.addScaledVector(separation, -driftSpeed * delta * 4)
                b.velocity.addScaledVector(separation, driftSpeed * delta * 4)
                a.velocity.clampLength(0, driftSpeed * 1.6)
                b.velocity.clampLength(0, driftSpeed * 1.6)

                confine(a)
                confine(b)
            }
        }

        for (const galaxy of galaxies) {
            galaxy.points.position
                .copy(region.origin)
                .addScaledVector(region.right, galaxy.view.x)
                .addScaledVector(region.up, galaxy.view.y)
                .addScaledVector(region.forward, galaxy.view.z)

            // The disc keeps the orientation it was born with, spinning around
            // its own normal.
            galaxy.spinAngle += galaxy.spin * delta
            spinning.setFromAxisAngle(DISC_NORMAL, galaxy.spinAngle)
            galaxy.points.quaternion.copy(galaxy.orientation).multiply(spinning)
        }
    }

    frameId = requestAnimationFrame(update)

    const fade = (opacity: number, duration: number) =>
        new Promise<void>((resolve) => {
            if (disposed) return resolve()
            gsap.to(
                galaxies.map((galaxy) => galaxy.points.material),
                {
                    opacity,
                    duration,
                    ease: "power2.inOut",
                    overwrite: true,
                    onComplete: () => resolve(),
                },
            )
        })

    const handle: BattlefieldBackgroundHandle = {
        group,
        hide: (duration = 0.8) => fade(0, duration),
        show: (duration = 0.8) => fade(1, duration),
        dispose: () => {
            if (disposed) return
            disposed = true
            cancelAnimationFrame(frameId)
            for (const galaxy of galaxies) {
                gsap.killTweensOf(galaxy.points.material)
                galaxy.points.geometry.dispose()
                galaxy.points.material.dispose()
            }
            group.removeFromParent()
            group.clear()
            if (backgrounds.get(scene) === handle) backgrounds.delete(scene)
        },
    }

    backgrounds.set(scene, handle)
    return handle
}

/** The background currently attached to a scene, if any. */
export function getBattlefieldBackground(
    scene: THREE.Scene,
): BattlefieldBackgroundHandle | undefined {
    return backgrounds.get(scene)
}
