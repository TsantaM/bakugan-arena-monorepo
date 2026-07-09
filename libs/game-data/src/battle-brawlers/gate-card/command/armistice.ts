import { CheckBattleStillInProcess, RemoveGateCardDirectiveAnimation, ResetSlot } from "../../../function/index.js"
import { GateCardImages } from "../../../store/gate-card-images.js"
import { gateCardType } from "../../../type/game-data-types.js"

export const Armistice: gateCardType = {
    key: 'armistice',
    name: 'Peacemaker',
    maxInDeck: 1,
    description: `When this command gate card opens on its slot, every Bakugan on that slot returns to its owner's deck and this gate card is removed from the slot.`,
    image: GateCardImages.command,
    onOpen({ roomState, slot }) {
        if (!roomState) return null

        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        if (slotOfGate) {
            const bakugansOnGate = slotOfGate.bakugans.map((b) => b.key)

            if (roomState && !slotOfGate.state.open && !slotOfGate.state.canceled && !slotOfGate.state.blocked) {
                roomState.decksState.forEach((d) => {
                    d.bakugans.filter((b) => b && bakugansOnGate.includes(b.bakuganData.key)).forEach((b) => {
                        if (b && bakugansOnGate.includes(b.bakuganData.key)) {
                            b.bakuganData.onDomain = false
                        }
                    })

                })


                RemoveGateCardDirectiveAnimation({
                    animations: roomState.animations,
                    slot: slotOfGate,
                    roomState
                })
                ResetSlot(slotOfGate)

                CheckBattleStillInProcess(roomState)

            }

            return {
                type: "TURN_ACTION_LAUNCHER"
            }

        } else {
            return null
        }


    },
    onCanceled() {
        return
    },
}