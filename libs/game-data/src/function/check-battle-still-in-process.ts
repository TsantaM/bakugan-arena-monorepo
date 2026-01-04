import { stateType } from "../type/room-types";

export function CheckBattleStillInProcess(roomState: stateType) {
    if (!roomState) return

    const { battleState, protalSlots, turnState } = roomState
    console.log('still in battle checker', battleState)

    if (!battleState.battleInProcess) return

    const battleSlot = protalSlots.find((slot) => slot.id === battleState.slot)


    if (!battleSlot) return

    console.log('still', battleSlot, battleSlot.portalCard, )

    const bakugans = battleSlot.bakugans

    if (bakugans.length > 1) return

    battleState.battleInProcess = false
    battleState.slot = null
    battleState.turns = 2
    battleState.paused = false
    turnState.set_new_gate = true
    turnState.set_new_bakugan = true

    roomState.animations.push({
        type: 'BATTLE-END',
        resolved: false
    })

}