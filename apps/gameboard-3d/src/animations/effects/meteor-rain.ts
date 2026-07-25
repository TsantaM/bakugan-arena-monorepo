import gsap from "gsap"
import * as THREE from "three"

export type MeteorRainColors = {
    /** Hot core (white / yellow). */
    core?: THREE.ColorRepresentation
    /** Mid flame body. */
    mid?: THREE.ColorRepresentation
    /** Cooler outer tip / rock. */
    tip?: THREE.ColorRepresentation
}

export type MeteorRainShape = {
    /** Number of meteors in the rain. */
    count?: number
    /** Horizontal spread around the impact. */
    spreadX?: number
    /** Depth spread around the impact. */
    spreadZ?: number
    /** Height above impact where meteors spawn. */
    fallHeight?: number
    sizeMin?: number
    sizeMax?: number
    /** How elongated the fireball trail looks. */
    stretchY?: number
}

export type MeteorRainOptions = {
    scene: THREE.Scene
    /** World-space impact point (typically the target bakugan). */
    position: THREE.Vector3
    colors?: MeteorRainColors
    shape?: MeteorRainShape
    /** Optional mesh/sprite to tint + shake on impacts. */
    impactTarget?: THREE.Object3D
    shakeAmount?: { x?: number; z?: number }
}

export type MeteorRainHandle = {
    group: THREE.Group
    done: Promise<void>
    dispose: () => void
}

const DEFAULT_SHAPE: Required<MeteorRainShape> = {
    count: 14,
    spreadX: 0.85,
    spreadZ: 0.85,
    fallHeight: 4.2,
    sizeMin: 0.12,
    sizeMax: 0.28,
    stretchY: 2.2,
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.geometry.dispose()
        const material = child.material as THREE.Material | THREE.Material[]
        if (Array.isArray(material)) {
            material.forEach((m) => m.dispose())
        } else {
            material.dispose()
        }
    })
}

function createMeteor(
    color: THREE.Color,
    size: number,
    stretchY: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 10, 10)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(0.7, stretchY, 0.7)
    return mesh
}

function createTrail(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size * 0.55, 8, 8)
    const material = new THREE.MeshBasicMaterial({
        color: color.clone().lerp(new THREE.Color(0xffffff), 0.25),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.scale.set(0.5, 1.8, 0.5)
    return mesh
}

function pickColor(
    colors: { core: THREE.Color; mid: THREE.Color; tip: THREE.Color },
    t: number,
): THREE.Color {
    if (t < 0.35) return colors.core.clone().lerp(colors.mid, t / 0.35)
    return colors.mid.clone().lerp(colors.tip, (t - 0.35) / 0.65)
}

/**
 * Rain of fiery meteors falling onto a world position.
 * Reusable for Pyrus (and other) impact abilities.
 */
export function playMeteorRain({
    scene,
    position,
    colors = {},
    shape = {},
    impactTarget,
    shakeAmount = { x: 0.1, z: 0.08 },
}: MeteorRainOptions): MeteorRainHandle {
    const cfg = { ...DEFAULT_SHAPE, ...shape }
    const palette = {
        core: new THREE.Color(colors.core ?? 0xfff1a8),
        mid: new THREE.Color(colors.mid ?? 0xff6a1a),
        tip: new THREE.Color(colors.tip ?? 0xb91c1c),
    }

    const group = new THREE.Group()
    group.position.copy(position)
    scene.add(group)

    type Meteor = {
        body: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        trail: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        landX: number
        landZ: number
        landY: number
        delay: number
        fallDuration: number
    }

    const meteors: Meteor[] = []

    for (let i = 0; i < cfg.count; i++) {
        const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)
        const color = pickColor(palette, Math.random())
        const body = createMeteor(color, size, cfg.stretchY * (0.8 + Math.random() * 0.4))
        const trail = createTrail(color, size)
        const landX = (Math.random() - 0.5) * cfg.spreadX * 2
        const landZ = (Math.random() - 0.5) * cfg.spreadZ * 2
        const landY = 0.05 + Math.random() * 0.15
        const startX = landX + (Math.random() - 0.5) * 1.2
        const startZ = landZ - (0.6 + Math.random() * 1.1)
        const startY = cfg.fallHeight * (0.75 + Math.random() * 0.4)

        body.position.set(startX, startY, startZ)
        trail.position.set(startX, startY + size * 1.2, startZ)
        body.scale.multiplyScalar(0.25)
        trail.scale.multiplyScalar(0.2)
        group.add(body)
        group.add(trail)

        meteors.push({
            body,
            trail,
            landX,
            landZ,
            landY,
            delay: Math.random() * 0.45,
            fallDuration: 0.35 + Math.random() * 0.3,
        })
    }

    const shakeOrigin = impactTarget?.position.clone()
    const tintMaterial =
        impactTarget instanceof THREE.Sprite
            ? (impactTarget.material as THREE.SpriteMaterial)
            : null
    const originalTint = tintMaterial?.color.clone() ?? null

    const done = new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve })

        if (tintMaterial && originalTint) {
            tl.to(
                tintMaterial.color,
                {
                    r: palette.mid.r,
                    g: palette.mid.g,
                    b: palette.mid.b,
                    duration: 0.25,
                    ease: "power1.out",
                },
                0.15,
            )
        }

        if (impactTarget && shakeOrigin) {
            tl.to(
                impactTarget.position,
                {
                    x: shakeOrigin.x + (shakeAmount.x ?? 0.1),
                    z: shakeOrigin.z + (shakeAmount.z ?? 0.08),
                    duration: 0.05,
                    yoyo: true,
                    repeat: 14,
                    ease: "power1.inOut",
                    delay: 0.25,
                },
                0,
            )
        }

        meteors.forEach(({ body, trail, landX, landZ, landY, delay, fallDuration }) => {
            tl.to(
                [body.material, trail.material],
                {
                    opacity: 0.95,
                    duration: 0.1,
                    ease: "power1.out",
                },
                delay,
            )

            tl.to(
                body.position,
                {
                    x: landX,
                    y: landY,
                    z: landZ,
                    duration: fallDuration,
                    ease: "power3.in",
                },
                delay,
            )
            tl.to(
                trail.position,
                {
                    x: landX,
                    y: landY + 0.25,
                    z: landZ,
                    duration: fallDuration,
                    ease: "power3.in",
                },
                delay,
            )

            tl.to(
                body.scale,
                {
                    x: 1,
                    y: cfg.stretchY,
                    z: 1,
                    duration: fallDuration * 0.7,
                    ease: "power1.out",
                },
                delay,
            )
            tl.to(
                trail.scale,
                {
                    x: 0.7,
                    y: 2.2,
                    z: 0.7,
                    duration: fallDuration * 0.7,
                    ease: "power1.out",
                },
                delay,
            )

            // Impact flash then fade
            const impactAt = delay + fallDuration
            tl.to(
                body.scale,
                {
                    x: 1.6,
                    y: 0.6,
                    z: 1.6,
                    duration: 0.12,
                    ease: "power2.out",
                },
                impactAt,
            )
            tl.to(
                [body.material, trail.material],
                {
                    opacity: 0,
                    duration: 0.28,
                    ease: "power1.in",
                },
                impactAt + 0.08,
            )
            tl.to(
                trail.scale,
                {
                    x: 0.1,
                    y: 0.2,
                    z: 0.1,
                    duration: 0.28,
                    ease: "power1.in",
                },
                impactAt + 0.08,
            )
        })

        if (tintMaterial && originalTint) {
            const lastImpact =
                Math.max(...meteors.map((m) => m.delay + m.fallDuration)) + 0.2
            tl.to(
                tintMaterial.color,
                {
                    r: originalTint.r,
                    g: originalTint.g,
                    b: originalTint.b,
                    duration: 0.35,
                    ease: "power1.inOut",
                },
                lastImpact,
            )
        }
    })

    const dispose = () => {
        meteors.forEach(({ body, trail }) => {
            gsap.killTweensOf(body.position)
            gsap.killTweensOf(body.scale)
            gsap.killTweensOf(body.material)
            gsap.killTweensOf(trail.position)
            gsap.killTweensOf(trail.scale)
            gsap.killTweensOf(trail.material)
        })
        if (impactTarget) {
            gsap.killTweensOf(impactTarget.position)
            if (shakeOrigin) impactTarget.position.copy(shakeOrigin)
        }
        if (tintMaterial && originalTint) {
            gsap.killTweensOf(tintMaterial.color)
            tintMaterial.color.copy(originalTint)
        }
        scene.remove(group)
        disposeObject(group)
    }

    return { group, done, dispose }
}
