import type {
    bakuganOnSlot,
    blockedCardSlotType,
    onSlotStatutType,
    portalSlotsType,
    portalSlotsTypeElement,
} from '@bakugan-arena/game-data'
import * as THREE from 'three'
import type { SpriteUserData } from '../meshes/bakugan.mesh'
import type { SlotMeshUsersData } from '../meshes/slot.mesh'

function cloneOnSlotStatut(statut: onSlotStatutType): onSlotStatutType {
    return statut ? { ...statut } : false
}

export function cloneBakuganStatut(
    statut: bakuganOnSlot['statut'],
): bakuganOnSlot['statut'] {
    return {
        trapped: cloneOnSlotStatut(statut.trapped),
        notRetreat: cloneOnSlotStatut(statut.notRetreat),
        poisoned: cloneOnSlotStatut(statut.poisoned),
        protectedAgainstGate: cloneOnSlotStatut(statut.protectedAgainstGate),
        protectedAgainstAbility: cloneOnSlotStatut(statut.protectedAgainstAbility),
        protected: cloneOnSlotStatut(statut.protected),
        absorbPowerBoost: cloneOnSlotStatut(statut.absorbPowerBoost),
    }
}

export function cloneBlockedState(blocked: blockedCardSlotType): blockedCardSlotType {
    return blocked ? { ...blocked } : false
}

export function cloneSlotMeshState(
    state: portalSlotsTypeElement['state'] | SlotMeshUsersData['state'],
): SlotMeshUsersData['state'] {
    return {
        open: state.open,
        canceled: state.canceled,
        blocked: cloneBlockedState(state.blocked as blockedCardSlotType),
    }
}

export function buildSpriteUserData(bakugan: bakuganOnSlot): SpriteUserData {
    return {
        attribut: bakugan.attribut,
        bakuganKey: bakugan.key,
        powerLevel: bakugan.currentPower,
        image: bakugan.image,
        userId: bakugan.userId,
        slot: bakugan.slot_id,
        abilityBlock: bakugan.abilityBlock,
        assist: bakugan.assist,
        statut: cloneBakuganStatut(bakugan.statut),
    }
}

export function syncBakuganMeshUserData(
    scene: THREE.Scene,
    bakugan: bakuganOnSlot,
): void {
    const mesh = scene.getObjectByName(`${bakugan.key}-${bakugan.userId}`)
    if (!mesh) return

    const next = buildSpriteUserData(bakugan)
    const data = mesh.userData as SpriteUserData
    data.attribut = next.attribut
    data.bakuganKey = next.bakuganKey
    data.powerLevel = next.powerLevel
    data.image = next.image
    data.userId = next.userId
    data.slot = next.slot
    data.abilityBlock = next.abilityBlock
    data.assist = next.assist
    data.statut = next.statut
}

export function syncSlotMeshUserData(
    plane: THREE.Object3D,
    slot: portalSlotsTypeElement,
): void {
    const mesh = plane.getObjectByName(slot.id)
    if (!mesh?.userData?.state) return

    const data = mesh.userData as SlotMeshUsersData
    data.state = cloneSlotMeshState(slot.state)
}

export function syncBoardMeshesFromPortalSlots({
    scene,
    plane,
    slots,
}: {
    scene: THREE.Scene
    plane: THREE.Object3D
    slots: portalSlotsType
}): void {
    for (const slot of slots) {
        syncSlotMeshUserData(plane, slot)
        for (const bakugan of slot.bakugans) {
            syncBakuganMeshUserData(scene, bakugan)
        }
    }
}

/** Accepts client `portalSlots` or server `protalSlots` payloads. */
export function getPortalSlotsFromState(state: {
    portalSlots?: portalSlotsType
    protalSlots?: portalSlotsType
}): portalSlotsType | undefined {
    return state.portalSlots ?? state.protalSlots
}
