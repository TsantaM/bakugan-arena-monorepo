import { Slots, type portalSlotsTypeElement } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { getSlotMeshPosition } from '../functions/get-slot-mesh-position'
import gsap from 'gsap'
import { MoveBakugan } from './move-bakugan-animation'

type MoveGateCardProps = {
    plane: THREE.Mesh
    slot: portalSlotsTypeElement
    newSlot: portalSlotsTypeElement,
    userId: string,
    scene: THREE.Scene
}


export async function MoveGateCard({ plane, slot, newSlot, scene, userId }: MoveGateCardProps): Promise<void> {
    const initialSlotMesh = plane.getObjectByName(slot.id)

    const initialSlotPosition = getSlotMeshPosition({ index: Slots.indexOf(slot.id) })
    const newSlotPosition = getSlotMeshPosition({ index: Slots.indexOf(newSlot.id) })

    if (!initialSlotMesh || !initialSlotPosition || !newSlotPosition) return

    const moveGate = new Promise<void>((resolve) => {
        const timeline = gsap.timeline({
            onComplete: () => {
                initialSlotMesh.name = newSlot.id
                resolve()
            }
        })

        timeline.fromTo(initialSlotMesh.position, {
            z: initialSlotMesh.position.z,
        }, {
            z: newSlotPosition.z + 0.05,
            duration: 0.01,
        })

        timeline.fromTo(initialSlotMesh.position, {
            x: initialSlotMesh.position.x,
            z: initialSlotMesh.position.z + 0.05,
            y: initialSlotMesh.position.y
        }, {
            x: newSlotPosition.x,
            z: newSlotPosition.z,
            y: newSlotPosition.y,
            duration: 1,
            ease: 'power2.inOut'
        })
    })

    const moveBakugans = slot.bakugans.length > 0
        ? Promise.all(
            slot.bakugans.map((b) =>
                MoveBakugan({
                    bakugan: b,
                    scene: scene,
                    slot: newSlot,
                    userId: userId,
                    duration: 1
                })
            )
        )
        : Promise.resolve()

    await Promise.all([moveGate, moveBakugans])
}
