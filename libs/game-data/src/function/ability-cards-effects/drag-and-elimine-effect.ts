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

    const deck = roomState.decksState.find((d) => d.userId === bakugan.userId)
    if (!deck) return

    const bakuganOnSlotDeckState = deck.bakugans.find((b) => b.bakuganData.key === bakugan.key)

    if (!bakuganOnSlotDeckState) return

    const bakugansOnSlot = initialSlot.bakugans.filter(
        (b) =>
            !(
                b.key === bakugan.key &&
                b.userId === bakugan.userId &&
                b.slot_id === bakugan.slot_id
            )
    )

    initialSlot.bakugans = bakugansOnSlot

    bakuganOnSlotDeckState.bakuganData.onDomain = false
    bakuganOnSlotDeckState.bakuganData.elimined = true


}