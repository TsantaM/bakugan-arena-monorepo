import type { attribut, bakuganOnSlot } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { getAttributColor } from "../functions/get-attrubut-color"
import gsap from "gsap"

function AnimatePreviewAttributeChange({
    bakugan,
    newAttribut,
}: {
    bakugan: bakuganOnSlot
    newAttribut: attribut
}) {
    const container = document.querySelector(
        `[data-key="${bakugan.key}-${bakugan.userId}-${bakugan.slot_id}"]`
    ) as HTMLDivElement | null

    if (!container) return

    const background = container.querySelector(
        '.attribut-background'
    ) as HTMLImageElement | null

    const sprite = container.querySelector(
        '.sprite'
    ) as HTMLImageElement | null

    const attributIcon = document.getElementById(
        `${bakugan.attribut}-attribut-image-${bakugan.userId}-${bakugan.key}`
    ) as HTMLImageElement | null

    if (!background || !sprite) return

    const oldColor = getAttributColor(bakugan.attribut)
    const nextColor = getAttributColor(newAttribut)

    const glow = {
        value: 0,
    }

    gsap.timeline()

        // Glow attribut actuel
        .to(glow, {
            value: 25,
            duration: 0.2,
            onUpdate: () => {
                container.style.filter =
                    `drop-shadow(0 0 ${glow.value}px ${oldColor})`
            },
        })

        // Transition vers nouvel attribut
        .to(glow, {
            value: 35,
            duration: 0.4,
            onStart: () => {
                background.src =
                    `/images/attributs-background/${newAttribut.toUpperCase()}.png`

                sprite.src =
                    `/images/bakugans/sphere/${bakugan.image}/${newAttribut.toUpperCase()}.png`

                if (attributIcon) {
                    attributIcon.src = `/images/attributs/${newAttribut.toUpperCase()}.png`
                }

            },
            onUpdate: () => {
                container.style.filter =
                    `drop-shadow(0 0 ${glow.value}px ${nextColor})`
            },
        })

        // Extinction
        .to(glow, {
            value: 0,
            duration: 0.3,
            onUpdate: () => {
                container.style.filter =
                    `drop-shadow(0 0 ${glow.value}px ${nextColor})`
            },
            onComplete: () => {
                container.style.filter = ''
            },
        })
}

export async function ChangeAttributAnimation({
    bakugan,
    scene,
    attribut,
}: {
    bakugan: bakuganOnSlot
    scene: THREE.Scene
    attribut: attribut
}): Promise<void> {
    return new Promise((resolve) => {
        const bakuganMesh = scene.getObjectByName(
            `${bakugan.key}-${bakugan.userId}`
        ) as THREE.Sprite

        if (!bakuganMesh) {
            resolve()
            return
        }

        const material = bakuganMesh.material as THREE.SpriteMaterial

        const oldColor = new THREE.Color(
            getAttributColor(bakugan.attribut)
        )

        const newColor = new THREE.Color(
            getAttributColor(attribut)
        )

        const originalScale = {
            x: bakuganMesh.scale.x,
            y: bakuganMesh.scale.y,
            z: bakuganMesh.scale.z,
        }

        const newTexture = new THREE.TextureLoader().load(
            `./../images/bakugans/sphere/${bakugan.image}/${attribut.toUpperCase()}.png`
        )

        gsap.timeline({
            onComplete: () => {
                AnimatePreviewAttributeChange({
                    bakugan,
                    newAttribut: attribut,
                })

                resolve()
            },
        })

            // 1. Le Bakugan commence à briller avec son attribut actuel
            .to(material.color, {
                r: oldColor.r * 2,
                g: oldColor.g * 2,
                b: oldColor.b * 2,
                duration: 0.25,
            })

            // Petit pulse
            .to(
                bakuganMesh.scale,
                {
                    x: originalScale.x * 1.15,
                    y: originalScale.y * 1.15,
                    duration: 0.25,
                    yoyo: true,
                    repeat: 1,
                },
                "<"
            )

            // 2. Transition vers la nouvelle couleur
            .to(material.color, {
                r: newColor.r * 2,
                g: newColor.g * 2,
                b: newColor.b * 2,
                duration: 0.5,

                onStart: () => {
                    // Changement de texture au milieu de l'effet
                    material.map = newTexture
                    material.needsUpdate = true
                },
            })

            // 3. Fin du glow
            .to(material.color, {
                r: 1,
                g: 1,
                b: 1,
                duration: 0.35,
            })

            // Retour à la taille normale
            .to(
                bakuganMesh.scale,
                {
                    x: originalScale.x,
                    y: originalScale.y,
                    z: originalScale.z,
                    duration: 0.35,
                },
                "<"
            )
    })
}