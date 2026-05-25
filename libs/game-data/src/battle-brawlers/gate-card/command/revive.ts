import { GateCardImages } from "../../../store/gate-card-images.js"
import { Slots } from "../../../store/slots.js"
import { AnimationDirectivesTypes } from "../../../type/animations-directives.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const Revive: gateCardType = {
    key: 'revive',
    name: 'Revive',
    description: `If the user wins, all of their defeated Bakugan can be used again.`,
    image: GateCardImages.command,
    maxInDeck: 1,
    activeOnBattleEnd: {
        autoActiveOnEnd: true,
        canBeActiveBefore: false,
        activeBeforeElimination: false
    },
    autoActivationCheck({ roomState, portalSlot, winner }) {

        if (!roomState) return false
        if (portalSlot.portalCard === null) return false
        const { userId } = portalSlot.portalCard
        if (userId !== winner) return false

        return true

    },
    onOpen({ roomState, slot, winnerId }) {

        if (!roomState) return null
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        if (slotOfGate.portalCard === null) return null
        if (slotOfGate.portalCard.key !== Revive.key) return null
        const userId = slotOfGate.portalCard.userId
        if (userId !== winnerId) return null

        const deckToUpdate = roomState?.decksState.find((d) => d.userId === userId)

        if (deckToUpdate) {
            deckToUpdate.bakugans.filter((b) => b && b.bakuganData.elimined === true).forEach((b) => {
                if (!b) return null
                b?.bakuganData.elimined ? b.bakuganData.elimined = false : b?.bakuganData.elimined

                const animation: AnimationDirectivesTypes = {
                    type: "REVIVE_BAKUGAN",
                    resolve: false,
                    data: {
                        bakuganKey: b?.bakuganData.key,
                        bakuganUserId: userId,
                    },
                    message: [{
                        text: `${b.bakuganData.name} revived`,
                        turn: roomState.turnState.turnCount,
                    }]
                }

                roomState.animations.push(animation)
                roomState.animationsForReplay.push(animation)

            })
        }

        return null

    },
}