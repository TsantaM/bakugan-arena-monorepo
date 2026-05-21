import { ComeBackBakuganEffect, RemoveGateCardDirectiveAnimation, ResetSlot } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { Slots } from "../../../store/slots.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const Magma: gateCardType = {
    key: 'magma-fuse',
    name: "Magma Fuse",
    description: `After the battle is over, every Gate Card is destroyed and all Bakugans on the field are sent back to their owners.`,
    image: GateCardImages.command,
    maxInDeck: 1,
    activeOnBattleEnd: {
        autoActiveOnEnd: true,
        canBeActiveBefore: false,
        activeBeforeElimination: false
    },
    onOpen({ roomState, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState.protalSlots[Slots.indexOf(slot)]
        if (slotOfGate.portalCard === null || slotOfGate.portalCard.key !== Magma.key) return null

        const slots = roomState.protalSlots.filter((s) => s.id !== slot)
        slots.forEach((s) => {
            if (s.portalCard === null) return

            s.bakugans.forEach((bakugan) => {

                ComeBackBakuganEffect({
                    bakugan: bakugan,
                    roomState: roomState
                })

            })

            RemoveGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: s,
                roomState
            })

            ResetSlot(s)

        })

        return null
    },
}