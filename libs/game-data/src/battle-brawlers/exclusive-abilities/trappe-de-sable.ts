import { canMoveBakugan, dragBakuganToUserSlot, PowerChange } from "../../function/index.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { bakuganOnSlot, slots_id } from "../../type/room-types.js"
import type { bakuganToMoveType2 as bakuganToMoveType } from "../../type/type-index.js"

export const TrappeDeSable: exclusiveAbilitiesType = {
    key: 'trappe-de-sable',
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate || !deck || !userData) return null

        const movableBakugans = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat().filter((b) => canMoveBakugan(b, 'ABILITY'))

        const bakugans: bakuganToMoveType[] = movableBakugans.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_drag', params: { abilityKey: TrappeDeSable.key } },
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const targetUserId: string = resolution.data.userId
        const slotTarget = roomState.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState.protalSlots.find((s) => s.id === resolution.slot)

        if (!slotOfGate || !slotTarget || target === '') return

        // Le userId est indispensable : les deux joueurs peuvent avoir le même
        // bakugan sur le slot.
        const bakuganToDrag = slotTarget.bakugans.find(
            (b) => b.key === target && b.userId === targetUserId
        )
        const user = slotOfGate.bakugans.find(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId
        )

        if (!user || !bakuganToDrag) return

        const dragged = dragBakuganToUserSlot({
            resolution,
            roomState,
            origin: 'ABILITY',
            trapped: true,
        })

        if (!dragged) return

        // Le malus ne s'applique que si l'attraction a réellement eu lieu
        const movedBakugan = slotOfGate.bakugans.find(
            (b) => b.key === target && b.userId === targetUserId
        )
        if (!movedBakugan) return

        PowerChange({
            bakugan: movedBakugan,
            G: 50,
            malus: true,
            roomState,
            origin: 'ABILITY',
        })
    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        if (bakugans < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {

        if (!roomState) return false
        const bakugansOnOtherSlots = roomState.protalSlots.filter((slot) => slot.id !== bakugan.slot_id).map((slot) => slot.bakugans).flat().filter((b) => canMoveBakugan(b, 'ABILITY')).length
        if (bakugansOnOtherSlots < 1) return false

        return true
    }
}