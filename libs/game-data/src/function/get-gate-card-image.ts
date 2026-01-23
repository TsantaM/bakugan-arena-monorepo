import { type portalSlotsTypeElement } from '../type/type-index.js'
import { GateCardsList } from "../battle-brawlers/gate-gards.js";


export function GetGateCardImage({slot} : {slot : portalSlotsTypeElement}) {
    const gateCardImage = GateCardsList.find((gate) => gate.key === slot.portalCard?.key)?.image

    if(gateCardImage) {
        return gateCardImage
    } else {
        return 'caracter-portal-card.png'
    }
}