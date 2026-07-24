import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { portalSlotsTypeElement, stateType } from "../../type/room-types.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";
import { ApplyAbsorbPowerBoost } from "./power-change.js";
import { isProtectedAgainstGate } from "./protection-status.js";

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

    const applySide = ({
        bakugans,
        value,
        shouldMalus,
    }: {
        bakugans: typeof usersBakugans
        value: number
        shouldMalus: boolean
    }) => {
        bakugans.forEach((bakugan) => {
            if (shouldMalus && isProtectedAgainstGate(bakugan)) {
                NewAdditionnalMessage({
                    roomState,
                    key: 'bakugan_protected',
                    params: { name: Bakugans[bakugan.key].name },
                })
                return
            }

            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [bakugan],
                powerChange: value,
                turn: roomState.turnState.turnCount,
                malus: shouldMalus,
                roomState: roomState
            })

            if (shouldMalus) {
                bakugan.currentPower = bakugan.currentPower - value
            } else {
                bakugan.currentPower = bakugan.currentPower + value
                ApplyAbsorbPowerBoost({ roomState, bakugan, G: value })
            }
        })
    }

    applySide({
        bakugans: usersBakugans,
        value: usersValue,
        shouldMalus: usersPower > opponentsPower,
    })
    applySide({
        bakugans: opponentsBakugans,
        value: opponentsValue,
        shouldMalus: opponentsPower > usersPower,
    })
}
