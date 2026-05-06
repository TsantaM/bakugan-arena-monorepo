import { PowerChange } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const AmunRa: exclusiveAbilitiesType = {
    key: 'amun-ra',
    name: 'Amun Ra',
    description: `Add 100 G to Manion.`,
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null
        PowerChange({
            bakugan: user,
            G: 100,
            malus: false,
            roomState: roomState
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (!user) return null
        PowerChange({
            bakugan: user,
            G: 100,
            malus: true,
            roomState: roomState
        })

    },
    canUse({ roomState, bakugan }) {
        const { battleInProcess, paused, slot } = roomState.battleState

        if (!battleInProcess || paused || slot === null) return false

        if (bakugan.slot_id !== slot) return false

        return true
    }
}