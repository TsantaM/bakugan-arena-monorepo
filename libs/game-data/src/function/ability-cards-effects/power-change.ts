import { Bakugans } from "../../battle-brawlers/bakugans.js";
import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { PowerChangeDirectiveAnumation } from "../create-animation-directives/index.js";
import { NewAdditionnalMessage } from "../new-additional-message.js";

type PowerChangeType = {
    roomState: stateType,
    bakugan: bakuganOnSlot,
    // messages: Message[],
    G: number,
    malus: boolean
}

export function PowerChange({ roomState, bakugan, G, malus }: PowerChangeType) {

    if (malus) {
        if (bakugan.statut.protected || bakugan.statut.protectedAgainstAbility) {

            NewAdditionnalMessage({
                roomState: roomState,
                key: 'bakugan_protected',
                params: { name: Bakugans[bakugan.key].name },
            })

            // messages.push(message)

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
    }

}