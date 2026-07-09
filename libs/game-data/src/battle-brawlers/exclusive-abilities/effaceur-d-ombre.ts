import { CancelGateCardDirectiveAnimation, PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { GateCardsList } from "../gate-gards.js"

export const EffecteurdOmbre: exclusiveAbilitiesType = {
    key: `effaceur-d'ombre`,
    description: `During battle on the battle slot, this card subtracts 50 Gs from an opponent Bakugan on that slot and nullifies the opponent's open gate card on that slot if it has not already been canceled.`,
    name: `Shadow Scratch`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const gateCard = GateCardsList.find((card) => card.key === slotOfGate.portalCard?.key)
            if (slotOfGate.state.open && !slotOfGate.state.canceled && gateCard && gateCard.onCanceled) {
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: structuredClone(slotOfGate),
                    turn: roomState.turnState.turnCount

                })
                gateCard.onCanceled({ roomState: roomState, slot: slot, userId: userId, bakuganKey: bakuganKey })
            }
            slotOfGate.state.canceled = true

            if (user && opponent) {
                PowerChange({
                    bakugan: opponent,
                    G: 50,
                    malus: true,
                    roomState: roomState
                })
            }
        }

        return null
    },
    canUse({ roomState, bakugan }) {

        const { battleInProcess, paused, slot } = roomState.battleState

        if(!battleInProcess || paused) return false

        if(bakugan.slot_id !== slot) return false

        return true
    },
}
