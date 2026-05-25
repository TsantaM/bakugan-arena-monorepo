import { ComeBackBakuganDirectiveAnimation } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const RetourDAssenceur: gateCardType = {
    key: 'retour-d-air',
    name: `Retour d'assenceur`,
    maxInDeck: 1,
    description: `Oblige le Bakugan de l'adversaire mis en jeu à revenir immédiatement entre les main de son propriétaire`,
    image: GateCardImages.command,
    onOpen({ roomState, slot, userId }) {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            const opponent = slotOfGate.bakugans.filter((b) => b.userId !== userId)
            if (opponent.length > 0) {
                const opponentDeck = roomState?.decksState.find((d) => d.userId !== userId)
                const opponentsKey = opponent.map((b) => b.key)
                const bakugansOnGate = opponentDeck?.bakugans.filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined && opponentsKey.includes(b.bakuganData.key)).map(b => b.bakuganData)
                slotOfGate.state.open = true
                opponent.forEach((b) => {
                    const index = slotOfGate.bakugans.findIndex((ba) => ba.key === b.key && ba.userId === b.userId)
                    if (index !== -1 && bakugansOnGate && roomState) {
                        slotOfGate.bakugans.splice(index, 1)
                        bakugansOnGate?.forEach((b) => {
                            b.onDomain = false
                        })
                        roomState.battleState.battleInProcess = false
                        roomState.battleState.slot = null
                        roomState.battleState.paused = false
                        ComeBackBakuganDirectiveAnimation({
                            animations: roomState.animations,
                            bakugan: b,
                            slot: slotOfGate,
                    animationsForReplay: roomState.animationsForReplay

                        })
                    }
                })
            }
        }

        return null
    },
    onCanceled() {
        return
    },
}