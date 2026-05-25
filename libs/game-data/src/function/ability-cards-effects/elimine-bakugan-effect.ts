import { Bakugans } from "../../battle-brawlers/bakugans.js"
import { bakuganOnSlot, stateType } from "../../type/room-types.js"
import { ElimineBakuganDirectiveAnimation } from "../create-animation-directives/index.js"
import { NewAdditionnalMessage } from "../new-additional-message.js"

export function ElimineBakuganEffect({ bakugan, roomState, gateCardProtection }: { roomState: stateType, bakugan: bakuganOnSlot, gateCardProtection?: boolean }) {
    if (!roomState) return

    const slotOfGate = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
    if (!slotOfGate) return

    if (gateCardProtection) {
        if (bakugan.statut.protected || bakugan.statut.protectedAgainstGate) {
            NewAdditionnalMessage({
                roomState: roomState,
                text: `${Bakugans[bakugan.key].name} is protected`
            })
            return
        }
    }

    ElimineBakuganDirectiveAnimation({
        animations: roomState.animations,
        bakugan: bakugan,
        slot: structuredClone(slotOfGate),
        turn: roomState.turnState.turnCount,
        animationsForReplay: roomState.animationsForReplay

    })

    const deck = roomState.decksState.find((d) => d.userId === bakugan.userId)
    if (!deck) return

    const bakuganOnSlotDeckState = deck.bakugans.find((b) => b.bakuganData.key === bakugan.key)

    if (!bakuganOnSlotDeckState) return

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