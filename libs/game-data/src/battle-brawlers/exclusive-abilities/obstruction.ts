import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const Obstruction: exclusiveAbilitiesType = {
    key: 'obstruction',
    name: 'Dragoon',
    maxInDeck: 1,
    description: `Adds the opponent's G-Power to user`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)
            if (user && opponent) {
                const opponentPower = opponent.currentPower
                user.currentPower += opponentPower
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: opponentPower,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    }
}