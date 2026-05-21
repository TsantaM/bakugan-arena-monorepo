import { GateCardImages } from "../../../store/gate-card-images.js"
import { Slots } from "../../../store/slots.js"
import { AnimationDirectivesTypes } from "../../../type/animations-directives.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const Androstasis: gateCardType = {
    key: 'androstasis',
    name: 'Androstasis',
    description: `If the user loses the current battle, their defeated Bakugan remains in the game.`,
    image: GateCardImages.command,
    maxInDeck: 1,
    activeOnBattleEnd: {
        autoActiveOnEnd: true,
        canBeActiveBefore: false,
        activeBeforeElimination: false
    },
    onOpen({ roomState, slot, looserId, loosers }) {
        if (!roomState) return null
        if (!loosers) return null
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const { portalCard } = slotOfGate
        if (portalCard === null) return null

        if (portalCard.userId !== looserId) return null

        const deckToUpdate = roomState?.decksState.find((d) => d.userId === portalCard.userId)
        if (deckToUpdate) {

            loosers.forEach((l) => {
                const bakugan = deckToUpdate.bakugans.find((b) => b?.bakuganData.key === l.key)
                if (!bakugan) return
                if (!bakugan.bakuganData.elimined) return

                bakugan.bakuganData.elimined = false

                const animation: AnimationDirectivesTypes = {
                    type: "REVIVE_BAKUGAN",
                    resolve: false,
                    data: {
                        bakuganKey: bakugan.bakuganData.key,
                        bakuganUserId: portalCard.userId,
                    },
                    message: [{
                        text: `${bakugan.bakuganData.name} revived`,
                        turn: roomState.turnState.turnCount,
                    }]
                }

                roomState.animations.push(animation)
            })

        }

        return null
    },
    autoActivationCheck({ roomState, portalSlot, looser }) {
        if (!roomState) return false
        if (portalSlot.portalCard === null) return false
        if (looser !== portalSlot.portalCard.userId) return false
        return true
    },
}