import { bakuganOnSlot, stateType } from "../../type/room-types.js";
import { ComeBackBakuganDirectiveAnimation } from "../create-animation-directives/index.js";

export function ComeBackBakuganEffect({ bakugan, roomState }: { roomState: stateType, bakugan: bakuganOnSlot }) {

    if (!roomState) return
    const slot = roomState.protalSlots.find((slot) => slot.id === bakugan.slot_id)
    if (!slot) return
    const index = slot.bakugans.findIndex((ba) => ba.key === bakugan.key && ba.userId === bakugan.userId)
    const bakuganInDeck = roomState.decksState.find((d) => d.userId === bakugan.userId)?.bakugans.find((b) => b?.bakuganData.key === bakugan.key)

    if (bakuganInDeck) {
        slot.bakugans.splice(index, 1)
        bakuganInDeck.bakuganData.onDomain = false
        ComeBackBakuganDirectiveAnimation({
            animations: roomState.animations,
            bakugan: bakugan,
            slot: slot
        })
    }
    
}