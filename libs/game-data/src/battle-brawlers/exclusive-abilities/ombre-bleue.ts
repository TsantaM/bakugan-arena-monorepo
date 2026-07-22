import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const OmbreBleue: exclusiveAbilitiesType = {
    key: 'ombre-bleue',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                PowerChange({
                    bakugan: user,
                    G: 50,
                    malus: false,
                    roomState: roomState
                })
            }
            slotOfGate.state.blocked = {
                blocked: true,
                blockedWith: 'ABILITY',
                key: OmbreBleue.key
            }
            NewAdditionnalMessage({
                roomState: roomState,
                key: 'gate_blocked',
            })
        }
        return null
    }
}