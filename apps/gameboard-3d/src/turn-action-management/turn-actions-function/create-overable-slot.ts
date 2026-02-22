import { GateCardsList, Slots, type SelectableGateCardAction, type slots_id } from "@bakugan-arena/game-data"
import { getSlotMeshPosition } from "../../functions/get-slot-mesh-position"
import { getAttributColor } from "../../functions/get-attrubut-color"
import { slotMesh } from "../../meshes/slot.mesh"
import * as THREE from 'three'


export function createOverableSlot(slot: slots_id, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, data: SelectableGateCardAction, overable: boolean) {

    const newSlot = slotMesh.clone()
    const position = getSlotMeshPosition({ index: Slots.indexOf(slot) })
    newSlot.position.set(position.x, position.y, position.z)
    newSlot.name = slot
    newSlot.visible = overable ? false : true
    const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
    const cardData = GateCardsList.find((c) => c.key === data.key)
    const gateColor = cardData && cardData.attribut ? getAttributColor(cardData.attribut) : 'crimson'
    const color = new THREE.Color(gateColor)
    newSlot.material.map = texture
    newSlot.material.color = color
    const additionalClass = overable ? 'overable' : 'selected-slot'
    newSlot.userData = {
        classes: ['turn-action-mesh', additionalClass, 'slot-selecter']
    }
    plane.add(newSlot)
}