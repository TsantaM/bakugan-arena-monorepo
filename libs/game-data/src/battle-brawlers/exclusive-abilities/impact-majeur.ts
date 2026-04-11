import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const ImpactMajeur: exclusiveAbilitiesType = {
    key: 'impact-majeur',
    name: 'Mega Impact',
    description: `Adds 50 Gs to the user and substract 100 Gs to all opponents Bakugans.`,
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
                user.currentPower += 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })

                oppoents.forEach((o) => {
                    o.currentPower -= 100
                    PowerChangeDirectiveAnumation({
                        animations: roomState?.animations,
                        bakugans: [o],
                        powerChange: 100,
                        malus: true,
                        turn: roomState.turnState.turnCount

                    })
                })
            }
            
        }
        return null
    }
}