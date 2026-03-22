import { Slots, type portalSlotsTypeElement } from "@bakugan-arena/game-data"
import * as THREE from "three"
import { getSlotMeshPosition } from "../functions/get-slot-mesh-position"
import gsap from "gsap"
import { type SlotMeshUsersData } from "../meshes/slot.mesh"

type SwipeGateCardsProps = {
    plane: THREE.Mesh
    slot1: portalSlotsTypeElement
    slot2: portalSlotsTypeElement,
    userId: string,
    scene: THREE.Scene
}


export function SwipeGateCards({ slot2, plane, slot1 }: SwipeGateCardsProps): Promise<void> {

    return new Promise((resolve) => {
        const slot1Mesh = plane.getObjectByName(slot1.id)
        const slot2Mesh = plane.getObjectByName(slot2.id)
        const slot1Position = getSlotMeshPosition({ index: Slots.indexOf(slot1.id) })
        const slot2Position = getSlotMeshPosition({ index: Slots.indexOf(slot2.id) })

        if (!slot1Mesh || !slot1Position || !slot2Position || !slot2Mesh) return resolve();

        const slot1MeshData = slot1Mesh.userData as SlotMeshUsersData
        const slot2MeshData = slot2Mesh.userData as SlotMeshUsersData

        const timeline = gsap.timeline({
            onComplete: () => {
                slot1Mesh.name = slot2.id
                slot1MeshData.state.open = slot2MeshData.state.open
                slot1MeshData.cardName = slot2MeshData.cardName
                slot1MeshData.state.canceled = slot2MeshData.state.canceled
                slot1MeshData.state.blocked = slot2MeshData.state.blocked
            }
        })

        timeline.fromTo(slot1Mesh.position, {
            z: slot1Mesh.position.z,
        }, {
            z: slot2Position.z + 0.05,
            duration: 0.01,
        })

        timeline.fromTo(slot1Mesh.position, {
            x: slot1Mesh.position.x,
            z: slot1Mesh.position.z + 0.05,
            y: slot1Mesh.position.y
        }, {
            x: slot2Position.x,
            z: slot2Position.z,
            y: slot2Position.y,
            duration: 1,
            ease: 'power2.inOut'
        })

        const timeline2 = gsap.timeline({
            delay: 0.01,
            onComplete: () => {
                slot2Mesh.name = slot1.id
                slot2MeshData.state.open = slot1MeshData.state.open
                slot2MeshData.cardName = slot1MeshData.cardName
                slot2MeshData.state.canceled = slot1MeshData.state.canceled
                slot2MeshData.state.blocked = slot1MeshData.state.blocked
                resolve() // ✅ La promesse se résout à la fin du mouvement
            }
        })

        timeline2.fromTo(slot2Mesh.position, {
            x: slot2Mesh.position.x,
            z: slot2Mesh.position.z,
            y: slot2Mesh.position.y
        }, {
            x: slot1Position.x,
            z: slot1Position.z,
            y: slot1Position.y,
            duration: 1,
            ease: 'power2.inOut'
        })


    })

}