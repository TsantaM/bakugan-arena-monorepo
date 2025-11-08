import { type portalSlotsTypeElement } from '../type/room-types'
import { GateCardsList } from "../battle-brawlers/gate-gards";


export function GetGateCardImage({slot} : {slot : portalSlotsTypeElement}) {
    const gateCardImage = GateCardsList.find((gate) => gate.key === slot.portalCard?.key)?.image

    if(gateCardImage) {
        return gateCardImage
    } else {
        return 'caracter-portal-card.png'
    }
}