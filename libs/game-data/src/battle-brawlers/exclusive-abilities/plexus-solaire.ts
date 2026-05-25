import { CancelGateCardDirectiveAnimation, PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { GateCardsList } from "../gate-gards.js"

export const PlexusSolaire: exclusiveAbilitiesType = {
    key: 'plexus-solaire',
    name: 'Solar Plexus',
    maxInDeck: 1,
    description: `Nullifies opponents Gate Card and substract 50 Gs to opponent`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            const gate = GateCardsList.find((g) => g.key === slotOfGate.portalCard?.key)

            if (user && opponent) {
                PowerChange({
                    bakugan: opponent,
                    G: 50,
                    malus: true,
                    roomState: roomState
                })
                if (gate && gate.onCanceled && slotOfGate.state.open && !slotOfGate.state.canceled) {
                    CancelGateCardDirectiveAnimation({
                        animations: roomState.animations,
                        slot: structuredClone(slotOfGate),
                        turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

                    })
                    gate.onCanceled({ roomState: roomState, slot: slot, userId: userId, bakuganKey: bakuganKey })
                    slotOfGate.state.canceled = true
                }
            }


        }

        return null
    }
}