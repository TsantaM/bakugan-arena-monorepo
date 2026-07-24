import { Bakugans } from "../../battle-brawlers/bakugans.js"
import { bakuganOnSlot, stateType } from "../../type/room-types.js"
import { ElimineBakuganDirectiveAnimation } from "../create-animation-directives/index.js"
import { NewAdditionnalMessage } from "../new-additional-message.js"
import { type EffectOrigin, isProtectedAgainst } from "./protection-status.js"

export function ElimineBakuganEffect({
    bakugan,
    roomState,
    origin = 'ABILITY',
    /** @deprecated Use `origin: 'GATE'` instead */
    gateCardProtection,
}: {
    roomState: stateType
    bakugan: bakuganOnSlot
    origin?: EffectOrigin
    gateCardProtection?: boolean
}) {
    if (!roomState) return

    const slotOfGate = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
    if (!slotOfGate) return

    const effectOrigin: EffectOrigin =
        gateCardProtection === true ? 'GATE' : origin

    if (isProtectedAgainst(bakugan, effectOrigin)) {
        NewAdditionnalMessage({
            roomState: roomState,
            key: 'bakugan_protected',
            params: { name: Bakugans[bakugan.key].name },
        })
        return
    }

    ElimineBakuganDirectiveAnimation({
        animations: roomState.animations,
        bakugan: bakugan,
        slot: structuredClone(slotOfGate),
        turn: roomState.turnState.turnCount,
        roomState: roomState
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
