import { CheckBattle, CheckBattleStillInProcess, dragBakuganToUserSlot, MoveToAnotherSlotDirectiveAnimation, PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { bakuganOnSlot, slots_id } from "../../type/room-types.js"
import type { bakuganToMoveType2 as bakuganToMoveType } from "../../type/type-index.js"

export const TrappeDeSable: exclusiveAbilitiesType = {
    key: 'trappe-de-sable',
    name: 'Sand Trap',
    description: `Attract one Bakugan from another Gate Card to user's Gate Card and decrease his power by 50 Gs`,
    maxInDeck: 1,
    extraInputs: ['drag-bakugan'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null

        const movableBakugans = roomState.protalSlots.filter((s) => s.portalCard !== null && s.id !== slot && s.bakugans.length > 0).map((slot) => slot.bakugans).flat().filter((b) => !b.statut.trapped && !b.statut.protected && !b.statut.protectedAgainstAbility)

        const bakugans: bakuganToMoveType[] = movableBakugans.map((bakugan) => ({
            key: bakugan.key,
            userId: bakugan.userId,
            slot: bakugan.slot_id
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: 'Sand Trap : Select a Bakugan to drag',
            bakugans: bakugans
        }

        return request


    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        if (!roomState) return
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const slotToDrag: slots_id = resolution.data.slot
        const target: string = resolution.data.bakugan
        const slotTarget = roomState?.protalSlots.find((s) => s.id === slotToDrag)
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === resolution.slot);

        // const targetToDrag = slotTarget?.bakugans.find((b) => b.key === target)
        if (slotOfGate && slotTarget && target !== '') {
            const BakuganTargetIndex = slotTarget.bakugans.findIndex((b) => b.key === target)
            const bakuganToDrag = slotTarget?.bakugans.find((b) => b.key === target)
            const condition = slotOfGate && slotTarget && bakuganToDrag && BakuganTargetIndex ? true : false

            const user = slotOfGate?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

            if (user && bakuganToDrag) {

                PowerChange({
                    bakugan: bakuganToDrag,
                    G: 50,
                    malus: true,
                    roomState: roomState
                })

                dragBakuganToUserSlot({ resolution: resolution, roomState: roomState, origin: 'ABILITY', trapped: true })
            }
        }
    },
    activationConditions: ({ roomState, userId }) => {
        if (!roomState) return false
        const bakugans = roomState.protalSlots.map((slot) => slot.bakugans).flat().length
        if (bakugans < 2) return false
        return true
    },
    canUse({ bakugan, roomState }) {

        if (!roomState) return false
        const bakugansOnOtherSlots = roomState.protalSlots.filter((slot) => slot.id !== bakugan.slot_id).map((slot) => slot.bakugans).flat().filter((b) => !b.statut.trapped && !b.statut.protected && !b.statut.protectedAgainstAbility).length
        if (bakugansOnOtherSlots < 1) return false

        return true
    }
}