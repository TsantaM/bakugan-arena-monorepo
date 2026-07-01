import { Bakugans, Slots, type slots_id, type stateType } from "@bakugan-arena/game-data";

export function CheckBasePowerAdventage({newState, userId, slot, bakuganKey} : {newState: stateType, userId: string, slot: slots_id, bakuganKey: string}) {

    const slotOfAction = newState.protalSlots[Slots.indexOf(slot)]
    if(!slotOfAction) return 0

    const opponentBakugans = slotOfAction?.bakugans.filter((b) => b.userId !== userId)
    if(opponentBakugans.length === 0) return 0
    const totalOppo = opponentBakugans.reduce((acc, b) => acc + (b?.currentPower ?? 0), 0)
    
    const userBakugan = slotOfAction.bakugans.find((b) => b.userId === userId && b.key === bakuganKey)
    if(!userBakugan) return 0
    const totalPower = userBakugan.currentPower

    if(totalPower > totalOppo) {
        return 1
    } else {
        return -1
    }

}