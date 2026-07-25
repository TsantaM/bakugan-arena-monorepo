import type { bakuganOnSlot, portalSlotsTypeElement } from "@bakugan-arena/game-data"
import { Slots } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { GetSpritePosition } from "../../functions/get-sprite-position"
import { createSprite } from "../../meshes/bakugan.mesh"
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

function createGlowOrb(
    color: THREE.Color,
    size: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> {
    const geometry = new THREE.SphereGeometry(size, 24, 24)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(geometry, material)
}

function createLightBeam(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.08, 0.35, 3.2, 16, 1, true)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const beam = new THREE.Mesh(geometry, material)
    beam.position.y = 1.6
    return beam
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            const material = child.material as THREE.Material | THREE.Material[]
            if (Array.isArray(material)) {
                material.forEach((m) => m.dispose())
            } else if (material) {
                material.dispose()
            }
        }
    })
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
 * Éclat Soudain — allies on the gate shift to make room,
 * a Haos light flash appears at the landing spot, then the bakugan materializes.
 * Runs before the ADD_RENFORT UI animation.
 */
export async function EclatSoudainAnimation({
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

    const haos = new THREE.Color(getAttributColor("Haos"))
    const white = new THREE.Color(0xffffff)
    const highlight = haos.clone().lerp(white, 0.55)

    const glowInner = createGlowOrb(white, 0.35)
    const glowOuter = createGlowOrb(highlight, 0.7)
    const beam = createLightBeam(highlight)
    const lightGroup = new THREE.Group()
    lightGroup.position.set(position.x, 0.15, position.z)
    lightGroup.add(glowInner, glowOuter, beam)
    glowInner.scale.setScalar(0.1)
    glowOuter.scale.setScalar(0.1)
    beam.scale.set(0.2, 0.2, 0.2)
    scene.add(lightGroup)

    const material = bakuganMesh.material as THREE.SpriteMaterial
    const originalColor = material.color.clone()

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

        await Promise.all([
            tween([glowInner.material, glowOuter.material, beam.material], {
                opacity: 0.95,
                duration: 0.35,
                ease: "power2.out",
            }),
            tween([glowInner.scale, glowOuter.scale], {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.4,
                ease: "power2.out",
            }),
            tween(beam.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "power2.out",
            }),
        ])

        await Promise.all([
            tween(bakuganMesh.scale, {
                x: BAKUGAN_REST_SCALE,
                y: BAKUGAN_REST_SCALE,
                duration: 0.55,
                ease: "back.out(1.6)",
            }),
            tween(material.color, {
                r: highlight.r,
                g: highlight.g,
                b: highlight.b,
                duration: 0.3,
                ease: "power1.out",
            }),
            tween([glowInner.scale, glowOuter.scale], {
                x: 1.8,
                y: 1.8,
                z: 1.8,
                duration: 0.45,
                ease: "power1.out",
            }),
        ])

        await Promise.all([
            tween([glowInner.material, glowOuter.material, beam.material], {
                opacity: 0,
                duration: 0.35,
                ease: "power1.in",
            }),
            tween(beam.scale, {
                x: 0.1,
                y: 1.4,
                z: 0.1,
                duration: 0.35,
                ease: "power1.in",
            }),
            tween(material.color, {
                r: originalColor.r,
                g: originalColor.g,
                b: originalColor.b,
                duration: 0.3,
                ease: "power1.inOut",
            }),
        ])
    } finally {
        gsap.killTweensOf(bakuganMesh.scale)
        gsap.killTweensOf(material.color)
        gsap.killTweensOf(glowInner.scale)
        gsap.killTweensOf(glowOuter.scale)
        gsap.killTweensOf(beam.scale)
        gsap.killTweensOf(glowInner.material)
        gsap.killTweensOf(glowOuter.material)
        gsap.killTweensOf(beam.material)

        bakuganMesh.scale.set(BAKUGAN_REST_SCALE, BAKUGAN_REST_SCALE, 1)
        material.color.copy(originalColor)

        scene.remove(lightGroup)
        disposeObject(lightGroup)
    }
}
