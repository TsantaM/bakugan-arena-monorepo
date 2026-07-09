import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const VentViolentDeNobelesseVerte: exclusiveAbilitiesType = {
    key: 'vent-violent-de-noblesse-verte',
    name: 'Green Nobility - Soar Violent Winds',
    description: `During battle on the slot where this card is activated, this card adds 100 Gs to your Bakugan.`,
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
                    G: 100,
                    malus: false,
                    roomState: roomState
                })
            }
        }

        return null
    }
}