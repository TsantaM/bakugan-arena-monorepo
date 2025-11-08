import { CheckBattle } from "./check-battle-in-process"
import { type stateType } from "../type/room-types";

export function handleBattle(roomData: stateType) {

    if(!roomData) return

    const { battleState } = roomData

    if (battleState.battleInProcess && !battleState.paused) {
        if (battleState.turns > 0) battleState.turns--
    } else if (!battleState.battleInProcess) {
        CheckBattle({ roomState: roomData })
    }
}