import { CancelGateCardDirectiveAnimation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { GateCardsList } from "../gate-gards.js"

export const GaucheGigantesque: exclusiveAbilitiesType = {
    key: 'gauche-gigantesque',
    name: 'Left Giganti',
    description: `Nullifies opponent's Gate Card`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                if (slotOfGate.state.open && !slotOfGate.state.canceled) {
                    slotOfGate.state.canceled = true
                    CancelGateCardDirectiveAnimation({
                        animations: roomState?.animations,
                        slot: structuredClone(slotOfGate),
                        turn: roomState.turnState.turnCount

                    })

                    const gate = GateCardsList.find((gate) => gate.key === slotOfGate.portalCard?.key)
                    if (gate && gate.onCanceled) {
                        gate.onCanceled({
                            roomState: roomState,
                            slot: slotOfGate.id,
                            userId: userId,
                        })
                    }
                }
            }
        }

        return null
    }
}