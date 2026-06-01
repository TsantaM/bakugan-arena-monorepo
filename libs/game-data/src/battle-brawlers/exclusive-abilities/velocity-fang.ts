import { CancelAbilityCardEffect, PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const VelocityFang: exclusiveAbilitiesType = {
    key: 'velocity-fang',
    name: 'Velocity Fang',
    maxInDeck: 1,
    description: `Nullifies the opponent's ability, also subtracts 100 Gs from the opponent.`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const opponents = slotOfGate.bakugans.filter((b) => b.userId !== userId)

            const abilities = roomState.protalSlots.flatMap((s) => s.activateAbilities).filter((ability) => ability.userId !== userId && !ability.canceled)

            if (user && opponents.length > 0) {

                abilities.forEach((lastAbility) => {
                    CancelAbilityCardEffect({
                        ability: lastAbility,
                        roomState: roomState,
                        slotOfGate: slotOfGate,
                    })

                })

                opponents.forEach((o) => {
                    PowerChange({
                        bakugan: o,
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
