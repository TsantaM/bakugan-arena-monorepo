import { CancelGateCardDirectiveAnimation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { ReaperDarkus } from "../bakugans/reaper.js"
import { GateCards } from "../gate-gards.js"

export const DimmensionQuatre: exclusiveAbilitiesType = {
    key: 'dimmension-four',
    name: 'Dimmension Four',
    description: `Nullifies the opponent's Attribute Gate Card (unable to nullify character, commend or trap gate card)`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (!user) return null

            if (slotOfGate.portalCard === null) return null
            if (slotOfGate.portalCard.userId === user.userId) return null
            const { blocked, canceled, open } = slotOfGate.state
            if (blocked) return null
            if (!open || canceled) return null
            const cardkey = slotOfGate.portalCard.key
            const card = GateCards[cardkey]
            if (!card.attribut) return null

            if (card.onCanceled) {
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount

                })
                card.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                slotOfGate.state.canceled = true
            }

        }

        return null
    },

    activationConditions({ roomState }) {

        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess || paused) return false

        return true

    },

    canUse({ roomState, bakugan }) {

        if (bakugan.key !== ReaperDarkus.key) return false
        const { battleInProcess, paused, slot } = roomState.battleState
        const slots = roomState.protalSlots
        if (!slot) return false
        if (!battleInProcess || paused) return false
        const slotOfBakugan = slots.find((s) => s.bakugans.some((b) => b.key === bakugan.key && b.userId === bakugan.userId))

        if (!slotOfBakugan || slotOfBakugan.id !== slot) return false
        if (slotOfBakugan.portalCard === null) return false
        if (slotOfBakugan.portalCard.userId === bakugan.userId) return false
        const { blocked, canceled, open } = slotOfBakugan.state
        if (blocked) return false
        if (!open || canceled) return false
        const cardkey = slotOfBakugan.portalCard.key
        const card = GateCards[cardkey]
        if (!card.attribut) return false

        return true

    },
}
