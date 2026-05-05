import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
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
                PowerChange({
                    bakugan: user,
                    G: 50,
                    malus: false,
                    roomState: roomState
                })
                opponents.forEach((opponent) => {
                    PowerChange({
                        bakugan: opponent,
                        G: 100,
                        malus: true,
                        roomState: roomState
                    })
                })
            }
        }

        return null
    }
}