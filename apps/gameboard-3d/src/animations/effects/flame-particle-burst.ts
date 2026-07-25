import gsap from "gsap"
import * as THREE from "three"

export type FlameParticleShape = {
    /** `radial` bloom (default) or a vertical `wall` sheet. */
    formation?: "radial" | "wall"
    /** Horizontal spread radius at the base (radial). */
    spread?: number
    /** Wall width along local X (wall formation). */
    wallWidth?: number
    /** Wall thickness along local Z (wall formation). */
    wallDepth?: number
    /** Max vertical rise of particles. */
    height?: number
    /** Number of flame particles. */
    count?: number
    /** Min particle scale. */
    sizeMin?: number
    /** Max particle scale. */
    sizeMax?: number
    /** How elongated vertically (1 = sphere-ish, >1 taller). */
    stretchY?: number
}

export type FlameParticleColors = {
    /** Hot core (usually near-white / yellow). */
    core?: THREE.ColorRepresentation
    /** Mid flame. */
    mid?: THREE.ColorRepresentation
    /** Outer / cooler tip. */
    tip?: THREE.ColorRepresentation
}

export type FlameParticleBurstOptions = {
    scene: THREE.Scene
    /** World position where the flame blooms. */
    position: THREE.Vector3
    colors?: FlameParticleColors
    shape?: FlameParticleShape
    /** Expand / bloom duration before fade. */
    expandDuration?: number
    /** Hold at full size. */
    holdDuration?: number
    /** Fade out duration. */
    fadeDuration?: number
}

export type FlameParticleBurstHandle = {
    group: THREE.Group
    /** Resolves when the burst animation finishes. */
    done: Promise<void>
    dispose: () => void
}

const DEFAULT_SHAPE: Required<FlameParticleShape> = {
    formation: "radial",
    spread: 0.55,
    wallWidth: 2.4,
    wallDepth: 0.35,
    height: 1.8,
    count: 42,
    sizeMin: 0.12,
    sizeMax: 0.38,
    stretchY: 1.65,
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

function createFlameParticle(
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
    mesh.scale.set(1, stretchY, 1)
    return mesh
}

function pickFlameColor(
    colors: { core: THREE.Color; mid: THREE.Color; tip: THREE.Color },
    t: number,
): THREE.Color {
    if (t < 0.35) return colors.core.clone().lerp(colors.mid, t / 0.35)
    return colors.mid.clone().lerp(colors.tip, (t - 0.35) / 0.65)
}

/**
 * Reusable flame particle burst.
 * Shape (spread / height / count / size) and colors are configurable for later variants.
 */
export function playFlameParticleBurst({
    scene,
    position,
    colors,
    shape,
    expandDuration = 0.45,
    holdDuration = 0.15,
    fadeDuration = 0.4,
}: FlameParticleBurstOptions): FlameParticleBurstHandle {
    const cfg = { ...DEFAULT_SHAPE, ...shape }
    const palette = {
        core: new THREE.Color(colors?.core ?? 0xfff2a8),
        mid: new THREE.Color(colors?.mid ?? 0xff6a1a),
        tip: new THREE.Color(colors?.tip ?? 0xb91c1c),
    }

    const group = new THREE.Group()
    group.position.copy(position)
    scene.add(group)

    const particles: Array<{
        mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        target: THREE.Vector3
        delay: number
    }> = []

    for (let i = 0; i < cfg.count; i++) {
        const t = i / Math.max(cfg.count - 1, 1)
        const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)
        const color = pickFlameColor(palette, Math.random())
        const mesh = createFlameParticle(color, size, cfg.stretchY)
        mesh.position.set(0, 0.05, 0)
        mesh.scale.set(0.15, 0.15 * cfg.stretchY, 0.15)
        group.add(mesh)

        let target: THREE.Vector3
        if (cfg.formation === "wall") {
            // Rise from the ground as a sheet: wide X, thin Z, tall Y
            const x = (Math.random() - 0.5) * cfg.wallWidth
            const z = (Math.random() - 0.5) * cfg.wallDepth
            const y = Math.random() * cfg.height * (0.35 + t * 0.85)
            target = new THREE.Vector3(x, y, z)
        } else {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * cfg.spread * (0.35 + t * 0.9)
            const y = Math.random() * cfg.height * (0.25 + t * 0.9)
            target = new THREE.Vector3(
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius,
            )
        }

        particles.push({
            mesh,
            target,
            delay: Math.random() * 0.12,
        })
    }

    const dispose = () => {
        for (const { mesh } of particles) {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.material)
        }
        scene.remove(group)
        disposeObject(group)
        particles.length = 0
    }

    const done = new Promise<void>((resolve) => {
        const tl = gsap.timeline({
            onComplete: () => resolve(),
        })

        for (const { mesh, target, delay } of particles) {
            tl.to(
                mesh.material,
                {
                    opacity: 0.85 + Math.random() * 0.15,
                    duration: expandDuration * 0.55,
                    ease: "power1.out",
                },
                delay,
            )
            tl.to(
                mesh.position,
                {
                    x: target.x,
                    y: target.y,
                    z: target.z,
                    duration: expandDuration,
                    ease: "power2.out",
                },
                delay,
            )
            tl.to(
                mesh.scale,
                {
                    x: 1,
                    y: cfg.stretchY,
                    z: 1,
                    duration: expandDuration,
                    ease: "power2.out",
                },
                delay,
            )
            tl.to(
                mesh.position,
                {
                    y: target.y + 0.25 + Math.random() * 0.35,
                    duration: holdDuration + fadeDuration,
                    ease: "power1.out",
                },
                delay + expandDuration,
            )
            tl.to(
                mesh.material,
                {
                    opacity: 0,
                    duration: fadeDuration,
                    ease: "power1.in",
                },
                delay + expandDuration + holdDuration,
            )
            tl.to(
                mesh.scale,
                {
                    x: 0.2,
                    y: 0.35,
                    z: 0.2,
                    duration: fadeDuration,
                    ease: "power1.in",
                },
                delay + expandDuration + holdDuration,
            )
        }
    })

    return { group, done, dispose }
}
