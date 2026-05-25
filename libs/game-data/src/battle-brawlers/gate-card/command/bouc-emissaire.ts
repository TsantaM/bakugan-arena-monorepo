import { RemoveGateCardDirectiveAnimation, ResetSlot } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const BoucEmissaire: gateCardType = {
    key: 'bouc-emissaire',
    name: 'Bouc Emissaire',
    maxInDeck: 1,
    description: `Le propriétaire du premier Bakugan placé sur la carte peut décider de continuer le combat ou d'y mettre fin`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (roomState && slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate,
                roomState,
                    animationsForReplay: roomState.animationsForReplay

            })
            ResetSlot(slotOfGate)

            roomState.battleState.battleInProcess = false
            roomState.battleState.slot = null
            roomState.battleState.paused = false
        }

        return null
    }
}