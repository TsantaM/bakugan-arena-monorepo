import { CancelAbilityCardEffect } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { Slots } from "../../../store/slots.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const Cadenas: gateCardType = {
    key: "cadenas",
    name: "Lock Down",
    maxInDeck: 1,
    description: "Cancel all opponents abilities.",
    image: GateCardImages.command,
    onOpen({ roomState, slot }) {

        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]

        if(slotOfGate.portalCard === null) return null
        if(slotOfGate.state.blocked || slotOfGate.state.open || slotOfGate.state.canceled) return null

        const userId = slotOfGate.portalCard.userId
        
        const abilitiesToCancel = slotOfGate.activateAbilities.filter((a) => a.userId !== userId && a.canceled === false)

        abilitiesToCancel.forEach((a) => {
            CancelAbilityCardEffect({ability: a, roomState: roomState, slotOfGate: slotOfGate})
        })


        return null
    },
}