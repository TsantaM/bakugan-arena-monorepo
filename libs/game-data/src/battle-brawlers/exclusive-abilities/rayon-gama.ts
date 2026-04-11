import { CancelAbilityCard, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { TentaclearHaos } from "../bakugans/tentacleer.js"

export const RayonGamma: exclusiveAbilitiesType = {
    key: 'rayon-gamma',
    name: 'Solar Ray',
    description: `Add 100 G to Tentaclear and cancel all opponent's abilities on the same Gate Card`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null
        user.currentPower += 100
        PowerChangeDirectiveAnumation({
            animations: roomState?.animations,
            bakugans: [user],
            powerChange: 100,
            malus: false,
            turn: roomState.turnState.turnCount

        })

        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            const abilities = slotOfGate.activateAbilities.filter((a) => a.userId !== userId)
            if (user) {
                abilities.forEach((a) => {
                    CancelAbilityCard({ abilityKey: a.key, bakuganKey: a.bakuganKey, roomState: roomState, slot: slot, userId: userId })
                })
            }
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null
        user.currentPower -= 100
        PowerChangeDirectiveAnumation({
            animations: roomState?.animations,
            bakugans: [user],
            powerChange: 100,
            malus: true,
            turn: roomState.turnState.turnCount

        })
    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        if (bakugan.key !== TentaclearHaos.key) return false

        return true
    }
}