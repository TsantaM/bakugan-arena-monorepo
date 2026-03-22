import { GateCardsList, Slots, type portalSlotsTypeElement } from '@bakugan-arena/game-data'
import * as THREE from 'three'
import { getSlotMeshPosition } from '../functions/get-slot-mesh-position'

type SlotMeshUsersData = {
    cardName: string | undefined,
    state: {
        open: boolean,
        canceled: boolean,
        blocked: boolean
    }
}

const slotMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 6),
    new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
    })
)

function createSlotMesh({ slot, plane, userId, gateCardMeshs }: { slot: portalSlotsTypeElement, plane: THREE.Mesh, userId: string, gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] }) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 6),
        new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
        })
    )

    let data: SlotMeshUsersData = {
        cardName: undefined,
        state: {
            blocked: false,
            canceled: false,
            open: false
        }
    }

    const index = Slots.indexOf(slot.id)
    if (slot.portalCard !== null) {
        const card = GateCardsList.find((card) => card.key === slot.portalCard?.key)
        if (!card) return
        if (slot.state.open === true) {
            const texture = new THREE.TextureLoader().load(`./../images/cards/${card.image}`)
            mesh.material.map = texture
            data.cardName = card.name
            data.state.open = true
        } else {
            const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
            mesh.material.map = texture
            if (slot.portalCard.userId === userId) {
                data.cardName = card.name
                data.state.open = false
            }
        }

        if (slot.state.canceled === true) {
            mesh.material.color.set(0.1, 0.1, 0.1)
            data.state.canceled = true
        }

        gateCardMeshs.push(mesh)

    } else {
        mesh.material.transparent = true
        mesh.material.visible = false
        mesh.scale.set(0, 0, 0)
    }

    const position = getSlotMeshPosition({ index: index })
    mesh.position.set(position.x, position.y, position.z)
    mesh.name = slot.id
    data.state.canceled = false
    data.state.open = false
    mesh.userData = data
    plane.add(mesh)

}

export { slotMesh, createSlotMesh, type SlotMeshUsersData }