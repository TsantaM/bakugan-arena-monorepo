import gsap from "gsap"
import * as THREE from "three"

export type WindTornadoColors = {
    /** Bright inner wind (near-white / pale green). */
    core?: THREE.ColorRepresentation
    /** Mid Ventus green. */
    mid?: THREE.ColorRepresentation
    /** Outer cooler tip. */
    tip?: THREE.ColorRepresentation
}

export type WindTornadoShape = {
    /** Number of wind wisps. */
    count?: number
    /** Column height. */
    height?: number
    /** Base radius (wider at bottom). */
    spread?: number
    sizeMin?: number
    sizeMax?: number
    /** Vertical elongation of each wisp. */
    stretchY?: number
}

export type WindTornadoOptions = {
    scene: THREE.Scene
    /** Where the tornado forms. */
    position: THREE.Vector3
    /** Optional travel destination; omit to stay in place. */
    to?: THREE.Vector3
    colors?: WindTornadoColors
    shape?: WindTornadoShape
    formDuration?: number
    /** Spin / hold time after forming (and during travel if `to` is set). */
    holdDuration?: number
    /** Travel duration when `to` is provided. */
    travelDuration?: number
    /** Full rotations during hold (+ travel). */
    spins?: number
    fadeDuration?: number
}

export type WindTornadoHandle = {
    group: THREE.Group
    done: Promise<void>
    dispose: () => void
}

const DEFAULT_SHAPE: Required<WindTornadoShape> = {
    count: 64,
    height: 2.4,
    spread: 0.55,
    sizeMin: 0.06,
    sizeMax: 0.18,
    stretchY: 2.4,
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

function createWindWisp(
    color: THREE.Color,
    size: number,
    stretchY: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 8, 8)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    // Stretch into a wind streak
    mesh.scale.set(0.45, stretchY, 0.45)
    return mesh
}

function pickWindColor(
    colors: { core: THREE.Color; mid: THREE.Color; tip: THREE.Color },
    t: number,
): THREE.Color {
    if (t < 0.4) return colors.core.clone().lerp(colors.mid, t / 0.4)
    return colors.mid.clone().lerp(colors.tip, (t - 0.4) / 0.6)
}

/**
 * Spiraling wind tornado. Forms at `position`, optionally travels to `to`, then fades.
 * Tunable colors / density for Ventus (and other wind-themed) abilities.
 */
export function playWindTornado({
    scene,
    position,
    to,
    colors,
    shape,
    formDuration = 0.4,
    holdDuration = 0.45,
    travelDuration = 0.7,
    spins = 3.5,
    fadeDuration = 0.35,
}: WindTornadoOptions): WindTornadoHandle {
    const cfg = { ...DEFAULT_SHAPE, ...shape }

    const palette = {
        core: new THREE.Color(colors?.core ?? 0xdcfce7),
        mid: new THREE.Color(colors?.mid ?? 0x22c55e),
        tip: new THREE.Color(colors?.tip ?? 0x166534),
    }

    const group = new THREE.Group()
    group.position.copy(position)
    scene.add(group)

    type Particle = {
        mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
        angle: number
        radius: number
        y: number
        spinSpeed: number
        verticalDrift: number
    }

    const particles: Particle[] = []

    for (let i = 0; i < cfg.count; i++) {
        const t = i / Math.max(cfg.count - 1, 1)
        // Narrower at the top — classic tornado silhouette
        const radius = cfg.spread * (1.2 - t * 0.8) * (0.65 + Math.random() * 0.5)
        const y = 0.08 + t * cfg.height * (0.85 + Math.random() * 0.2)
        const angle = Math.random() * Math.PI * 2
        const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)
        const mesh = createWindWisp(
            pickWindColor(palette, Math.random()),
            size,
            cfg.stretchY * (0.75 + Math.random() * 0.5),
        )
        mesh.position.set(
            Math.cos(angle) * radius * 0.1,
            0.04,
            Math.sin(angle) * radius * 0.1,
        )
        mesh.scale.set(0.15, 0.2, 0.15)
        group.add(mesh)
        particles.push({
            mesh,
            angle,
            radius,
            y,
            spinSpeed: 1.4 + Math.random() * 1.8,
            verticalDrift: (Math.random() - 0.5) * 0.15,
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

    const destination = to ?? position.clone()
    const travels = Boolean(to) && destination.distanceTo(position) > 0.02
    const motionDuration = travels ? travelDuration + holdDuration : holdDuration

    const done = new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: () => resolve() })
        const state = { spin: 0 }

        // 1 — Form the wind column
        for (const particle of particles) {
            const delay = Math.random() * 0.12
            const stretch = particle.mesh.scale.y || cfg.stretchY
            tl.to(
                particle.mesh.material,
                {
                    opacity: 0.55 + Math.random() * 0.35,
                    duration: formDuration * 0.65,
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
                    x: 0.45,
                    y: stretch,
                    z: 0.45,
                    duration: formDuration,
                    ease: "power2.out",
                },
                delay,
            )
        }

        // 2 — Continuous spin (+ optional travel)
        const motionStart = formDuration
        if (travels) {
            tl.to(
                group.position,
                {
                    x: destination.x,
                    y: destination.y,
                    z: destination.z,
                    duration: travelDuration,
                    ease: "power1.inOut",
                },
                motionStart,
            )
        }

        tl.to(
            state,
            {
                spin: spins * Math.PI * 2,
                duration: motionDuration,
                ease: "none",
                onUpdate: () => {
                    for (const particle of particles) {
                        const a = particle.angle + state.spin * particle.spinSpeed
                        particle.mesh.position.x = Math.cos(a) * particle.radius
                        particle.mesh.position.z = Math.sin(a) * particle.radius
                        particle.mesh.position.y =
                            particle.y +
                            Math.sin(state.spin * 1.5 + particle.angle) * particle.verticalDrift
                    }
                },
            },
            motionStart,
        )

        // 3 — Fade out
        const fadeStart = motionStart + motionDuration
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
                    x: 0.1,
                    y: 0.2,
                    z: 0.1,
                    duration: fadeDuration,
                    ease: "power1.in",
                },
                fadeStart,
            )
        }
    })

    return { group, done, dispose }
}
