import { bakuganOnSlot, stateType } from "../../type/room-types.js"
import { ElimineBakuganDirectiveAnimation } from "../create-animation-directives/index.js"

export function ElimineBakuganEffect({ bakugan, roomState }: { roomState: stateType, bakugan: bakuganOnSlot }) {
    if (!roomState) return

    const slotOfGate = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
    if (!slotOfGate) return

    ElimineBakuganDirectiveAnimation({
        animations: roomState.animations,
        bakugan: bakugan,
        slot: structuredClone(slotOfGate),
        turn: roomState.turnState.turnCount

    })

    const deck = roomState.decksState.find((d) => d.userId === bakugan.userId)
    if(!deck) return

    const bakuganOnSlotDeckState = deck.bakugans.find((b) => b.bakuganData.key === bakugan.key)

    if(!bakuganOnSlotDeckState) return

    const bakugansOnSlot = slotOfGate.bakugans.filter(
        (b) =>
            !(
                b.key === bakugan.key &&
                b.userId === bakugan.userId &&
                b.slot_id === bakugan.slot_id
            )
    )

    slotOfGate.bakugans = bakugansOnSlot

    bakuganOnSlotDeckState.bakuganData.onDomain = false
    bakuganOnSlotDeckState.bakuganData.elimined = true
    
}