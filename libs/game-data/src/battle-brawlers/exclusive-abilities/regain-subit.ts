import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const RegainSubit: exclusiveAbilitiesType = {
    key: 'regain-subit',
    name: 'Regain Subit',
    maxInDeck: 1,
    description: `Retire 100 G à tous les bakugans adverse et ajoute 100 G à l'utilisateur`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            if (user && opponents.length > 0) {
                user.currentPower += 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
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
