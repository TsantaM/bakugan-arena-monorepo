import { portalSlotsTypeElement, stateType } from "../../type/room-types.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";

export function SwipePowerLevelsEffects({ roomState, slot, userId }: { roomState: stateType, slot: portalSlotsTypeElement, userId: string }) {
    if (!roomState) return

    const usersBakugans = slot.bakugans.filter((bakugan) => bakugan.userId === userId)
    const opponentsBakugans = slot.bakugans.filter((bakugan) => bakugan.userId !== userId)

    if (usersBakugans.length === 0 || opponentsBakugans.length === 0) return

    const usersPower = usersBakugans.reduce((acc, bakugan) => acc + structuredClone(bakugan.currentPower), 0)
    // const originalUsersPower = structuredClone(usersPower)
    const opponentsPower = opponentsBakugans.reduce((acc, bakugan) => acc + structuredClone(bakugan.currentPower), 0)
    // const originalOpponentsPower = structuredClone(opponentsPower)
    const powerGap = usersPower > opponentsPower ? usersPower - opponentsPower : opponentsPower - usersPower
    const usersValue = powerGap / usersBakugans.length
    const opponentsValue = powerGap / opponentsBakugans.length


    if (usersPower === opponentsPower) return

    usersBakugans.forEach((bakugan) => {
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: usersValue,
            turn: roomState.turnState.turnCount,
            malus: usersPower > opponentsPower,
        })
    })

    opponentsBakugans.forEach((bakugan) => {
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: opponentsValue,
            turn: roomState.turnState.turnCount,
            malus: opponentsPower > usersPower,
        })

    })

    usersBakugans.forEach((bakugan) => {
        if (usersPower > opponentsPower) {
            bakugan.currentPower = bakugan.currentPower - usersValue
        } else {
            bakugan.currentPower = bakugan.currentPower + usersValue
        }
    })

    opponentsBakugans.forEach((bakugan) => {
        if (usersPower > opponentsPower) {
            bakugan.currentPower = bakugan.currentPower + opponentsValue
        } else {
            bakugan.currentPower = bakugan.currentPower - opponentsValue
        }
    })

}