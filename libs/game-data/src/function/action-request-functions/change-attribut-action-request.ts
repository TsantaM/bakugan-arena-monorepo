import { Bakugans } from "../../battle-brawlers/index.js";
import { ActionType, attribut, stateType } from "../../type/type-index.js";

export function ChangeAttributActionRequest({roomState} : {roomState: stateType}) {

    const slots = roomState.protalSlots
    const userId = roomState.turnState.turn
    const bakugans = slots.map((slot) => slot.bakugans).flat().filter((bakugan) => bakugan.userId === userId).filter((bakugan) => Bakugans[bakugan.key].canChangeAttribut && !bakugan.alreadyChangeAttribut)

    const attriubtsList: attribut[] = ["Aquos", "Darkus", "Haos", "Pyrus", "Subterra", "Ventus"] 
    let request: ActionType = {
        type: "CHANGE_ATTRIBUTE",
        data: []
    }

    bakugans.forEach((b) => {
        const attribut = b.attribut
        const filteredAttributs = attriubtsList.filter((a) => a !== attribut)

        request.data.push({
            attributs: filteredAttributs,
            target: b
        })

    })

    const active = roomState.ActivePlayerActionRequest

    if(request.data.length > 0) active.actions.optional.push(request)

    return
    
}