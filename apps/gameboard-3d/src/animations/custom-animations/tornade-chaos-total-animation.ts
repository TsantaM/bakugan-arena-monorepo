import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFissureOnSurface, playWindTornado } from "../effects"
import type { CustomAnimationContext } from "./types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
}

function createVentusAura(ventus: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: ventus.clone().lerp(new THREE.Color(0xdcfce7), 0.35),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT), material)
}

function createWindVeil(ventus: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: ventus.clone().lerp(new THREE.Color(0x052e16), 0.45),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
    })
    return new THREE.Mesh(new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT), material)
}

/**
 * Tornade Chaos Total —
 * 1) Wind tornado forms on the gate (Ventus colors)
 * 2) Coup-de-Grâce-style expanding aura + fissures in Ventus colors
 * CancelGateCard directive darkens the gate afterward.
 */
export async function TornadeChaosTotalAnimation({
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
    const ventus = new THREE.Color(getAttributColor("Ventus"))
    const core = ventus.clone().lerp(new THREE.Color(0xffffff), 0.55)
    const mid = ventus.clone()
    const tip = ventus.clone().lerp(new THREE.Color(0x14532d), 0.35)
    const highlight = ventus.clone().lerp(new THREE.Color(0xbbf7d0), 0.4)
    const gateOrigin = gateMesh.position.clone()
    const gateMaterial = gateMesh.material as THREE.MeshStandardMaterial
    const gateWorld = gateMesh.getWorldPosition(new THREE.Vector3())

    const group = new THREE.Group()
    group.position.copy(gateMesh.position)
    group.position.z += 0.04
    parent.add(group)

    const veil = createWindVeil(ventus)
    const aura = createVentusAura(ventus)
    veil.scale.set(0.05, 0.05, 1)
    aura.scale.set(0.05, 0.05, 1)
    group.add(veil)
    group.add(aura)

    let tornado: ReturnType<typeof playWindTornado> | null = null

    try {
        // Phase 1 — wind tornado on the gate
        tornado = playWindTornado({
            scene,
            position: new THREE.Vector3(gateWorld.x, gateWorld.y + 0.08, gateWorld.z),
            colors: { core, mid, tip },
            shape: {
                count: 68,
                height: 2.6,
                spread: 0.7,
                sizeMin: 0.05,
                sizeMax: 0.16,
                stretchY: 2.6,
            },
            formDuration: 0.4,
            holdDuration: 0.55,
            spins: 4,
            fadeDuration: 0.3,
        })

        await tornado.done

        // Phase 2 — Coup-de-Grâce style, Ventus palette
        await new Promise<void>((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve })

            tl.to(aura.material, {
                opacity: 0.9,
                duration: 0.15,
                ease: "power1.out",
            }, 0)

            tl.to(veil.material, {
                opacity: 0.5,
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
        tornado?.dispose()

        gsap.killTweensOf(gateMesh.position)
        gsap.killTweensOf(gateMaterial.color)
        gateMesh.position.copy(gateOrigin)
        gateMaterial.color.copy(ventus.clone().lerp(new THREE.Color(1, 1, 1), 0.25))

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
