import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";

type PowerChangeType = {
    roomState: stateType,
    bakugan: bakuganOnSlot,
    G: number,
    malus: boolean
}

/** Copies a power boost to bakugans on the same slot that have absorbPowerBoost. Only absorbs from opponents (different userId). */
export function ApplyAbsorbPowerBoost({ roomState, bakugan, G }: {
    roomState: stateType,
    bakugan: bakuganOnSlot,
    G: number
}) {
    if (G <= 0) return

    const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
    if (!slot) return

    slot.bakugans.forEach((b) => {
        if (b === bakugan) return
        if (b.userId === bakugan.userId) return
        if (!b.statut.absorbPowerBoost) return

        b.currentPower += G

        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [b],
            powerChange: G,
            malus: false,
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })
    })
}

export function PowerChange({ roomState, bakugan, G, malus }: PowerChangeType) {
    if (malus) {
        if (bakugan.statut.protected || bakugan.statut.protectedAgainstAbility) {
            NewAdditionnalMessage({
                roomState: roomState,
                key: 'bakugan_protected',
                params: { name: Bakugans[bakugan.key].name },
            })
        } else {
            bakugan.currentPower -= G

            PowerChangeDirectiveAnumation({
                animations: roomState.animations,
                bakugans: [bakugan],
                powerChange: G,
                malus: true,
                turn: roomState.turnState.turnCount,
                roomState: roomState
            })
        }
    } else {
        bakugan.currentPower += G

        PowerChangeDirectiveAnumation({
            animations: roomState.animations,
            bakugans: [bakugan],
            powerChange: G,
            malus: false,
            turn: roomState.turnState.turnCount,
            roomState: roomState
        })

        ApplyAbsorbPowerBoost({ roomState, bakugan, G })
    }
}
