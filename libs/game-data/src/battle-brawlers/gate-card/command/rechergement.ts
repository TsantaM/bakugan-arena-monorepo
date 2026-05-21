import { type gateCardType, PowerChange } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";

export const Rechargement: gateCardType = {
    key: 'rechargement',
    name: 'Reloaded',
    maxInDeck: 1,
    description: `Adds 100 Gs to your Bakugan for each Bakugan on field with the same attribut`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot, bakuganKey, userId }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)

        if (slotOfGate && bakuganUser && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const bakuganAttribut = bakuganUser.attribut
            const sameAttributOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === bakuganAttribut).map((b) => b.key))
            if (sameAttributOnDomain) {
                slotOfGate.state.open = true
                const merged = sameAttributOnDomain.flat()
                const bonus = 100 * merged.length
                PowerChange({
                    bakugan: bakuganUser,
                    G: bonus,
                    malus: false,
                    roomState: roomState
                })
            }
        }

        return null

    },
    onCanceled: ({ roomState, slot }) => {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const gateOwner = slotOfGate?.bakugans.find((b) => b.userId === slotOfGate.portalCard?.userId)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === gateOwner?.key && b.userId === gateOwner.userId)

        if (slotOfGate && bakuganUser && slotOfGate.state.open && !slotOfGate.state.canceled) {
            const bakuganAttribut = bakuganUser.attribut
            const sameAttributOnDomain = roomState?.protalSlots.map((s) => s.bakugans.filter((b) => b.attribut === bakuganAttribut).map((b) => b.key))
            if (sameAttributOnDomain) {
                const merged = sameAttributOnDomain.flat()
                const malus = 100 * merged.length
                slotOfGate.state.canceled = true
                PowerChange({
                    bakugan: bakuganUser,
                    G: malus,
                    malus: true,
                    roomState: roomState
                })
            }
        }
    }
}