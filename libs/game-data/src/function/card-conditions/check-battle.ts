import { bakuganOnSlot, stateType } from "../../type/type-index.js"

type CheckBattleProps = {
    roomState: stateType,
}

export function CheckBattle({roomState} : CheckBattleProps ): boolean {

    const { battleInProcess, paused, slot } = roomState.battleState

    if(!battleInProcess || paused) return false

    return true

}