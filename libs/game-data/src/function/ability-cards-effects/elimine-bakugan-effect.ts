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

    const bakuganOnSlotDeckState = roomState.decksState
        .flatMap(deck => deck.bakugans)           // On prend tous les bakugans de tous les decks
        .filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined) // on retire null/undefined
        .map(b => b.bakuganData)                  // On prend les données réelles du bakugan
        .filter(bd => bd.key === bakugan.key)               // On garde uniquement ceux sur la carte
        .map(bd => bd)

    const bakugansOnSlot = slotOfGate.bakugans.filter(
        (b) =>
            !(
                b.key === bakugan.key &&
                b.userId === bakugan.userId &&
                b.slot_id === bakugan.slot_id
            )
    )

    slotOfGate.bakugans = bakugansOnSlot

    bakuganOnSlotDeckState.forEach((b) => {
        b.onDomain = false
        b.elimined = true
    })
}