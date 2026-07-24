import { PowerChange } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const RegainSubit: exclusiveAbilitiesType = {
    key: 'regain-subit',
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
                PowerChange({
                    roomState,
                    bakugan: user,
                    G: 100,
                    malus: false,
                })
                opponents.forEach((opponent) => {
                    PowerChange({
                        roomState,
                        bakugan: opponent,
                        G: 100,
                        malus: true,
                    })
                })
            }
        }

        return null
    }
}
