import { Slots, SwipePowerLevelsEffects, type gateCardType } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";


export const SuperPyrus: gateCardType = {
    key: 'super-pyrus',
    name: 'Super Pyrus',
    maxInDeck: 1,
    image: GateCardImages.command,
    description: `When this trap gate card opens on its slot with at least two Bakugan, this card equalizes combined G-Power between its owner's Bakugan and the opponent's Bakugan on that slot by transferring Gs from the stronger side to the weaker side. This card can open automatically at the end of battle before eliminations. The change is reversed if this card is nullified.`,
    activeOnBattleEnd: {
        canBeActiveBefore: true,
        autoActiveOnEnd: false,
        activeBeforeElimination: true
    },
    onOpen({ roomState, slot }) {

        if (!roomState) return null
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const userId = slotOfGate.portalCard?.userId
        if (!userId) return null

        SwipePowerLevelsEffects({
            roomState: roomState,
            slot: slotOfGate,
            userId: userId
        })

        return null

    },
    onCanceled({ roomState, slot }) {
        if (!roomState) return null
        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        const userId = slotOfGate.portalCard?.userId
        if (!userId) return null

        SwipePowerLevelsEffects({
            roomState: roomState,
            slot: slotOfGate,
            userId: userId
        })

        return null
    },
}