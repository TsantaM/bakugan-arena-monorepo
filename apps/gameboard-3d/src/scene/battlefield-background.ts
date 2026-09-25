import type { attribut } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../functions/get-attrubut-color"

export type BattlefieldBackgroundOptions = {
    /** Particles per galaxy (default 900 — 6 galaxies, one draw call each). */
    particlesPerGalaxy?: number
    /** Distance from the board where galaxies drift, in every direction. */
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
    velocity: THREE.Vector3
    /** Own spin, radians per second, around the disc normal. */
    spin: number
    /** Current spin angle. */
    spinAngle: number
    /** Fixed tilt so the disc is never perfectly face-on. */
    tilt: THREE.Quaternion
    /** Collision radius (visual radius + margin). */
    radius: number
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
    driftSpeed: 0.55,
}

/** What the camera frames, and what the galaxy discs turn toward. */
const BOARD_CENTER = new THREE.Vector3(0, 2, 0)

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

    // Each disc keeps its own tilt; the orientation itself is refreshed every
    // frame so a galaxy is never seen edge-on (it would read as a streak).
    const tilt = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
            (Math.random() - 0.5) * 0.9,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.9,
        ),
    )

    return {
        points,
        velocity: new THREE.Vector3(),
        spin: (Math.random() > 0.5 ? 1 : -1) * (0.015 + Math.random() * 0.02),
        spinAngle: Math.random() * Math.PI * 2,
        tilt,
        radius: GALAXY_RADIUS * 1.15,
    }
}

/**
 * Opening layout: the galaxies laid out on a circle around the board, facing
 * the camera, so the very first frame shows all six at once.
 *
 * The camera orientation is not read from its quaternion: at creation time
 * OrbitControls has not necessarily updated it yet. Every entry point frames
 * the board center, so the view direction is derived from that instead.
 */
function openingRingPositions(
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3,
    count: number,
    maxDistance: number,
): THREE.Vector3[] {
    const forward = target.clone().sub(camera.position).normalize()
    const right = forward.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
    const up = right.clone().cross(forward).normalize()

    // Neighbours on the ring must already clear the separation distance, or the
    // drift would break the circle apart on the very first frame.
    const separation = GALAXY_RADIUS * 1.15 * 2
    const radius = (separation * 1.08) / (2 * Math.sin(Math.PI / count))

    const halfV = THREE.MathUtils.degToRad(camera.fov) / 2
    const halfH = Math.atan(Math.tan(halfV) * camera.aspect)
    // 0.68 keeps the ring clear of the frame edges and of the player panels
    // overlaying the top corners.
    const angularRadius = Math.min(halfV, halfH) * 0.68

    // Far enough for the whole ring to fit in frame...
    let depth = radius / Math.tan(angularRadius)
    // ...but never past the shell the galaxies are allowed to drift in.
    const boardDistance = camera.position.length()
    const maxDepth = boardDistance + Math.sqrt(Math.max(maxDistance ** 2 - radius ** 2, 1))
    depth = Math.min(depth, maxDepth)

    const center = camera.position.clone().addScaledVector(forward, depth)

    return Array.from({ length: count }, (_, index) => {
        // Start at the top of the frame, then go clockwise.
        const angle = Math.PI / 2 - (index * Math.PI * 2) / count
        return center
            .clone()
            .addScaledVector(right, Math.cos(angle) * radius)
            .addScaledVector(up, Math.sin(angle) * radius)
    })
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

    // Opening frame: a circle of galaxies around the board, in attribute order.
    const ring = camera
        ? openingRingPositions(camera, BOARD_CENTER, ATTRIBUTS.length, maxDistance)
        : null

    ATTRIBUTS.forEach((attribut, index) => {
        const galaxy = createGalaxy(attribut, particlesPerGalaxy)

        if (ring) {
            galaxy.points.position.copy(ring[index])
        } else {
            // No camera to frame: spread them over the shell instead.
            const theta = (index * Math.PI * 2) / ATTRIBUTS.length
            const phi = Math.acos(2 * Math.random() - 1)
            const distance = minDistance + Math.random() * (maxDistance - minDistance)
            galaxy.points.position.set(
                Math.sin(phi) * Math.cos(theta) * distance,
                Math.cos(phi) * distance,
                Math.sin(phi) * Math.sin(theta) * distance,
            )
        }

        // From there they drift on their own, and separate if they ever meet.
        galaxy.velocity
            .set(Math.random() - 0.5, (Math.random() - 0.5) * 0.4, Math.random() - 0.5)
            .normalize()
            .multiplyScalar(driftSpeed * (0.6 + Math.random() * 0.8))

        galaxies.push(galaxy)
        group.add(galaxy.points)
    })

    const clock = new THREE.Clock()
    let frameId = 0
    let disposed = false
    const separation = new THREE.Vector3()

    // Scratch objects reused every frame — no per-frame allocation.
    const DISC_NORMAL = new THREE.Vector3(0, 1, 0)
    const facing = new THREE.Quaternion()
    const spinning = new THREE.Quaternion()
    const toCenter = new THREE.Vector3()
    const shellNormal = new THREE.Vector3()

    const update = () => {
        frameId = requestAnimationFrame(update)
        // Capped: a backgrounded tab resumes with a huge delta otherwise.
        const delta = Math.min(clock.getDelta(), 0.1)

        for (const galaxy of galaxies) {
            galaxy.points.position.addScaledVector(galaxy.velocity, delta)

            // Keep the disc turned toward the board, spinning on its own axis.
            galaxy.spinAngle += galaxy.spin * delta
            toCenter.subVectors(BOARD_CENTER, galaxy.points.position).normalize()
            facing.setFromUnitVectors(DISC_NORMAL, toCenter)
            spinning.setFromAxisAngle(DISC_NORMAL, galaxy.spinAngle)
            galaxy.points.quaternion.copy(facing).multiply(galaxy.tilt).multiply(spinning)

            const position = galaxy.points.position
            const distance = position.length()

            // Stay in the shell: never drift into the play area, never leave
            // the far plane — but anywhere around the board is fair game.
            if (distance < minDistance || distance > maxDistance) {
                const inward = distance < minDistance ? 1 : -1
                shellNormal.copy(position).normalize().multiplyScalar(inward)
                galaxy.velocity.reflect(shellNormal)
            }
        }

        // Pairwise separation — 15 checks per frame for 6 galaxies.
        for (let i = 0; i < galaxies.length; i++) {
            for (let j = i + 1; j < galaxies.length; j++) {
                const a = galaxies[i]
                const b = galaxies[j]
                separation.subVectors(b.points.position, a.points.position)

                const distance = separation.length()
                const minSeparation = a.radius + b.radius
                if (distance === 0 || distance >= minSeparation) continue

                separation.divideScalar(distance)
                const push = (minSeparation - distance) / 2
                a.points.position.addScaledVector(separation, -push)
                b.points.position.addScaledVector(separation, push)

                // Steer away from each other instead of bouncing hard.
                a.velocity.addScaledVector(separation, -driftSpeed * delta * 4)
                b.velocity.addScaledVector(separation, driftSpeed * delta * 4)
                a.velocity.clampLength(0, driftSpeed * 1.6)
                b.velocity.clampLength(0, driftSpeed * 1.6)
            }
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
