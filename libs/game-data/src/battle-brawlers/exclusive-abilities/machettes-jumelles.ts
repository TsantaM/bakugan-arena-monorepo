import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const MachettesJumelles: exclusiveAbilitiesType = {
    key: 'machettes-jumelles',
    name: 'Twin Machete',
    maxInDeck: 1,
    description: `Adds 100 Gs to Mantris`,
    usable_in_neutral: false,
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
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilityToCancel = slotOfGate.activateAbilities.find((a) => a.key === 'machettes-jumelles')
            if (user && abilityToCancel) {
                user.currentPower -= 100
                abilityToCancel.canceled = true
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: true,
                    turn: roomState.turnState.turnCount

                })
            }
        }
    },
}
