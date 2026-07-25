import type { bakuganOnSlot, portalSlotsTypeElement } from "@bakugan-arena/game-data"
import { Slots } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { GetSpritePosition } from "../../functions/get-sprite-position"
import { createSprite } from "../../meshes/bakugan.mesh"
import { playFlameParticleBurst } from "../effects"
import { MoveBakugan } from "../move-bakugan-animation"
import type { CustomAnimationContext } from "./types"

const BAKUGAN_REST_SCALE = 2
const BAKUGAN_REST_Y = 0.75

function isPortalSlot(value: unknown): value is portalSlotsTypeElement {
    return (
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        "bakugans" in value &&
        Array.isArray((value as portalSlotsTypeElement).bakugans)
    )
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Jet Enflammé — same flow as Éclat Soudain (reposition → spawn FX → appear),
 * but the landing FX is a reusable Pyrus flame particle burst instead of Haos light.
 */
export async function JetEnflammeAnimation({
    scene,
    userId,
    bakugansMeshs,
    data,
}: CustomAnimationContext): Promise<void> {
    const bakugan = data.sourceBakugan
    const payload = data.payload ?? {}
    const slot = isPortalSlot(payload.slot) ? payload.slot : null
    if (!bakugan || !slot) return

    const slotIndex = Slots.indexOf(slot.id)
    if (slotIndex === -1) return

    const position = GetSpritePosition({
        bakugan,
        slot,
        slotIndex,
        userId,
    })
    if (!position) return

    createSprite({
        bakugan,
        scene,
        slot,
        slotIndex,
        userId,
        bakugansMeshs,
    })

    const bakuganMesh = scene.getObjectByName(
        `${bakugan.key}-${bakugan.userId}`,
    ) as THREE.Sprite | undefined
    if (!bakuganMesh) return

    bakuganMesh.scale.set(0, 0, 1)
    bakuganMesh.position.set(position.x, BAKUGAN_REST_Y, position.z)

    const alliesToReposition = slot.bakugans.filter(
        (b: bakuganOnSlot) => b.userId === bakugan.userId && b.id !== bakugan.id,
    )

    const pyrus = new THREE.Color(getAttributColor("Pyrus"))
    const core = new THREE.Color(0xfff1a8)
    const mid = pyrus.clone().lerp(new THREE.Color(0xff8a1a), 0.35)
    const tip = pyrus.clone().lerp(new THREE.Color(0x7f1d1d), 0.25)

    const material = bakuganMesh.material as THREE.SpriteMaterial
    const originalColor = material.color.clone()

    let flame: ReturnType<typeof playFlameParticleBurst> | null = null

    try {
        await Promise.all(
            alliesToReposition.map((ally) =>
                MoveBakugan({
                    bakugan: ally,
                    scene,
                    slot,
                    userId,
                    duration: 0.65,
                }),
            ),
        )

        flame = playFlameParticleBurst({
            scene,
            position: new THREE.Vector3(position.x, 0.12, position.z),
            colors: {
                core,
                mid,
                tip,
            },
            shape: {
                spread: 0.6,
                height: 1.9,
                count: 48,
                sizeMin: 0.14,
                sizeMax: 0.4,
                stretchY: 1.75,
            },
            expandDuration: 0.5,
            holdDuration: 0.12,
            fadeDuration: 0.45,
        })

        // Let the flame expand onto the landing spot before the bakugan appears
        await new Promise<void>((resolve) => {
            gsap.delayedCall(0.35, resolve)
        })

        await Promise.all([
            tween(bakuganMesh.scale, {
                x: BAKUGAN_REST_SCALE,
                y: BAKUGAN_REST_SCALE,
                duration: 0.55,
                ease: "back.out(1.6)",
            }),
            tween(material.color, {
                r: mid.r,
                g: mid.g,
                b: mid.b,
                duration: 0.3,
                ease: "power1.out",
            }),
        ])

        await Promise.all([
            flame.done,
            tween(material.color, {
                r: originalColor.r,
                g: originalColor.g,
                b: originalColor.b,
                duration: 0.3,
                ease: "power1.inOut",
            }),
        ])
    } finally {
        flame?.dispose()
        gsap.killTweensOf(bakuganMesh.scale)
        gsap.killTweensOf(material.color)

        bakuganMesh.scale.set(BAKUGAN_REST_SCALE, BAKUGAN_REST_SCALE, 1)
        material.color.copy(originalColor)
    }
}
