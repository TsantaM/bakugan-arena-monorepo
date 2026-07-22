import { Slots, SwipePowerLevelsEffects, type gateCardType } from "../../../index.js";
import { GateCardImages } from "../../../store/gate-card-images.js";


export const SuperPyrus: gateCardType = {
    key: 'super-pyrus',
    maxInDeck: 1,
    image: GateCardImages.command,
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