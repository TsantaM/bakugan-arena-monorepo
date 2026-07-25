import gsap from "gsap"
import * as THREE from "three"

export type AttributeAuraColors = {
    core?: THREE.ColorRepresentation
    mid?: THREE.ColorRepresentation
    tip?: THREE.ColorRepresentation
}

export type AttributeAuraShape = {
    /** Number of aura particles (default denser for a covering look). */
    count?: number
    sizeMin?: number
    sizeMax?: number
    /** Shell radius around the bakugan. */
    radius?: number
    /** Vertical span of the aura. */
    height?: number
}

export type AttributeAuraBurstOptions = {
    scene: THREE.Scene
    /** World position of the bakugan to cover. */
    position: THREE.Vector3
    colors?: AttributeAuraColors
    shape?: AttributeAuraShape
    expandDuration?: number
    holdDuration?: number
    fadeDuration?: number
    /** Optional bakugan sprite to tint while the aura is active. */
    tintTarget?: THREE.Sprite
}

export type AttributeAuraBurstHandle = {
    group: THREE.Group
    done: Promise<void>
    dispose: () => void
}

const DEFAULT_SHAPE: Required<AttributeAuraShape> = {
    count: 72,
    sizeMin: 0.05,
    sizeMax: 0.12,
    radius: 0.85,
    height: 1.35,
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

function createAuraParticle(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 8, 8)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

function pickColor(
    colors: { core: THREE.Color; mid: THREE.Color; tip: THREE.Color },
    t: number,
): THREE.Color {
    if (t < 0.4) return colors.core.clone().lerp(colors.mid, t / 0.4)
    return colors.mid.clone().lerp(colors.tip, (t - 0.4) / 0.6)
}

/**
 * Dense particle aura that wraps a bakugan.
 * Colors / density / size are configurable for reuse across attributes.
 */
export function playAttributeAuraBurst({
    scene,
    position,
    colors,
    shape,
    expandDuration = 0.4,
    holdDuration = 0.25,
    fadeDuration = 0.35,
    tintTarget,
}: AttributeAuraBurstOptions): AttributeAuraBurstHandle {
    const cfg = { ...DEFAULT_SHAPE, ...shape }
    const palette = {
        core: new THREE.Color(colors?.core ?? 0xffffff),
        mid: new THREE.Color(colors?.mid ?? 0xea580c),
        tip: new THREE.Color(colors?.tip ?? 0x78350f),
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
        // Spherical shell distribution around the bakugan
        const theta = Math.acos(2 * Math.random() - 1)
        const phi = Math.random() * Math.PI * 2
        const r = cfg.radius * (0.55 + Math.random() * 0.55)
        const yBias = (Math.random() - 0.35) * cfg.height * 0.55
        const target = new THREE.Vector3(
            r * Math.sin(theta) * Math.cos(phi),
            yBias + r * Math.cos(theta) * 0.35,
            r * Math.sin(theta) * Math.sin(phi),
        )
        const size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)
        const mesh = createAuraParticle(pickColor(palette, Math.random()), size)
        mesh.position.set(0, 0.1, 0)
        mesh.scale.setScalar(0.2)
        group.add(mesh)
        particles.push({
            mesh,
            target,
            delay: Math.random() * 0.14,
        })
    }

    const spriteMaterial = tintTarget
        ? (tintTarget.material as THREE.SpriteMaterial)
        : null
    const originalTint = spriteMaterial?.color.clone() ?? null
    const homeScale = tintTarget?.scale.clone() ?? null

    const dispose = () => {
        for (const { mesh } of particles) {
            gsap.killTweensOf(mesh.position)
            gsap.killTweensOf(mesh.scale)
            gsap.killTweensOf(mesh.material)
        }
        if (spriteMaterial && originalTint && tintTarget && homeScale) {
            gsap.killTweensOf(spriteMaterial.color)
            gsap.killTweensOf(tintTarget.scale)
            spriteMaterial.color.copy(originalTint)
            tintTarget.scale.copy(homeScale)
        }
        scene.remove(group)
        disposeObject(group)
        particles.length = 0
    }

    const done = new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: () => resolve() })

        if (spriteMaterial && tintTarget && homeScale) {
            tl.to(
                spriteMaterial.color,
                {
                    r: palette.mid.r,
                    g: palette.mid.g,
                    b: palette.mid.b,
                    duration: expandDuration,
                    ease: "power1.out",
                },
                0,
            )
            tl.to(
                tintTarget.scale,
                {
                    x: homeScale.x * 1.1,
                    y: homeScale.y * 1.1,
                    duration: expandDuration * 0.8,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                },
                0,
            )
        }

        for (const { mesh, target, delay } of particles) {
            tl.to(
                mesh.material,
                {
                    opacity: 0.75 + Math.random() * 0.25,
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
                    y: 1,
                    z: 1,
                    duration: expandDuration,
                    ease: "power2.out",
                },
                delay,
            )
            // Soft orbit drift while held
            tl.to(
                mesh.position,
                {
                    x: target.x + (Math.random() - 0.5) * 0.12,
                    y: target.y + 0.08 + Math.random() * 0.12,
                    z: target.z + (Math.random() - 0.5) * 0.12,
                    duration: holdDuration + fadeDuration * 0.5,
                    ease: "sine.inOut",
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
                    x: 0.15,
                    y: 0.15,
                    z: 0.15,
                    duration: fadeDuration,
                    ease: "power1.in",
                },
                delay + expandDuration + holdDuration,
            )
        }

        if (spriteMaterial && originalTint) {
            tl.to(
                spriteMaterial.color,
                {
                    r: originalTint.r,
                    g: originalTint.g,
                    b: originalTint.b,
                    duration: fadeDuration,
                    ease: "power1.inOut",
                },
                expandDuration + holdDuration,
            )
        }
    })

    return { group, done, dispose }
}
