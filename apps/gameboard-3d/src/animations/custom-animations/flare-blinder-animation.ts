import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playSceneIlluminate } from "../effects"
import type { CustomAnimationContext } from "./types"

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
    const geometry = new THREE.CylinderGeometry(0.1, 0.55, 4.2, 16, 1, true)
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    })
    const beam = new THREE.Mesh(geometry, material)
    beam.position.y = 2.1
    return beam
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
 * Flare Blinder / Mega Flare Blinder —
 * The caster flares with Haos light and floods the whole battlefield with brightness.
 */
export async function FlareBlinderAnimation({
    scene,
    data,
}: CustomAnimationContext): Promise<void> {
    const source = data.sourceBakugan
    if (!source) return

    const sourceMesh = scene.getObjectByName(
        `${source.key}-${source.userId}`,
    ) as THREE.Sprite | undefined
    if (!sourceMesh) return

    const haos = new THREE.Color(getAttributColor("Haos"))
    const white = new THREE.Color(0xffffff)
    const highlight = haos.clone().lerp(white, 0.6)

    const spriteMaterial = sourceMesh.material as THREE.SpriteMaterial
    const originalSpriteColor = spriteMaterial.color.clone()
    const homeScale = sourceMesh.scale.clone()

    const glowInner = createGlowOrb(white, 0.45)
    const glowMid = createGlowOrb(highlight, 0.95)
    const glowOuter = createGlowOrb(haos, 1.6)
    const beam = createLightBeam(highlight)
    const lightGroup = new THREE.Group()
    lightGroup.position.set(sourceMesh.position.x, 0.15, sourceMesh.position.z)
    lightGroup.add(glowInner, glowMid, glowOuter, beam)
    glowInner.scale.setScalar(0.1)
    glowMid.scale.setScalar(0.1)
    glowOuter.scale.setScalar(0.1)
    beam.scale.set(0.15, 0.15, 0.15)
    scene.add(lightGroup)

    let sceneFx: ReturnType<typeof playSceneIlluminate> | null = null

    try {
        // 1 — Caster becomes a blinding Haos beacon
        await Promise.all([
            tween([glowInner.material, glowMid.material, glowOuter.material, beam.material], {
                opacity: 0.95,
                duration: 0.4,
                ease: "power2.out",
            }),
            tween([glowInner.scale, glowMid.scale], {
                x: 1.35,
                y: 1.35,
                z: 1.35,
                duration: 0.5,
                ease: "power2.out",
            }),
            tween(glowOuter.scale, {
                x: 1.8,
                y: 1.8,
                z: 1.8,
                duration: 0.6,
                ease: "power2.out",
            }),
            tween(beam.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.5,
                ease: "power2.out",
            }),
            tween(spriteMaterial.color, {
                r: highlight.r,
                g: highlight.g,
                b: highlight.b,
                duration: 0.4,
                ease: "power1.out",
            }),
            tween(sourceMesh.scale, {
                x: homeScale.x * 1.35,
                y: homeScale.y * 1.35,
                duration: 0.5,
                ease: "power2.out",
            }),
        ])

        // 2 — Whole battlefield brightens
        sceneFx = playSceneIlluminate({
            scene,
            tint: haos,
            lightMultiplier: 2.8,
            minBoostedIntensity: 1.9,
            backgroundLift: 0.65,
            riseDuration: 0.5,
            holdDuration: 0.55,
            fadeDuration: 0.6,
        })

        // Keep caster pulsing while the field stays lit
        const pulse = tween([glowOuter.scale, glowMid.scale], {
            x: "*=1.15",
            y: "*=1.15",
            z: "*=1.15",
            duration: 0.35,
            yoyo: true,
            repeat: 3,
            ease: "sine.inOut",
        })

        await Promise.all([sceneFx.done, pulse])

        // 3 — Fade caster bloom back
        await Promise.all([
            tween([glowInner.material, glowMid.material, glowOuter.material, beam.material], {
                opacity: 0,
                duration: 0.4,
                ease: "power1.in",
            }),
            tween(beam.scale, {
                x: 0.1,
                y: 1.5,
                z: 0.1,
                duration: 0.4,
                ease: "power1.in",
            }),
            tween(spriteMaterial.color, {
                r: originalSpriteColor.r,
                g: originalSpriteColor.g,
                b: originalSpriteColor.b,
                duration: 0.4,
                ease: "power1.inOut",
            }),
            tween(sourceMesh.scale, {
                x: homeScale.x,
                y: homeScale.y,
                duration: 0.4,
                ease: "power2.inOut",
            }),
        ])
    } finally {
        sceneFx?.dispose()

        gsap.killTweensOf(spriteMaterial.color)
        gsap.killTweensOf(sourceMesh.scale)
        gsap.killTweensOf(glowInner.scale)
        gsap.killTweensOf(glowMid.scale)
        gsap.killTweensOf(glowOuter.scale)
        gsap.killTweensOf(beam.scale)
        gsap.killTweensOf(glowInner.material)
        gsap.killTweensOf(glowMid.material)
        gsap.killTweensOf(glowOuter.material)
        gsap.killTweensOf(beam.material)

        spriteMaterial.color.copy(originalSpriteColor)
        sourceMesh.scale.copy(homeScale)

        scene.remove(lightGroup)
        disposeObject(lightGroup)
    }
}
