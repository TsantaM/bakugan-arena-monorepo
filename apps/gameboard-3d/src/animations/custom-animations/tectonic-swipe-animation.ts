import type { slots_id } from "@bakugan-arena/game-data"
import gsap from "gsap"
import * as THREE from "three"
import { getAttributColor } from "../../functions/get-attrubut-color"
import type { CustomAnimationContext } from "./types"

const GATE_WIDTH = 4
const GATE_HEIGHT = 6

function disposeMesh(mesh: THREE.Mesh) {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
}

function createSubterraAura(color: THREE.Color): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({
        color: color.clone().lerp(new THREE.Color(0x78350f), 0.25),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    })
    return new THREE.Mesh(new THREE.PlaneGeometry(GATE_WIDTH, GATE_HEIGHT), material)
}

function createRockDebris(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.1, 0)
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.85,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
    })
    return new THREE.Mesh(geometry, material)
}

function tween(targets: gsap.TweenTarget, vars: gsap.TweenVars): Promise<void> {
    return new Promise((resolve) => {
        gsap.to(targets, {
            ...vars,
            onComplete: resolve,
        })
    })
}

function resolveGateMesh(
    slotId: slots_id,
    plane: THREE.Object3D,
    gateCardMeshs: THREE.Mesh[],
): THREE.Mesh | undefined {
    return (
        gateCardMeshs.find((m) => m.name === slotId) ??
        (plane.getObjectByName(slotId) as THREE.Mesh | undefined)
    )
}

/**
 * Tectonic Swipe — Subterra earth aura materializes on both gates
 * before CANCEL_GATE_CARD and SWIPE_GATE_CARD.
 */
export async function TectonicSwipeAnimation({
    scene,
    plane,
    gateCardMeshs,
    data,
}: CustomAnimationContext): Promise<void> {
    const userSlotId = data.slotId
    const targetSlotId =
        typeof data.payload?.targetSlotId === "string"
            ? (data.payload.targetSlotId as slots_id)
            : null
    if (!userSlotId || !targetSlotId) return

    const userGate = resolveGateMesh(userSlotId, plane, gateCardMeshs)
    const targetGate = resolveGateMesh(targetSlotId, plane, gateCardMeshs)
    if (!userGate || !targetGate) return

    const subterra = new THREE.Color(getAttributColor("Subterra"))
    const rock = subterra.clone().lerp(new THREE.Color(0x78350f), 0.45)
    const highlight = subterra.clone().lerp(new THREE.Color(0xfbbf24), 0.35)

    const gates = [userGate, targetGate]
    const originals = gates.map((gate) => {
        const material = gate.material as THREE.MeshStandardMaterial
        return {
            gate,
            material,
            color: material.color.clone(),
            emissive: material.emissive?.clone() ?? new THREE.Color(0, 0, 0),
            emissiveIntensity: material.emissiveIntensity ?? 0,
            origin: gate.position.clone(),
        }
    })

    const disposable: THREE.Object3D[] = []
    const auras: THREE.Mesh[] = []

    for (const gate of gates) {
        const parent = gate.parent ?? plane
        const fx = new THREE.Group()
        fx.position.copy(gate.position)
        fx.position.z += 0.04
        parent.add(fx)
        disposable.push(fx)

        const aura = createSubterraAura(subterra)
        aura.scale.set(0.08, 0.08, 1)
        fx.add(aura)
        auras.push(aura)
    }

    // Rock debris rising along the path between the two gates
    const start = userGate.getWorldPosition(new THREE.Vector3())
    const end = targetGate.getWorldPosition(new THREE.Vector3())
    const rocks: THREE.Mesh[] = []
    for (let i = 0; i < 14; i++) {
        const t = i / 13
        const rockMesh = createRockDebris(i % 2 === 0 ? rock : highlight)
        const pos = start.clone().lerp(end, t)
        pos.x += (Math.random() - 0.5) * 0.5
        pos.z += (Math.random() - 0.5) * 0.5
        rockMesh.position.set(pos.x, 0.05, pos.z)
        rockMesh.scale.setScalar(0.2)
        scene.add(rockMesh)
        rocks.push(rockMesh)
        disposable.push(rockMesh)
    }

    try {
        await Promise.all([
            ...auras.map((aura) =>
                Promise.all([
                    tween(aura.material, {
                        opacity: 0.9,
                        duration: 0.35,
                        ease: "power1.out",
                    }),
                    tween(aura.scale, {
                        x: 1,
                        y: 1,
                        duration: 0.55,
                        ease: "power2.out",
                    }),
                ]),
            ),
            ...originals.map(({ material }) =>
                Promise.all([
                    tween(material.color, {
                        r: subterra.r,
                        g: subterra.g,
                        b: subterra.b,
                        duration: 0.45,
                        ease: "power2.out",
                    }),
                    tween(material, {
                        emissiveIntensity: 1.8,
                        duration: 0.45,
                        ease: "power2.out",
                        onStart: () => {
                            material.emissive.copy(subterra)
                        },
                    }),
                ]),
            ),
            ...rocks.map((rockMesh, index) =>
                Promise.all([
                    tween(rockMesh.material, {
                        opacity: 0.95,
                        duration: 0.2,
                        delay: index * 0.03,
                        ease: "power1.out",
                    }),
                    tween(rockMesh.position, {
                        y: 0.35 + Math.random() * 0.55,
                        duration: 0.45,
                        delay: index * 0.03,
                        ease: "power2.out",
                    }),
                    tween(rockMesh.scale, {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: 0.35,
                        delay: index * 0.03,
                        ease: "back.out(1.4)",
                    }),
                    tween(rockMesh.rotation, {
                        x: Math.random() * Math.PI,
                        y: Math.random() * Math.PI,
                        z: Math.random() * Math.PI,
                        duration: 0.55,
                        delay: index * 0.03,
                        ease: "power1.out",
                    }),
                ]),
            ),
            ...originals.map(({ gate, origin }) =>
                tween(gate.position, {
                    x: origin.x + (Math.random() - 0.5) * 0.08,
                    z: origin.z + (Math.random() - 0.5) * 0.08,
                    duration: 0.08,
                    yoyo: true,
                    repeat: 5,
                    ease: "power1.inOut",
                }),
            ),
        ])

        await Promise.all([
            ...auras.map((aura) =>
                tween(aura.material, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power1.in",
                }),
            ),
            ...rocks.map((rockMesh) =>
                Promise.all([
                    tween(rockMesh.material, {
                        opacity: 0,
                        duration: 0.3,
                        ease: "power1.in",
                    }),
                    tween(rockMesh.position, {
                        y: 0.05,
                        duration: 0.3,
                        ease: "power1.in",
                    }),
                ]),
            ),
        ])
    } finally {
        for (const { gate, material, color, emissive, emissiveIntensity, origin } of originals) {
            gsap.killTweensOf(gate.position)
            gsap.killTweensOf(material.color)
            gsap.killTweensOf(material)
            gate.position.copy(origin)
            // Slight Subterra tint left for the cancel/swipe that follow
            material.color.copy(subterra.clone().lerp(color, 0.35))
            material.emissive.copy(emissive)
            material.emissiveIntensity = emissiveIntensity
        }

        for (const aura of auras) {
            gsap.killTweensOf(aura.material)
            gsap.killTweensOf(aura.scale)
            disposeMesh(aura)
        }

        for (const object of disposable) {
            gsap.killTweensOf(object)
            if (object instanceof THREE.Mesh) {
                gsap.killTweensOf(object.position)
                gsap.killTweensOf(object.scale)
                gsap.killTweensOf(object.rotation)
                gsap.killTweensOf(object.material)
                disposeMesh(object)
            }
            object.parent?.remove(object)
            if (!object.parent) scene.remove(object)
        }
    }
}
