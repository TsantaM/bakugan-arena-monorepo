import gsap from "gsap"
import * as THREE from "three"

export type RockFallColors = {
    /** Main rock body. */
    rock?: THREE.ColorRepresentation
    /** Accent / highlight rock. */
    highlight?: THREE.ColorRepresentation
}

export type RockFallShape = {
    /** Number of falling rocks. */
    count?: number
    /** Horizontal spread around the impact (local X). */
    spreadX?: number
    /** Depth spread around the impact (local Z). */
    spreadZ?: number
    /** Height above the impact where rocks spawn. */
    fallHeight?: number
    /** Min rock scale. */
    sizeMin?: number
    /** Max rock scale. */
    sizeMax?: number
}

export type RockFallImpactOptions = {
    scene: THREE.Scene
    /** World-space impact point (typically the gate surface). */
    position: THREE.Vector3
    colors?: RockFallColors
    shape?: RockFallShape
    /** Optional mesh to shake when rocks land. */
    shakeTarget?: THREE.Object3D
    shakeAmount?: { x?: number; z?: number }
}

export type RockFallImpactHandle = {
    group: THREE.Group
    /** Resolves when all rocks have landed and faded. */
    done: Promise<void>
    dispose: () => void
}

const DEFAULT_SHAPE: Required<RockFallShape> = {
    count: 16,
    spreadX: 1.55,
    spreadZ: 2.15,
    fallHeight: 3.4,
    sizeMin: 0.14,
    sizeMax: 0.32,
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

function createRock(color: THREE.Color, size: number): THREE.Mesh {
    const geometry = new THREE.DodecahedronGeometry(size, 0)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color.clone().multiplyScalar(0.35),
        emissiveIntensity: 0.55,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
    })
    return new THREE.Mesh(geometry, material)
}

function pickColor(rock: THREE.Color, highlight: THREE.Color, t: number): THREE.Color {
    return t < 0.55 ? rock.clone() : highlight.clone()
}

/**
 * Spawns rocky debris high above a point and drops them onto the surface.
 * Reusable for Subterra (and other earth-themed) gate impacts.
 */
export function playRockFallImpact({
    scene,
    position,
    colors = {},
    shape = {},
    shakeTarget,
    shakeAmount = { x: 0.07, z: 0.07 },
}: RockFallImpactOptions): RockFallImpactHandle {
    const cfg = { ...DEFAULT_SHAPE, ...shape }
    const rockColor = new THREE.Color(colors.rock ?? 0x9a3412)
    const highlightColor = new THREE.Color(colors.highlight ?? 0xfbbf24)

    const group = new THREE.Group()
    group.position.copy(position)
    scene.add(group)

    type RockParticle = {
        mesh: THREE.Mesh
        landY: number
        delay: number
        fallDuration: number
    }

    const particles: RockParticle[] = []

    for (let i = 0; i < cfg.count; i++) {
        const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)
        const mesh = createRock(pickColor(rockColor, highlightColor, Math.random()), size)
        const landX = (Math.random() - 0.5) * cfg.spreadX * 2
        const landZ = (Math.random() - 0.5) * cfg.spreadZ * 2
        const landY = 0.08 + Math.random() * 0.12
        mesh.position.set(
            landX * (0.35 + Math.random() * 0.35),
            cfg.fallHeight * (0.75 + Math.random() * 0.45),
            landZ * (0.35 + Math.random() * 0.35),
        )
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
        )
        mesh.scale.setScalar(0.35 + Math.random() * 0.25)
        group.add(mesh)
        particles.push({
            mesh,
            landY,
            delay: Math.random() * 0.28,
            fallDuration: 0.35 + Math.random() * 0.28,
        })
        // Store intended landing XZ on userData for the tween
        mesh.userData.landX = landX
        mesh.userData.landZ = landZ
    }

    const shakeOrigin = shakeTarget?.position.clone()

    const done = new Promise<void>((resolve) => {
        const tl = gsap.timeline({
            onComplete: resolve,
        })

        if (shakeTarget && shakeOrigin) {
            tl.to(
                shakeTarget.position,
                {
                    x: shakeOrigin.x + (shakeAmount.x ?? 0.07),
                    z: shakeOrigin.z + (shakeAmount.z ?? 0.07),
                    duration: 0.06,
                    yoyo: true,
                    repeat: 9,
                    ease: "power1.inOut",
                    delay: 0.2,
                },
                0,
            )
        }

        particles.forEach(({ mesh, landY, delay, fallDuration }, index) => {
            const landX = mesh.userData.landX as number
            const landZ = mesh.userData.landZ as number

            tl.to(
                mesh.material,
                {
                    opacity: 0.98,
                    duration: 0.12,
                    ease: "power1.out",
                },
                delay,
            )

            tl.to(
                mesh.position,
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
                mesh.rotation,
                {
                    x: `+=${Math.PI * (0.6 + Math.random())}`,
                    y: `+=${Math.PI * (0.4 + Math.random())}`,
                    z: `+=${Math.PI * (0.5 + Math.random())}`,
                    duration: fallDuration,
                    ease: "power1.in",
                },
                delay,
            )

            tl.to(
                mesh.scale,
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: fallDuration * 0.85,
                    ease: "power1.out",
                },
                delay,
            )

            // Small bounce on impact
            const bounceAt = delay + fallDuration
            tl.to(
                mesh.position,
                {
                    y: landY + 0.18 + Math.random() * 0.12,
                    duration: 0.1,
                    ease: "power1.out",
                    yoyo: true,
                    repeat: 1,
                },
                bounceAt,
            )

            // Fade / settle after landing
            tl.to(
                mesh.material,
                {
                    opacity: 0,
                    duration: 0.35,
                    ease: "power1.in",
                },
                bounceAt + 0.18 + index * 0.01,
            )
            tl.to(
                mesh.position,
                {
                    y: landY - 0.05,
                    duration: 0.35,
                    ease: "power1.in",
                },
                bounceAt + 0.18 + index * 0.01,
            )
        })
    })

    const dispose = () => {
        particles.forEach(({ mesh }) => {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.rotation)
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.material)
        })
        if (shakeTarget) {
            gsap.killTweensOf(shakeTarget.position)
            if (shakeOrigin) shakeTarget.position.copy(shakeOrigin)
        }
        scene.remove(group)
        disposeObject(group)
    }

    return { group, done, dispose }
}
