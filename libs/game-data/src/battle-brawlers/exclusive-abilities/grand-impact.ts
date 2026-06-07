import { PowerChange } from "../../function/index.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const GrandImpact: exclusiveAbilitiesType = {
    key: 'grand-impact',
    name: 'Grand Impact',
    description: `Transfers 100 Gs from the opponent to Hammer Gorem. And prevents the opponent's Gate Card from opening`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const oppoents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user) {
                PowerChange({
                    bakugan: user,
                    G: 100,
                    malus: false,
                    roomState: roomState
                })

                oppoents.forEach((o) => {
                    PowerChange({
                        bakugan: o,
                        G: 100,
                        malus: true,
                        roomState: roomState
                    })
                })

                if (slotOfGate.portalCard && slotOfGate.portalCard.userId !== userId) {
                    if (!slotOfGate.state.open && !slotOfGate.state.canceled) {
                        slotOfGate.state.blocked = {
                            blocked: true,
                            blockedWith: 'ABILITY',
                            key: GrandImpact.key
                        }

                        NewAdditionnalMessage({
                            roomState: roomState,
                            text: 'Gate Card is blocked by Grand Impact',
                        })

                    } 
                    // else if (slotOfGate.state.open && !slotOfGate.state.canceled) {
                    //     const gate = slotOfGate.portalCard?.key
                    //     const gateToCancel = GateCardsList.find((g) => g.key === gate)
                    //     CancelGateCardDirectiveAnimation({
                    //         animations: roomState.animations,
                    //         slot: slotOfGate,
                    //         turn: roomState.turnState.turnCount
                    //     })
                    //     if (gateToCancel && gateToCancel.onCanceled) {
                    //         gateToCancel.onCanceled({ roomState, slot, userId: userId, bakuganKey: bakuganKey })
                    //     }

                    //     slotOfGate.state.canceled = true
                    // }
                }
            }

        }
        return null
    }
}