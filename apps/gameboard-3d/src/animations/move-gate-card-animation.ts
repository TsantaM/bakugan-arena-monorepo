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


export function MoveGateCard({ plane, slot, newSlot, scene, userId }: MoveGateCardProps): Promise<void> {
    return new Promise((resolve) => {
        const initialSlotMesh = plane.getObjectByName(slot.id)

        const initialSlotPosition = getSlotMeshPosition({ index: Slots.indexOf(slot.id) })
        const newSlotPosition = getSlotMeshPosition({ index: Slots.indexOf(newSlot.id) })

        if (!initialSlotMesh || !initialSlotPosition || !newSlotPosition) return resolve()


        const timeline = gsap.timeline({
            onComplete: () => {
                initialSlotMesh.name = newSlot.id
                resolve() // ✅ La promesse se résout à la fin du mouvement
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

        if(slot.bakugans.length > 0) {
            slot.bakugans.forEach(async (b) => {
                await MoveBakugan({
                    bakugan: b,
                    scene: scene,
                    slot: newSlot,
                    userId: userId,
                    duration: 1
                })
            })
        }
    })
}