import { PowerChange } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const GrandEsprit: gateCardType = {
    key: 'grand-esprit',
    name: 'Grand Spirit',
    maxInDeck: 1,
    description: `Adds 50 Gs to your Bakugan for every gate card on the field`,
    image: GateCardImages.command,
    onOpen({ roomState, slot, bakuganKey, userId }) {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const gateCount = roomState?.protalSlots.filter((s) => s.portalCard !== null)

        if (slotOfGate && bakuganUser && gateCount && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bonus = 50 * gateCount.length
            slotOfGate.state.open = true
            PowerChange({
                bakugan: bakuganUser,
                G: bonus,
                malus: false,
                roomState: roomState
            })
        }

        return null
    },
    onCanceled({ roomState, slot, bakuganKey, userId }) {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const gateOwner = slotOfGate?.bakugans.find((b) => b.userId === slotOfGate.portalCard?.userId)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === gateOwner?.key && b.userId === gateOwner.userId)
        const gateCount = roomState.protalSlots.filter((s) => s.portalCard !== null)

        if (slotOfGate && bakuganUser && gateCount && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const malus = 50 * gateCount.length
            slotOfGate.state.canceled = true
                PowerChange({
                    bakugan: bakuganUser,
                    G: malus,
                    malus: true,
                    roomState: roomState
                })
        }
    },
}
