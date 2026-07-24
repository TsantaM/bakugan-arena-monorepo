import * as THREE from "three"
import gsap from "gsap"
import type { CustomAnimationContext } from "./types"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playGrayTrembleHitReaction } from "../effects"

/**
 * Optional dedicated meteor texture.
 * When null, the source bakugan sphere image is used as the flying form.
 */
const METEOR_IMAGE_URL: string | null = null

const SKY_HEIGHT = 8
const HOME_SCALE = 2

function loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(url, resolve, undefined, reject)
    })
}

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
                material.forEach((m) => {
                    if ("map" in m && m.map) (m.map as THREE.Texture).dispose()
                    m.dispose()
                })
            } else if (material) {
                if ("map" in material && material.map) {
                    ;(material.map as THREE.Texture).dispose()
                }
                material.dispose()
            }
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
            }
        }
    })
}

async function createMeteorSprite(
    sourceBakugan: NonNullable<CustomAnimationContext["data"]["sourceBakugan"]>,
    color: THREE.Color,
): Promise<THREE.Sprite> {
    const url =
        METEOR_IMAGE_URL ??
        `./../images/bakugans/sphere/${sourceBakugan.image}/${sourceBakugan.attribut.toUpperCase()}.png`

    const texture = await loadTexture(url)
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        color,
        depthWrite: false,
    })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(HOME_SCALE, HOME_SCALE, 1)
    return sprite
}

export async function DestructionMeteorStormAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const { sourceBakugan, targetBakugans } = data
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

    const glowInner = createGlowOrb(attributColor, 0.35)
    const glowOuter = createGlowOrb(attributColor.clone().lerp(new THREE.Color(0xffffff), 0.35), 0.55)
    glowInner.position.copy(homePosition)
    glowOuter.position.copy(homePosition)
    glowInner.scale.setScalar(0.2)
    glowOuter.scale.setScalar(0.2)
    glowInner.material.opacity = 0
    glowOuter.material.opacity = 0
    scene.add(glowInner)
    scene.add(glowOuter)

    let meteor: THREE.Sprite | null = null

    try {
        // Phase 1 — le bakugan brille aux couleurs de son attribut
        await new Promise<void>((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve })

            tl.to(
                material.color,
                {
                    r: attributColor.r,
                    g: attributColor.g,
                    b: attributColor.b,
                    duration: 0.35,
                    ease: "power2.out",
                },
                0,
            )

            tl.to(
                sourceMesh.scale,
                {
                    x: homeScale.x * 1.18,
                    y: homeScale.y * 1.18,
                    duration: 0.35,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                },
                0,
            )

            tl.to(
                [glowInner.material, glowOuter.material],
                {
                    opacity: 0.9,
                    duration: 0.25,
                    ease: "power1.out",
                },
                0,
            )

            tl.to(
                [glowInner.scale, glowOuter.scale],
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.45,
                    ease: "power2.out",
                },
                0,
            )
        })

        // Phase 2 — transformation en image volante
        meteor = await createMeteorSprite(sourceBakugan, attributColor)
        meteor.position.copy(homePosition)
        meteor.scale.set(0.01, 0.01, 1)
        scene.add(meteor)

        await new Promise<void>((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve })

            tl.to(
                sourceMesh.scale,
                {
                    x: 0.01,
                    y: 0.01,
                    duration: 0.22,
                    ease: "power2.in",
                    onComplete: () => {
                        sourceMesh.visible = false
                    },
                },
                0,
            )

            tl.to(
                meteor!.scale,
                {
                    x: HOME_SCALE * 1.15,
                    y: HOME_SCALE * 1.15,
                    duration: 0.28,
                    ease: "back.out(1.6)",
                },
                0.08,
            )

            tl.to(
                [glowInner.material, glowOuter.material],
                {
                    opacity: 0,
                    duration: 0.25,
                    ease: "power1.in",
                },
                0.15,
            )
        })

        // Phase 3 — envol vers le ciel
        await new Promise<void>((resolve) => {
            gsap.to(meteor!.position, {
                y: SKY_HEIGHT,
                duration: 0.7,
                ease: "power2.in",
                onComplete: resolve,
            })
        })

        // Phase 4 — inversion puis chute sur la/les cibles
        const targets =
            targetBakugans?.filter(Boolean) ??
            ([] as NonNullable<typeof targetBakugans>)

        if (targets.length === 0) {
            // Pas de cible : l'image redescend à la place d'origine
            await new Promise<void>((resolve) => {
                const tl = gsap.timeline({ onComplete: resolve })
                tl.to(meteor!.scale, {
                    y: -Math.abs(meteor!.scale.y),
                    duration: 0.18,
                    ease: "power1.inOut",
                })
                tl.to(meteor!.position, {
                    x: homePosition.x,
                    y: homePosition.y,
                    z: homePosition.z,
                    duration: 0.55,
                    ease: "power3.in",
                })
            })
        } else {
            for (let index = 0; index < targets.length; index++) {
                const target = targets[index]
                const targetMesh = scene.getObjectByName(`${target.key}-${target.userId}`)
                if (!targetMesh) continue

                const impactPos = targetMesh.getWorldPosition(new THREE.Vector3())
                impactPos.y = Math.max(impactPos.y, 0.75)

                // Remonte entre deux impacts si plusieurs cibles
                if (index > 0) {
                    await new Promise<void>((resolve) => {
                        gsap.to(meteor!.position, {
                            y: SKY_HEIGHT,
                            duration: 0.35,
                            ease: "power2.out",
                            onComplete: resolve,
                        })
                    })
                }

                await new Promise<void>((resolve) => {
                    const tl = gsap.timeline({ onComplete: resolve })

                    tl.to(meteor!.scale, {
                        y: -Math.abs(meteor!.scale.y),
                        duration: 0.16,
                        ease: "power1.inOut",
                    })

                    tl.to(
                        meteor!.position,
                        {
                            x: impactPos.x,
                            y: impactPos.y,
                            z: impactPos.z,
                            duration: 0.55,
                            ease: "power3.in",
                        },
                        "-=0.02",
                    )

                    tl.to(
                        meteor!.scale,
                        {
                            x: Math.abs(meteor!.scale.x) * 1.35,
                            y: -Math.abs(meteor!.scale.y) * 1.35,
                            duration: 0.12,
                            yoyo: true,
                            repeat: 1,
                            ease: "power1.out",
                        },
                        "-=0.05",
                    )
                })

                await playGrayTrembleHitReaction({ target: targetMesh })
            }
        }

        // Phase 5 — disparition de l'image + retour du bakugan
        await new Promise<void>((resolve) => {
            const opacityTarget = meteor!.material as THREE.SpriteMaterial
            gsap.to(opacityTarget, {
                opacity: 0,
                duration: 0.2,
                ease: "power1.in",
                onComplete: resolve,
            })
        })

        sourceMesh.visible = true
        sourceMesh.position.copy(homePosition)
        sourceMesh.scale.set(0.01, 0.01, homeScale.z)
        material.color.copy(originalColor)

        await new Promise<void>((resolve) => {
            gsap.to(sourceMesh.scale, {
                x: homeScale.x,
                y: homeScale.y,
                duration: 0.35,
                ease: "back.out(1.4)",
                onComplete: resolve,
            })
        })
    } finally {
        gsap.killTweensOf(material.color)
        gsap.killTweensOf(sourceMesh.scale)
        gsap.killTweensOf(sourceMesh.position)
        gsap.killTweensOf(glowInner.scale)
        gsap.killTweensOf(glowOuter.scale)
        gsap.killTweensOf(glowInner.material)
        gsap.killTweensOf(glowOuter.material)

        sourceMesh.visible = true
        sourceMesh.position.copy(homePosition)
        sourceMesh.scale.copy(homeScale)
        material.color.copy(originalColor)

        scene.remove(glowInner)
        scene.remove(glowOuter)
        disposeObject(glowInner)
        disposeObject(glowOuter)

        if (meteor) {
            gsap.killTweensOf(meteor.position)
            gsap.killTweensOf(meteor.scale)
            gsap.killTweensOf(meteor.material)
            scene.remove(meteor)
            disposeObject(meteor)
        }
    }
}
