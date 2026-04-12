import { moveSelectedBakugan } from "../../index.js"
import { Slots } from "../../store/slots.js"
import type { AbilityCardsActions, bakuganToMoveType2 as bakuganToMoveType, exclusiveAbilitiesType } from "../../type/type-index.js"

export const Marionnette: exclusiveAbilitiesType = {
    key: 'marionnette',
    name: 'Marionnette',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    description: "Mantris can move any Bakugan to any Gate Card that it's owner chose",
    extraInputs: ['move-bakugan'],
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (!roomState) return null

        if (Marionnette.activationConditions) {
            const checker = Marionnette.activationConditions({ roomState, userId })
            if (checker === false) return null
        }

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const deck = roomState?.decksState.find((d) => d.userId === userId)
        const userData = slotOfGate?.bakugans.find((bakugan) => bakugan.key === bakuganKey && bakugan.userId === userId)

        if (!slotOfGate && !deck && !userData) return null
        if (!slotOfGate) return null
        if (!userData) return null

        const bakugansOnField = roomState.protalSlots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.key !== userData.key && bakugan.userId !== userData.userId)

        const slots = roomState.protalSlots.filter((s) => s.portalCard !== null).map((slot) => slot.id)
        const bakugans: bakuganToMoveType[] = bakugansOnField.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: slotOfGate.id
        }))

        if (slots.length <= 0) return null

        const request: AbilityCardsActions = {
            type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
            message: 'Marionnette : Select a Bakugan to move and his destination',
            bakugans: bakugans,
            slots: slots
        }

        return request

    },
    onAdditionalEffect: ({ resolution, roomData: roomState }) => {
        moveSelectedBakugan({ resolution: resolution, roomState: roomState, requireUserOnSlot: false })
    },
    activationConditions: ({ roomState }) => {
        if (!roomState) return false

        const { battleInProcess, paused } = roomState.battleState

        const slotsWithCard = roomState.protalSlots.map((slot) => slot).filter((slot) => slot.portalCard !== null)

        if (slotsWithCard.length < 3) return false
        const bakugans = slotsWithCard.map((slot) => slot.bakugans).flat()
        if (bakugans.length < 2) return false

        if (battleInProcess && !paused) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        if (bakugan.family !== 'Mantris') return false

        const slot = roomState.protalSlots[Slots.indexOf(bakugan.slot_id)]
        if (slot.bakugans.length > 1) return false

        return true
    },
}