import { BakuganList, Slots, type SelectableBakuganAction, type slots_id } from "@bakugan-arena/game-data"
import { getSlotMeshPosition } from "../../functions/get-slot-mesh-position"
import { slotMesh } from "../../meshes/slot.mesh"
import { getAttributColor } from "../../functions/get-attrubut-color"
import * as THREE from 'three'

export function createOverableBakuganSlot(slot: slots_id, plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, data: SelectableBakuganAction, overable: boolean) {
    const newSlot = slotMesh.clone()
    const position = getSlotMeshPosition({ index: Slots.indexOf(slot) })
    newSlot.position.set(position.x, 5, position.z)
    newSlot.name = slot
    newSlot.visible = overable ? false : true
    const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
    const bakuganData = BakuganList.find((c) => c.key === data.key)
    const gateColor = bakuganData && bakuganData.attribut ? getAttributColor(bakuganData.attribut) : 'crimson'
    const color = new THREE.Color(gateColor)
    newSlot.material.map = texture
    newSlot.material.color = color
    const additionalClass = overable ? 'overable' : 'selected-slot'
    newSlot.userData = {
        classes: ['turn-action-mesh', additionalClass, 'slot-selecter']
    }
    plane.add(newSlot)
}