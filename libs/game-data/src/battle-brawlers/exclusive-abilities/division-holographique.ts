import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const DivisionHolographique: exclusiveAbilitiesType = {
    key: 'division-holographique',
    name: 'Division Holographique',
    maxInDeck: 1,
    description: `Permet à l'utilisateur de se protéger en absorbant la puissance des carte maîtrise utilisé contre lui`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    }
}