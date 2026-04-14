import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const VisageDeLaFureur: exclusiveAbilitiesType = {
    key: 'visage-de-la-fureur',
    name: 'Face of Rage',
    description: `Add 50 Gs to the user and take 100 to each opponent`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 50
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
                opponents.forEach((opponent) => {
                    opponent.currentPower -= 100
                })
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: opponents,
                    powerChange: 100,
                    malus: true,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    }
}