import { stateType } from "../type/room-types";
import { ResetSlot } from "./reset-slot";

export const finalizeBattle = (roomData: stateType) => {
    if(!roomData) return
    const { battleState, protalSlots, turnState } = roomData
    if (!battleState || !protalSlots || !turnState) return

    const slotToUpdate = protalSlots.find((s) => s.id === battleState.slot)
    if (slotToUpdate) ResetSlot(slotToUpdate)

    battleState.battleInProcess = false
    battleState.slot = null
    battleState.turns = 2
    battleState.paused = false
    turnState.set_new_gate = true
    turnState.set_new_bakugan = true
}