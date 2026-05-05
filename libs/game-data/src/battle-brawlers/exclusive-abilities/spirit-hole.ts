import { PowerChange, PowerChangeDirectiveAnumation } from "../../function/index.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"

export const SpiritHole: exclusiveAbilitiesType = {
    key: 'spirit-hole',
    name: 'Spirit Hole',
    maxInDeck: 1,
    description: `Adds 50 Gs to your Bakugan for every gate card on the field`,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const gateCount = roomState?.protalSlots.filter((s) => s.portalCard !== null)

        if (slotOfGate && bakuganUser && gateCount) {
            const bonus = 50 * gateCount.length
            PowerChange({
                bakugan: bakuganUser,
                G: bonus,
                malus: false,
                roomState: roomState
            })
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const gateCount = roomState?.protalSlots.filter((s) => s.portalCard !== null)

        if (slotOfGate && bakuganUser && gateCount) {
            const malus = 50 * gateCount.length
            PowerChange({
                bakugan: bakuganUser,
                G: malus,
                malus: true,
                roomState: roomState
            })
        }

        return null
    },
}