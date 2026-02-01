// Cette fonction vient vérifier s'il y a un combat au moment où l'on souhaite activer automatiquement la carte il y a un combat en cours et si la carte peut s'ouvrir ou non

import { stateType, slots_id } from "../../type/room-types.js";

export function AutoActivationDuringBattle({roomState, canActive, slotOfGate} : {roomState: stateType, canActive: boolean, slotOfGate: slots_id}) {

    if(!roomState) return true

    const battleState = roomState.battleState

    if(battleState.battleInProcess && battleState.slot && !battleState.paused && battleState.slot !== slotOfGate) {
        return canActive
    } else {
        return true
    }

}