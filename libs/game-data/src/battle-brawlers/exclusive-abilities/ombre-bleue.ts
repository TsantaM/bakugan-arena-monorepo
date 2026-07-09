import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const OmbreBleue: exclusiveAbilitiesType = {
    key: 'ombre-bleue',
    name: 'Blue Stealth',
    description: `During battle on the slot where this card is activated, this card adds 50 Gs to your Bakugan and prevents the gate card on that slot from opening until this card is nullified.`,
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
                text: `Gate Card is blocked`
            })
        }
        return null
    }
}