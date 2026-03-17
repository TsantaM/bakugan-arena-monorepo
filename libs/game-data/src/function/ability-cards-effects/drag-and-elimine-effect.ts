import { bakuganOnSlot, portalSlotsTypeElement, stateType } from "../../type/room-types.js"
import { DragAndElimineDirectiveAnimation } from "../create-animation-directives/index.js"

export function DragAndElimineBakuganEffect({ bakugan, roomState, cardUser, initialSlot }: { roomState: stateType, bakugan: bakuganOnSlot, cardUser: bakuganOnSlot, initialSlot: portalSlotsTypeElement }) {
    if (!roomState) return

    DragAndElimineDirectiveAnimation({
        animations: roomState.animations,
        bakugan: bakugan,
        user: cardUser,
        initialSlot: initialSlot,
        turn: roomState.turnState.turnCount

    })

    const bakuganOnSlotDeckState = roomState.decksState
        .flatMap(deck => deck.bakugans)           // On prend tous les bakugans de tous les decks
        .filter((b): b is NonNullable<typeof b> => b !== null && b !== undefined) // on retire null/undefined
        .map(b => b.bakuganData)                  // On prend les données réelles du bakugan
        .filter(bd => bd.key === bakugan.key)               // On garde uniquement ceux sur la carte
        .map(bd => bd)

    const bakugansOnSlot = initialSlot.bakugans.filter(
        (b) =>
            !(
                b.key === bakugan.key &&
                b.userId === bakugan.userId &&
                b.slot_id === bakugan.slot_id
            )
    )

    initialSlot.bakugans = bakugansOnSlot

    bakuganOnSlotDeckState.forEach((b) => {
        b.onDomain = false
        b.elimined = true
    })
}