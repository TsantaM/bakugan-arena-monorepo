import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFissureOnSurface } from "../effects"
import type { CustomAnimationContext } from "./types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6

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

function createHaosAura(haos: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: haos.clone().lerp(new THREE.Color(0xffffff), 0.35),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT), material)
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

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Support Light —
 * 1) Haos light bloom on the caster (same orbs/beam as Éclat Soudain pre-spawn)
 * 2) Gate card floods with Haos light
 * 3) Gate fissures
 * CancelGateCard directive darkens the gate afterward.
 */
export async function SupportLightAnimation({
    scene,
    plane,
    gateCardMeshs,
    data,
}: CustomAnimationContext): Promise<void> {
    const { sourceBakugan, slotId } = data
    if (!sourceBakugan || !slotId) return

    const sourceMesh = scene.getObjectByName(
        `${sourceBakugan.key}-${sourceBakugan.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const gateMesh =
        gateCardMeshs.find((m) => m.name === slotId) ??
        (plane.getObjectByName(slotId) as THREE.Mesh | undefined)
    if (!gateMesh) return

    const haos = new THREE.Color(getAttributColor("Haos"))
    const white = new THREE.Color(0xffffff)
    const highlight = haos.clone().lerp(white, 0.55)

    const spriteMaterial = sourceMesh.material as THREE.SpriteMaterial
    const originalSpriteColor = spriteMaterial.color.clone()
    const homeScale = sourceMesh.scale.clone()
    const gateMaterial = gateMesh.material as THREE.MeshStandardMaterial
    const originalGateColor = gateMaterial.color.clone()
    const originalEmissive = gateMaterial.emissive?.clone() ?? new THREE.Color(0, 0, 0)
    const originalEmissiveIntensity = gateMaterial.emissiveIntensity ?? 0
    const gateOrigin = gateMesh.position.clone()

    const glowInner = createGlowOrb(white, 0.35)
    const glowOuter = createGlowOrb(highlight, 0.7)
    const beam = createLightBeam(highlight)
    const lightGroup = new THREE.Group()
    lightGroup.position.set(sourceMesh.position.x, 0.15, sourceMesh.position.z)
    lightGroup.add(glowInner, glowOuter, beam)
    glowInner.scale.setScalar(0.1)
    glowOuter.scale.setScalar(0.1)
    beam.scale.set(0.2, 0.2, 0.2)
    scene.add(lightGroup)

    const parent = gateMesh.parent ?? plane
    const gateFx = new THREE.Group()
    gateFx.position.copy(gateMesh.position)
    gateFx.position.z += 0.04
    parent.add(gateFx)

    const aura = createHaosAura(haos)
    aura.scale.set(0.05, 0.05, 1)
    gateFx.add(aura)

    try {
        // 1 — Illumination Haos du lanceur (même lumière qu'Éclat Soudain avant spawn)
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
            tween(spriteMaterial.color, {
                r: highlight.r,
                g: highlight.g,
                b: highlight.b,
                duration: 0.35,
                ease: "power1.out",
            }),
            tween(sourceMesh.scale, {
                x: homeScale.x * 1.15,
                y: homeScale.y * 1.15,
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
            }),
        ])

        await Promise.all([
            tween([glowInner.scale, glowOuter.scale], {
                x: 1.8,
                y: 1.8,
                z: 1.8,
                duration: 0.35,
                ease: "power1.out",
            }),
            tween(gateMaterial.color, {
                r: haos.r,
                g: haos.g,
                b: haos.b,
                duration: 0.45,
                ease: "power2.out",
            }),
            tween(gateMaterial, {
                emissiveIntensity: 2.2,
                duration: 0.45,
                ease: "power2.out",
                onStart: () => {
                    gateMaterial.emissive.copy(haos)
                },
            }),
            tween(aura.material, {
                opacity: 0.9,
                duration: 0.35,
                ease: "power1.out",
            }),
            tween(aura.scale, {
                x: 1,
                y: 1,
                duration: 0.5,
                ease: "power2.out",
            }),
        ])

        // 2 — Fade de la lumière du lanceur pendant que la gate reste illuminée
        await Promise.all([
            tween([glowInner.material, glowOuter.material, beam.material], {
                opacity: 0,
                duration: 0.3,
                ease: "power1.in",
            }),
            tween(beam.scale, {
                x: 0.1,
                y: 1.4,
                z: 0.1,
                duration: 0.3,
                ease: "power1.in",
            }),
            tween(spriteMaterial.color, {
                r: originalSpriteColor.r,
                g: originalSpriteColor.g,
                b: originalSpriteColor.b,
                duration: 0.3,
                ease: "power1.inOut",
            }),
        ])

        // 3 — Fissures sur la gate
        const fissurePromise = playFissureOnSurface({
            parent: gateFx,
            width: GATE_WIDTH,
            height: GATE_HEIGHT,
            shakeTarget: gateMesh,
            crackColor: highlight,
        })

        const auraFadePromise = new Promise<void>((resolve) => {
            gsap.delayedCall(0.35, () => {
                gsap.to(aura.material, {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power1.in",
                    onComplete: () => resolve(),
                })
            })
        })

        await Promise.all([fissurePromise, auraFadePromise])
    } finally {
        gsap.killTweensOf(spriteMaterial.color)
        gsap.killTweensOf(sourceMesh.scale)
        gsap.killTweensOf(glowInner.scale)
        gsap.killTweensOf(glowOuter.scale)
        gsap.killTweensOf(beam.scale)
        gsap.killTweensOf(glowInner.material)
        gsap.killTweensOf(glowOuter.material)
        gsap.killTweensOf(beam.material)
        gsap.killTweensOf(gateMaterial.color)
        gsap.killTweensOf(gateMaterial)
        gsap.killTweensOf(aura.material)
        gsap.killTweensOf(aura.scale)
        gsap.killTweensOf(gateMesh.position)

        spriteMaterial.color.copy(originalSpriteColor)
        sourceMesh.scale.copy(homeScale)
        gateMesh.position.copy(gateOrigin)
        // Leave gate tinted toward Haos slightly; CANCEL_GATE_CARD darkens next.
        gateMaterial.color.copy(haos.clone().lerp(originalGateColor, 0.25))
        gateMaterial.emissive.copy(originalEmissive)
        gateMaterial.emissiveIntensity = originalEmissiveIntensity

        scene.remove(lightGroup)
        disposeObject(lightGroup)

        gateFx.remove(aura)
        disposeObject(aura)
        parent.remove(gateFx)
    }
}
