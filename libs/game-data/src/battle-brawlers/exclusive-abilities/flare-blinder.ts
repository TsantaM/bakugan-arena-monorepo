import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { TentaclearHaos } from "../bakugans/tentacleer.js"

export const FlareBlinder: exclusiveAbilitiesType = {
    key: 'flare-blinder',
    name: 'Flare Blinder',
    maxInDeck: 1,
    description: `Prevent the opponent from opening the Gate Card or activating abilities on the same slot as the user.`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (bakuganKey !== TentaclearHaos.key) return null
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const opponent = slotOfGate.bakugans.filter((b) => b.userId !== userId)

        const { canceled, open } = slotOfGate.state

        if (!open && !canceled) {
            slotOfGate.state.blocked = true
        }

        opponent.forEach((bakugan) => {
            bakugan.abilityBlock = true
        })

        return null
    },
    onCanceled({ roomState, userId, slot }) {

        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return null
        const opponent = slotOfGate.bakugans.filter((b) => b.userId !== userId)

        const { blocked } = slotOfGate.state
        if (blocked) {
            slotOfGate.state.blocked = false
        }

        opponent.forEach((bakugan) => {
            bakugan.abilityBlock = false
        })

    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        if (bakugan.key !== TentaclearHaos.key) return false

        return true
    },
}