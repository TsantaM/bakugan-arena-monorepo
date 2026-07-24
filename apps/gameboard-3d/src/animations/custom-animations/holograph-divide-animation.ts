import * as THREE from "three"
import gsap from "gsap"
import type { CustomAnimationContext } from "./types"
import { getAttributColor } from "../../functions/get-attrubut-color"

function createGlowOrb(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
            const material = child.material as THREE.Material | THREE.Material[]
            if (Array.isArray(material)) {
                material.forEach((m) => m.dispose())
            } else if (material) {
                material.dispose()
            }
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
            }
        }
    })
}

/**
 * Holograph Divide — the bakugan pulses with its attribute light,
 * signalling it is ready to absorb power boosts from allies on the same gate.
 */
export async function HolographDivideAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const { sourceBakugan } = data
    if (!sourceBakugan) return

    const sourceMesh = scene.getObjectByName(
        `${sourceBakugan.key}-${sourceBakugan.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const attributColor = new THREE.Color(getAttributColor(sourceBakugan.attribut))
    const homePosition = sourceMesh.position.clone()
    const homeScale = sourceMesh.scale.clone()
    const material = sourceMesh.material as THREE.SpriteMaterial
    const originalColor = material.color.clone()

    const glowInner = createGlowOrb(attributColor, 0.4)
    const glowOuter = createGlowOrb(
        attributColor.clone().lerp(new THREE.Color(0xffffff), 0.4),
        0.7,
    )
    glowInner.position.copy(homePosition)
    glowOuter.position.copy(homePosition)
    glowInner.scale.setScalar(0.15)
    glowOuter.scale.setScalar(0.15)
    glowInner.material.opacity = 0
    glowOuter.material.opacity = 0
    scene.add(glowInner)
    scene.add(glowOuter)

    try {
        await new Promise<void>((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve })

            tl.to(
                material.color,
                {
                    r: attributColor.r,
                    g: attributColor.g,
                    b: attributColor.b,
                    duration: 0.4,
                    ease: "power2.out",
                },
                0,
            )

            tl.to(
                sourceMesh.scale,
                {
                    x: homeScale.x * 1.22,
                    y: homeScale.y * 1.22,
                    duration: 0.45,
                    yoyo: true,
                    repeat: 3,
                    ease: "sine.inOut",
                },
                0,
            )

            tl.to(
                [glowInner.material, glowOuter.material],
                {
                    opacity: 0.95,
                    duration: 0.3,
                    ease: "power1.out",
                },
                0,
            )

            tl.to(
                [glowInner.scale, glowOuter.scale],
                {
                    x: 1.15,
                    y: 1.15,
                    z: 1.15,
                    duration: 0.55,
                    yoyo: true,
                    repeat: 2,
                    ease: "sine.inOut",
                },
                0,
            )

            tl.to(
                [glowInner.material, glowOuter.material],
                {
                    opacity: 0,
                    duration: 0.35,
                    ease: "power1.in",
                },
                "-=0.2",
            )

            tl.to(
                material.color,
                {
                    r: originalColor.r,
                    g: originalColor.g,
                    b: originalColor.b,
                    duration: 0.3,
                    ease: "power1.inOut",
                },
                "-=0.25",
            )
        })
    } finally {
        gsap.killTweensOf(material.color)
        gsap.killTweensOf(sourceMesh.scale)
        gsap.killTweensOf(glowInner.scale)
        gsap.killTweensOf(glowOuter.scale)
        gsap.killTweensOf(glowInner.material)
        gsap.killTweensOf(glowOuter.material)

        material.color.copy(originalColor)
        sourceMesh.scale.copy(homeScale)

        scene.remove(glowInner)
        scene.remove(glowOuter)
        disposeObject(glowInner)
        disposeObject(glowOuter)
    }
}
