import { type stateType } from "../type/room-types";
import { RemoveGateCardDirectiveAnimation } from "./create-animation-directives/remove-gate-card";
import { ResetSlot } from "./reset-slot";

export const finalizeBattle = ({ roomData, winnerId, loserId }: { roomData: stateType, winnerId?: string, loserId?: string }) => {
    if (!roomData) return
    const { battleState, protalSlots, turnState } = roomData
    if (!battleState || !protalSlots || !turnState) return

    const slotToUpdate = protalSlots.find((s) => s.id === battleState.slot)
    console.log("Winner 1:", winnerId, "Loser 1:", loserId)

    if (winnerId && loserId) {
        console.log("Winner:", winnerId, "Loser:", loserId)
        roomData.turnState.turn = winnerId
        roomData.turnState.previous_turn = loserId

        console.log("Turn set to winner:", roomData.turnState)
    }

    if(!slotToUpdate) return

    RemoveGateCardDirectiveAnimation({
        animations: roomData.animations,
        slot: slotToUpdate
    })

    if (slotToUpdate) ResetSlot(slotToUpdate)

    battleState.battleInProcess = false
    battleState.slot = null
    battleState.turns = 2
    battleState.paused = false
    turnState.set_new_gate = true
    turnState.set_new_bakugan = true

    roomData.animations.push({
        type: 'BATTLE-END',
        resolved: false
    })

}