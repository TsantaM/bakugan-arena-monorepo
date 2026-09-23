import { CustomAnimationDirective } from "../../function/index.js"
import { LegendarySoldiersImage } from "../../store/gate-card-images.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { Bakugans } from "../bakugans.js"

export const AtomicBrave: exclusiveAbilitiesType = {
    key: 'atomic-brave',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    image: LegendarySoldiersImage.subterra,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            if (user) {
                user.statut.absorbPowerBoost = {
                    check: true,
                    origin: 'ABILITY',
                    key: AtomicBrave.key
                }

                CustomAnimationDirective({
                    roomState,
                    animationKey: AtomicBrave.key,
                    sourceBakugan: user,
                    targetBakugans: slotOfGate.bakugans.filter((b) => b.userId !== userId),
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
