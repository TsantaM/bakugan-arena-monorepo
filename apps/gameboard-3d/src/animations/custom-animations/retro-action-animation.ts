import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFissureOnSurface, playFlameParticleBurst } from "../effects"
import type { CustomAnimationContext } from "./types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

/**
 * Retro Action —
 * 1) Pyrus flame particle burst spreads across the gate card
 * 2) Gate fissures
 * CancelGateCard directive darkens the gate afterward.
 */
export async function RetroActionAnimation({
    scene,
    plane,
    gateCardMeshs,
    data,
}: CustomAnimationContext): Promise<void> {
    const { slotId } = data
    if (!slotId) return

    const gateMesh =
        gateCardMeshs.find((m) => m.name === slotId) ??
        (plane.getObjectByName(slotId) as THREE.Mesh | undefined)
    if (!gateMesh) return

    const pyrus = new THREE.Color(getAttributColor("Pyrus"))
    const core = new THREE.Color(0xfff1a8)
    const mid = pyrus.clone().lerp(new THREE.Color(0xff8a1a), 0.35)
    const tip = pyrus.clone().lerp(new THREE.Color(0x7f1d1d), 0.25)

    const gateMaterial = gateMesh.material as THREE.MeshStandardMaterial
    const originalGateColor = gateMaterial.color.clone()
    const originalEmissive = gateMaterial.emissive?.clone() ?? new THREE.Color(0, 0, 0)
    const originalEmissiveIntensity = gateMaterial.emissiveIntensity ?? 0
    const gateOrigin = gateMesh.position.clone()
    const gateWorld = gateMesh.getWorldPosition(new THREE.Vector3())

    const parent = gateMesh.parent ?? plane
    const gateFx = new THREE.Group()
    gateFx.position.copy(gateMesh.position)
    gateFx.position.z += 0.04
    parent.add(gateFx)

    let flame: ReturnType<typeof playFlameParticleBurst> | null = null

    try {
        // 1 — Flame spreads over the gate
        flame = playFlameParticleBurst({
            scene,
            position: new THREE.Vector3(gateWorld.x, gateWorld.y + 0.15, gateWorld.z),
            colors: { core, mid, tip },
            shape: {
                spread: 1.35,
                height: 1.1,
                count: 56,
                sizeMin: 0.16,
                sizeMax: 0.42,
                stretchY: 1.45,
            },
            expandDuration: 0.55,
            holdDuration: 0.12,
            fadeDuration: 0.4,
        })

        await Promise.all([
            tween(gateMaterial.color, {
                r: mid.r,
                g: mid.g,
                b: mid.b,
                duration: 0.4,
                ease: "power2.out",
            }),
            tween(gateMaterial, {
                emissiveIntensity: 2.4,
                duration: 0.4,
                ease: "power2.out",
                onStart: () => {
                    gateMaterial.emissive.copy(pyrus)
                },
            }),
            new Promise<void>((resolve) => {
                gsap.delayedCall(0.35, resolve)
            }),
        ])

        // 2 — Fissures while flames are still active
        await Promise.all([
            playFissureOnSurface({
                parent: gateFx,
                width: GATE_WIDTH,
                height: GATE_HEIGHT,
                shakeTarget: gateMesh,
                crackColor: mid,
            }),
            flame.done,
        ])
    } finally {
        flame?.dispose()

        gsap.killTweensOf(gateMaterial.color)
        gsap.killTweensOf(gateMaterial)
        gsap.killTweensOf(gateMesh.position)

        gateMesh.position.copy(gateOrigin)
        gateMaterial.color.copy(pyrus.clone().lerp(originalGateColor, 0.25))
        gateMaterial.emissive.copy(originalEmissive)
        gateMaterial.emissiveIntensity = originalEmissiveIntensity

        parent.remove(gateFx)
    }
}
