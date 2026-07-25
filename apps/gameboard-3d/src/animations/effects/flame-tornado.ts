import gsap from "gsap"
import * as THREE from "three"
import type { FlameParticleColors, FlameParticleShape } from "./flame-particle-burst"

export type FlameTornadoOptions = {
    scene: THREE.Scene
    from: THREE.Vector3
    to: THREE.Vector3
    colors?: FlameParticleColors
    shape?: Pick<
        FlameParticleShape,
        "count" | "sizeMin" | "sizeMax" | "stretchY" | "height" | "spread"
    >
    /** Time for the tornado column to form at the source. */
    formDuration?: number
    /** Time to travel from source to target. */
    travelDuration?: number
    /** How many full spins while traveling. */
    spins?: number
    /** Hold on the target before fading. */
    holdDuration?: number
    fadeDuration?: number
}

export type FlameTornadoHandle = {
    group: THREE.Group
    done: Promise<void>
    dispose: () => void
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
 * Spiral flame tornado that forms at `from`, travels to `to`, then fades.
 * Particle colors / density / size remain configurable via shared flame types.
 */
export function playFlameTornado({
    scene,
    from,
    to,
    colors,
    shape,
    formDuration = 0.35,
    travelDuration = 0.75,
    spins = 2.5,
    holdDuration = 0.15,
    fadeDuration = 0.35,
}: FlameTornadoOptions): FlameTornadoHandle {
    const count = shape?.count ?? 52
    const sizeMin = shape?.sizeMin ?? 0.12
    const sizeMax = shape?.sizeMax ?? 0.36
    const stretchY = shape?.stretchY ?? 1.8
    const height = shape?.height ?? 2.2
    const baseRadius = shape?.spread ?? 0.45

    const palette = {
        core: new THREE.Color(colors?.core ?? 0xfff2a8),
        mid: new THREE.Color(colors?.mid ?? 0xff6a1a),
        tip: new THREE.Color(colors?.tip ?? 0xb91c1c),
    }

    const group = new THREE.Group()
    group.position.copy(from)
    scene.add(group)

    type Particle = {
        mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        angle: number
        radius: number
        y: number
        spinSpeed: number
    }

    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
        const t = i / Math.max(count - 1, 1)
        // Narrower at the top for a tornado silhouette
        const radius = baseRadius * (1.15 - t * 0.75) * (0.7 + Math.random() * 0.45)
        const y = 0.1 + t * height * (0.85 + Math.random() * 0.2)
        const angle = Math.random() * Math.PI * 2
        const size = sizeMin + Math.random() * (sizeMax - sizeMin)
        const color = pickFlameColor(palette, Math.random())
        const mesh = createFlameParticle(color, size, stretchY)
        mesh.position.set(
            Math.cos(angle) * radius * 0.15,
            0.05,
            Math.sin(angle) * radius * 0.15,
        )
        mesh.scale.set(0.2, 0.2 * stretchY, 0.2)
        group.add(mesh)
        particles.push({
            mesh,
            angle,
            radius,
            y,
            spinSpeed: 1.2 + Math.random() * 1.4,
        })
    }

    const dispose = () => {
        for (const { mesh } of particles) {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.material)
        }
        gsap.killTweensOf(group.position)
        gsap.killTweensOf(group.rotation)
        scene.remove(group)
        disposeObject(group)
        particles.length = 0
    }

    const done = new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: () => resolve() })
        const state = { spin: 0 }

        // 1 — Form the column at the source
        for (const particle of particles) {
            const delay = Math.random() * 0.1
            tl.to(
                particle.mesh.material,
                {
                    opacity: 0.8 + Math.random() * 0.2,
                    duration: formDuration * 0.7,
                    ease: "power1.out",
                },
                delay,
            )
            tl.to(
                particle.mesh.position,
                {
                    x: Math.cos(particle.angle) * particle.radius,
                    y: particle.y,
                    z: Math.sin(particle.angle) * particle.radius,
                    duration: formDuration,
                    ease: "power2.out",
                },
                delay,
            )
            tl.to(
                particle.mesh.scale,
                {
                    x: 1,
                    y: stretchY,
                    z: 1,
                    duration: formDuration,
                    ease: "power2.out",
                },
                delay,
            )
        }

        // 2 — Travel + continuous spin
        const travelStart = formDuration
        tl.to(
            group.position,
            {
                x: to.x,
                y: to.y,
                z: to.z,
                duration: travelDuration,
                ease: "power1.inOut",
            },
            travelStart,
        )
        tl.to(
            state,
            {
                spin: spins * Math.PI * 2,
                duration: travelDuration + holdDuration,
                ease: "none",
                onUpdate: () => {
                    for (const particle of particles) {
                        const a = particle.angle + state.spin * particle.spinSpeed
                        particle.mesh.position.x = Math.cos(a) * particle.radius
                        particle.mesh.position.z = Math.sin(a) * particle.radius
                    }
                },
            },
            travelStart,
        )

        // 3 — Fade out on impact
        const fadeStart = travelStart + travelDuration + holdDuration
        for (const particle of particles) {
            tl.to(
                particle.mesh.material,
                {
                    opacity: 0,
                    duration: fadeDuration,
                    ease: "power1.in",
                },
                fadeStart,
            )
            tl.to(
                particle.mesh.scale,
                {
                    x: 0.15,
                    y: 0.25,
                    z: 0.15,
                    duration: fadeDuration,
                    ease: "power1.in",
                },
                fadeStart,
            )
        }
    })

    return { group, done, dispose }
}
