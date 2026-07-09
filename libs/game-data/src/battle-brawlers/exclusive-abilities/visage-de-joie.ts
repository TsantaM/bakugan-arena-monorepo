import { CancelGateCardDirectiveAnimation } from "../../function/index.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { GateCardsList } from "../gate-gards.js"

export const VisageDeJoie: exclusiveAbilitiesType = {
    key: 'visage-de-joie',
    name: 'Face of Joy',
    description: `Can be used outside of battle. If the opponent's gate card on your slot is open, this card nullifies it. If it has not opened yet, this card prevents that gate card from opening until this card is nullified.`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        const gate = GateCardsList.find((g) => g.key === slotOfGate?.portalCard?.key)

        if (slotOfGate && gate) {
            if (slotOfGate.state.open) {
                CancelGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate,
                    turn: roomState.turnState.turnCount

                })

                if (gate.onCanceled) {
                    gate.onCanceled({ roomState, slot, userId, bakuganKey })
                }
                slotOfGate.state.canceled = true

            } else {
                slotOfGate.state.blocked = {
                    blocked: true,
                    blockedWith: 'ABILITY',
                    key: VisageDeJoie.key
                }

                NewAdditionnalMessage({
                    roomState: roomState,
                    text: `Gate Card is blocked`
                })
            }
        }

        return null
    },
    onCanceled({ roomState, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        
        if (slotOfGate) {
            if(slotOfGate.state.blocked && slotOfGate.state.blocked.blockedWith === 'ABILITY' && slotOfGate.state.blocked.key === VisageDeJoie.key) {
                NewAdditionnalMessage({
                    roomState: roomState,
                    text: `Gate Card is unblocked`
                })
            }
            slotOfGate.state.blocked = false
        }
    }
}