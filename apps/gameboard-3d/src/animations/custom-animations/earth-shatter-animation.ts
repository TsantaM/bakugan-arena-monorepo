import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFissureOnSurface, playRockFallImpact } from "../effects"
import type { CustomAnimationContext } from "./types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
}

function createSubterraAura(subterra: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: subterra.clone().lerp(new THREE.Color(0xfbbf24), 0.25),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT), material)
}

function createEarthVeil(subterra: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: subterra.clone().lerp(new THREE.Color(0x431407), 0.55),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
    })
    return new THREE.Mesh(new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT), material)
}

/**
 * Earth Shatter —
 * 1) Rocks rain down onto the gate card
 * 2) Coup-de-Grâce-style expanding aura + fissures in Subterra colors
 * CancelGateCard directive darkens the gate afterward.
 */
export async function EarthShatterAnimation({
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

    const parent = gateMesh.parent ?? plane
    const subterra = new THREE.Color(getAttributColor("Subterra"))
    const rock = subterra.clone().lerp(new THREE.Color(0x78350f), 0.45)
    const highlight = subterra.clone().lerp(new THREE.Color(0xfbbf24), 0.35)
    const gateOrigin = gateMesh.position.clone()
    const gateMaterial = gateMesh.material as THREE.MeshStandardMaterial
    const gateWorld = gateMesh.getWorldPosition(new THREE.Vector3())

    const group = new THREE.Group()
    group.position.copy(gateMesh.position)
    group.position.z += 0.04
    parent.add(group)

    const veil = createEarthVeil(subterra)
    const aura = createSubterraAura(subterra)
    veil.scale.set(0.05, 0.05, 1)
    aura.scale.set(0.05, 0.05, 1)
    group.add(veil)
    group.add(aura)

    let rockFx: ReturnType<typeof playRockFallImpact> | null = null

    try {
        // Phase 1 — rocks fall onto the gate
        rockFx = playRockFallImpact({
            scene,
            position: new THREE.Vector3(gateWorld.x, gateWorld.y + 0.05, gateWorld.z),
            colors: { rock, highlight },
            shape: {
                count: 18,
                spreadX: GATE_WIDTH * 0.38,
                spreadZ: GATE_HEIGHT * 0.38,
                fallHeight: 3.6,
                sizeMin: 0.16,
                sizeMax: 0.36,
            },
            shakeTarget: gateMesh,
        })

        await rockFx.done

        // Phase 2 — Coup-de-Grâce style, Subterra palette
        await new Promise<void>((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve })

            tl.to(aura.material, {
                opacity: 0.9,
                duration: 0.15,
                ease: "power1.out",
            }, 0)

            tl.to(veil.material, {
                opacity: 0.55,
                duration: 0.2,
                ease: "power1.out",
            }, 0)

            tl.to([aura.scale, veil.scale], {
                x: 1,
                y: 1,
                duration: 0.55,
                ease: "power2.out",
            }, 0)
        })

        const fissurePromise = playFissureOnSurface({
            parent: group,
            width: GATE_WIDTH,
            height: GATE_HEIGHT,
            shakeTarget: gateMesh,
            crackColor: highlight,
        })

        const auraFadePromise = new Promise<void>((resolve) => {
            gsap.delayedCall(0.35, () => {
                gsap.to([aura.material, veil.material], {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power1.in",
                    onComplete: () => resolve(),
                })
            })
        })

        await Promise.all([fissurePromise, auraFadePromise])
    } finally {
        rockFx?.dispose()

        gsap.killTweensOf(gateMesh.position)
        gsap.killTweensOf(gateMaterial.color)
        gateMesh.position.copy(gateOrigin)
        // Slight Subterra tint; CANCEL_GATE_CARD darkens next
        gateMaterial.color.copy(subterra.clone().lerp(new THREE.Color(1, 1, 1), 0.25))

        gsap.killTweensOf(veil.material)
        gsap.killTweensOf(aura.material)
        gsap.killTweensOf(veil.scale)
        gsap.killTweensOf(aura.scale)
        group.remove(veil)
        group.remove(aura)
        disposeMesh(veil)
        disposeMesh(aura)
        parent.remove(group)
    }
}
