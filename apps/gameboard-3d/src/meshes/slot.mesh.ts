import { GateCardsList, Slots, type portalSlotsTypeElement } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { getSlotMeshPosition } from '../functions/get-slot-mesh-position'

const slotMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 6),
    new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
    })
)

function createSlotMesh({ slot, plane }: { slot: portalSlotsTypeElement, plane: THREE.Mesh }) {
    const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 6),
    new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
    })
)

    const index = Slots.indexOf(slot.id)
    if (slot.portalCard !== null) {
        const card = GateCardsList.find((card) => card.key === slot.portalCard?.key)
        if (!card) return
        if (slot.state.open === true) {
            const texture = new THREE.TextureLoader().load(`./../images/cards/${card.image}`)
            mesh.material.map = texture
        } else {
            const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
            mesh.material.map = texture
        }

        if(slot.state.canceled === true) {
            mesh.material.color.set(0.1, 0.1, 0.1)
        }

    } else {
        mesh.material.transparent = true
        mesh.material.visible = false
        mesh.scale.set(0, 0, 0)
    }

    const position = getSlotMeshPosition({ index: index})
    mesh.position.set(position.x, position.y, position.z)
    mesh.name = slot.id
    mesh.userData.isCanceled = false
    plane.add(mesh)

}

export { slotMesh, createSlotMesh }