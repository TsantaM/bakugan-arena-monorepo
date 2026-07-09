import { RemoveGateCardDirectiveAnimation, ResetSlot } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const BoucEmissaire: gateCardType = {
    key: 'bouc-emissaire',
    name: 'Bouc Emissaire',
    maxInDeck: 1,
    description: `When this command gate card opens on its slot, the current battle on that slot ends immediately and this gate card is removed from the slot.`,
    image: GateCardImages.command,
    onOpen: ({ roomState, slot }) => {
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)

        if (roomState && slotOfGate && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate,
                roomState
            })
            ResetSlot(slotOfGate)

            roomState.battleState.battleInProcess = false
            roomState.battleState.slot = null
            roomState.battleState.paused = false
        }

        return null
    }
}