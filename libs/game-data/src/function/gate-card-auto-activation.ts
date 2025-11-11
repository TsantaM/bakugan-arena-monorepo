import { type stateType } from "../type/room-types";
import { GateCardsList } from "../battle-brawlers/gate-gards";


export function handleGateCards(roomData: stateType) {

    if(!roomData) return

    roomData.protalSlots
        .filter(s => s.portalCard && !s.state.open && !s.state.blocked)
        .forEach(slot => {
            const gate = GateCardsList.find(c => c.key === slot.portalCard?.key)
            if (!gate) return

            const canActivate = gate.autoActivationCheck
                ? gate.autoActivationCheck({ portalSlot: slot, roomState: roomData })
                : false

            if (canActivate) {
                roomData.animations.push({
                    type: "OPEN_GATE_CARD",
                    data: {
                        slot: slot,
                        slotId: slot.id
                    },
                    resolved: false
                })
                gate.onOpen({
                    roomState: roomData,
                    slot: slot.id,
                    bakuganKey: slot.bakugans.find(b => b.userId === slot.portalCard?.userId)?.key,
                    userId: slot.portalCard?.userId
                })
            }
        })
}