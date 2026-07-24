import {
    GateCardsList,
    Slots,
    type blockedCardSlotType,
    type portalSlotsTypeElement,
} from '@bakugan-arena/game-data'
import { resolveGateCard } from '@bakugan-arena/i18n'
import * as THREE from 'three'
import { getSlotMeshPosition } from '../functions/get-slot-mesh-position'
import { GetCharacterCardImage } from '../functions/get-character-card-image'
import { killGateCardTweens, removeFromGateCardMeshs } from '../animations/remove-gate-card-animation'
import { getGameboardLocale } from '../i18n/locale'
import { cloneSlotMeshState } from '../functions/mesh-status-user-data'

type SlotMeshUsersData = {
    cardName: string | undefined
    state: {
        open: boolean
        canceled: boolean
        blocked: blockedCardSlotType
    }
}

const slotMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 6),
    new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
    }),
)

function clearExistingSlotMeshes({
    plane,
    slotId,
    gateCardMeshs,
}: {
    plane: THREE.Mesh
    slotId: string
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
}) {
    const existing = plane.children.filter(
        (child): child is THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> =>
            child.name === slotId && (child as THREE.Mesh).isMesh,
    )

    for (const mesh of existing) {
        killGateCardTweens(mesh)
        mesh.removeFromParent()
    }

    removeFromGateCardMeshs(slotId, gateCardMeshs)
}

function createSlotMesh({
    slot,
    plane,
    userId,
    gateCardMeshs,
    isSpectator = false,
}: {
    slot: portalSlotsTypeElement
    plane: THREE.Mesh
    userId: string
    isSpectator: boolean
    gateCardMeshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]
}) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 6),
        new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
        }),
    )

    const data: SlotMeshUsersData = {
        cardName: undefined,
        state: cloneSlotMeshState(slot.state),
    }

    const index = Slots.indexOf(slot.id)
    if (slot.portalCard !== null) {
        const card = GateCardsList.find((card) => card.key === slot.portalCard?.key)
        if (!card) return
        const cardImage = card.imageByAttribut
            ? GetCharacterCardImage(card, slot)
                ? GetCharacterCardImage(card, slot)
                : card.image
            : card.image
        if (slot.state.open === true) {
            const texture = new THREE.TextureLoader().load(
                `./../images/cards/${cardImage ? cardImage : card.image}`,
            )
            mesh.material.map = texture
            data.cardName = resolveGateCard(card.key, getGameboardLocale()).name
            data.state.open = true
        } else {
            const texture = new THREE.TextureLoader().load(`./../images/cards/portal_card.png`)
            mesh.material.map = texture

            if (isSpectator) {
                data.cardName = undefined
                data.state.open = false
            } else {
                if (slot.portalCard.userId === userId) {
                    data.cardName = resolveGateCard(card.key, getGameboardLocale()).name
                }
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
    mesh.userData = data
    plane.add(mesh)
}

export { slotMesh, createSlotMesh, clearExistingSlotMeshes, type SlotMeshUsersData }
