import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const AileEnflamee: exclusiveAbilitiesType = {
    key: 'aile-enflammee',
    name: 'Wing Burst',
    description: `Transfers 50 Gs from the opponent to user`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== user?.userId)
            if (user && opponents) {
                user.currentPower += 50
                opponents.forEach((b) => b.currentPower -= 50)
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 50,
                    malus: false,
                    turn: roomState.turnState.turnCount

                })
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: opponents,
                    powerChange: 50,
                    malus: true,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    }
}