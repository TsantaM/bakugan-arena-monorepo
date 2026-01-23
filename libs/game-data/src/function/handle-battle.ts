import { CheckBattle } from "./check-battle-in-process.js"
import { type stateType } from "../type/type-index.js";

export function handleBattle(roomData: stateType, updateBattleState: boolean = true) {

    if(!roomData) return

    const { battleState } = roomData

    if (battleState.battleInProcess && !battleState.paused && updateBattleState) {
        if (battleState.turns > 0) battleState.turns--
    } else if (!battleState.battleInProcess) {
        CheckBattle({ roomState: roomData })
    }
}