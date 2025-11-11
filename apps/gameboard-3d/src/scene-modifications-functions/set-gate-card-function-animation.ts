import { Slots, type portalSlotsTypeElement } from "@bakugan-arena/game-data";
import * as THREE from 'three'
import { SetGateCardAnimation } from "../animations/set-gate-card-animation";
import { createSlotMesh } from "../meshes/slot.mesh";

export async function SetGateCardFunctionAndAnimation({ slot, plane }: { slot: portalSlotsTypeElement, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> }) {
    
    console.log(slot)
    
    createSlotMesh({
        plane: plane,
        slot: slot
    })

    if (slot.portalCard !== null) {
        const cardMesh = plane.getObjectByName(slot.id)
        if (cardMesh) {
            await SetGateCardAnimation({
                card: slot.portalCard,
                cardMesh: cardMesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
                index: Slots.indexOf(slot.id),
            })
        }
    }
}