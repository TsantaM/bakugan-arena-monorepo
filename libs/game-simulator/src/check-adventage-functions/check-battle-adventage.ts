import { Slots, type bakuganOnSlot, type stateType } from "@bakugan-arena/game-data";

export function CheckBattleAdventage({initialState, newState, userId} : {initialState: stateType, newState: stateType, userId: string}) {
    const {battleInProcess, paused, slot} = initialState.battleState
    if(!battleInProcess || paused || slot === null) return 0

    const slotOfBattle = newState.protalSlots[Slots.indexOf(slot)]
    if(!slotOfBattle) return 0

    const sumCurrentPower = (arr: bakuganOnSlot[]) => arr.reduce((acc, b) => acc + (b?.currentPower ?? 0), 0)
    const userBakugans = slotOfBattle?.bakugans.filter((b) => b.userId === userId)
    const totalPower = sumCurrentPower(userBakugans)
    const oppenentBakugans = slotOfBattle?.bakugans.filter((b) => b.userId !== userId)
    const totalOppo = sumCurrentPower(oppenentBakugans)

    if(totalPower > totalOppo) {
        return 1
    } else {
        return -1
    }
    

}