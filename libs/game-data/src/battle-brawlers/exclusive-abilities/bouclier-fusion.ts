import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const BouclierFusion: exclusiveAbilitiesType = {
    key: 'bouclier-fusion',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponent = slotOfGate.bakugans.find((b) => b.userId !== userId)

            if (user && opponent) {
                const currentOpponentPower = opponent.currentPower
                const baseOpponentPower = opponent.powerLevel
                const opponentBoost = currentOpponentPower - baseOpponentPower
                if (opponentBoost > 0) {
                    PowerChange({
                        bakugan: user,
                        G: opponentBoost,
                        malus: false,
                        roomState: roomState
                    })
                }
            }
        }

        return null
    }
}