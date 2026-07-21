import * as THREE from "three"
import gsap from "gsap"
import type { CustomAnimationContext } from "./types"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { playFissureOnSurface } from "../effects"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
}

function createAura(darkus: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: darkus.clone().multiplyScalar(0.25),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(
        new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT),
        material,
    )
}

function createDarkVeil(): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: 0x050208,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
    })
    return new THREE.Mesh(
        new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT),
        material,
    )
}

export async function CoupDeGraceAnimation({
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
    const darkus = new THREE.Color(getAttributColor("Darkus"))
    const gateOrigin = gateMesh.position.clone()
    const gateMaterial = gateMesh.material as THREE.MeshStandardMaterial

    const group = new THREE.Group()
    group.position.copy(gateMesh.position)
    group.position.z += 0.04
    parent.add(group)

    const veil = createDarkVeil()
    const aura = createAura(darkus)
    veil.scale.set(0.05, 0.05, 1)
    aura.scale.set(0.05, 0.05, 1)
    group.add(veil)
    group.add(aura)

    try {
        // Phase 1 — aura part du centre et s'étend jusqu'aux bords
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

        // Phase 2 — fissures réutilisables sur la surface de la gate
        const fissurePromise = playFissureOnSurface({
            parent: group,
            width: GATE_WIDTH,
            height: GATE_HEIGHT,
            shakeTarget: gateMesh,
        })

        // Phase 3 — l'aura disparaît en parallèle de la fin des fissures
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
        gsap.killTweensOf(gateMesh.position)
        gsap.killTweensOf(gateMaterial.color)
        gateMesh.position.copy(gateOrigin)
        gateMaterial.color.setRGB(1, 1, 1)

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
