import { PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { ReaperDarkus } from "../bakugans/reaper.js"


export const ReaperOfTheChaos: exclusiveAbilitiesType = {
    key: 'reaper-of-the-chaos',
    name: 'Reaper of the Chaos',
    description: `Add 100 Gs to Reaper`,
    maxInDeck: 1,
    usable_if_user_not_on_domain: false,
    usable_in_neutral: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
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
                if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

            if (user) {
                user.currentPower -= 100
                PowerChangeDirectiveAnumation({
                    animations: roomState?.animations,
                    bakugans: [user],
                    powerChange: 100,
                    malus: true,
                    turn: roomState.turnState.turnCount

                })
            }
        }

        return null
    },
    activationConditions({ roomState, userId }) {
        const { battleInProcess, paused } = roomState.battleState
        if (!battleInProcess || paused) return false

        return true
    },
    canUse({ roomState, bakugan }) {
        if (bakugan.key !== ReaperDarkus.key) return false
        const { battleInProcess, paused, slot } = roomState.battleState
        const slots = roomState.protalSlots
        if (!slot) return false
        if (!battleInProcess || paused) return false
        const slotOfBakugan = slots.find((s) => s.bakugans.some((b) => b.key === bakugan.key && b.userId === bakugan.userId))

        if (!slotOfBakugan || slotOfBakugan.id !== slot) return false

        return true
    },
}