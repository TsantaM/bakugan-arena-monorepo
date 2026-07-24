import { CustomAnimationDirective } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { Bakugans } from "../bakugans.js"

export const DivisionHolographique: exclusiveAbilitiesType = {
    key: 'holograph-divide',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                user.statut.absorbPowerBoost = {
                    check: true,
                    origin: 'ABILITY',
                    key: DivisionHolographique.key
                }

                CustomAnimationDirective({
                    roomState,
                    animationKey: DivisionHolographique.key,
                    sourceBakugan: user,
                    slotId: slot,
                    message: [{
                        key: 'absorb_power_boost_ready',
                        params: { bakugan: Bakugans[user.key].name },
                        turn: roomState.turnState.turnCount,
                    }],
                })
            }
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                user.statut.absorbPowerBoost = false
            }
        }

        return null
    },
}
