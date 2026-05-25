import { AutoActivationDuringBattle, PowerChangeDirectiveAnumation, type gateCardType } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";

export const AspirateurDePuissance: gateCardType = {
    key: 'aspirateur-de-puissance',
    name: 'Energy Merge',
    maxInDeck: 1,
    description: `transfers 100 Gs from the last Bakugan Stand on the card to the first one`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {
        if (!roomState) return null
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]

            if (lastBakugan.statut.protected) return null
            if (lastBakugan.statut.protectedAgainstGate) return null

            firstBakugan.currentPower = firstBakugan.currentPower + 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [firstBakugan],
                powerChange: 100,
                malus: false,
                turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay


            })
            lastBakugan.currentPower = lastBakugan.currentPower - 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [lastBakugan],
                powerChange: 100,
                malus: true,
                turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay


            })
            slotOfGate.state.open = true
        }

        return null
    },
    onCanceled: ({ roomState, slot, userId, bakuganKey }) => {
        if (!roomState) return
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const bakuganUser = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        const bakuganOpponent = slotOfGate?.bakugans.find((b) => b.userId !== userId)

        if (slotOfGate && bakuganUser && bakuganOpponent && slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const firstBakugan = slotOfGate.bakugans[0]
            const lastBakugan = slotOfGate.bakugans[slotOfGate.bakugans.length - 1]
            firstBakugan.currentPower = firstBakugan.currentPower - 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [firstBakugan],
                powerChange: 100,
                malus: true,
                turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay


            })
            lastBakugan.currentPower = lastBakugan.currentPower + 100
            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [lastBakugan],
                powerChange: 100,
                malus: false,
                turn: roomState.turnState.turnCount,
                    animationsForReplay: roomState.animationsForReplay

            })
            slotOfGate.state.canceled = true
        }
    },
    autoActivationCheck: ({ portalSlot, roomState }) => {
        const bakugansOnSlot = portalSlot.bakugans.length
        const canActiveOnBattle = AutoActivationDuringBattle({ roomState: roomState, canActive: false, slotOfGate: portalSlot.id })

        if (canActiveOnBattle === false) {
            return canActiveOnBattle
        } else {
            if (bakugansOnSlot >= 2) {
                return true
            } else {
                return false
            }
        }
    },
}