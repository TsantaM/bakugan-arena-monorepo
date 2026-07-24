import { portalSlotsTypeElement, stateType } from "../../type/room-types.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";
import { ApplyAbsorbPowerBoost } from "./power-change.js";

export function SwipePowerLevelsEffects({ roomState, slot, userId }: { roomState: stateType, slot: portalSlotsTypeElement, userId: string }) {
    if (!roomState) return

    const usersBakugans = slot.bakugans.filter((bakugan) => bakugan.userId === userId)
    const opponentsBakugans = slot.bakugans.filter((bakugan) => bakugan.userId !== userId)

    if (usersBakugans.length === 0 || opponentsBakugans.length === 0) return

    const usersPower = usersBakugans.reduce((acc, bakugan) => acc + structuredClone(bakugan.currentPower), 0)
    const opponentsPower = opponentsBakugans.reduce((acc, bakugan) => acc + structuredClone(bakugan.currentPower), 0)
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
            roomState: roomState

        })
    })

    opponentsBakugans.forEach((bakugan) => {
        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: opponentsValue,
            turn: roomState.turnState.turnCount,
            malus: opponentsPower > usersPower,
            roomState: roomState

        })

    })

    usersBakugans.forEach((bakugan) => {
        if (usersPower > opponentsPower) {
            bakugan.currentPower = bakugan.currentPower - usersValue
        } else {
            bakugan.currentPower = bakugan.currentPower + usersValue
            ApplyAbsorbPowerBoost({ roomState, bakugan, G: usersValue })
        }
    })

    opponentsBakugans.forEach((bakugan) => {
        if (usersPower > opponentsPower) {
            bakugan.currentPower = bakugan.currentPower + opponentsValue
            ApplyAbsorbPowerBoost({ roomState, bakugan, G: opponentsValue })
        } else {
            bakugan.currentPower = bakugan.currentPower - opponentsValue
        }
    })

}
