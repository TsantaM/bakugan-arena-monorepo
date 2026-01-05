import { type stateType } from "../type/room-types";
import { GateCardsList } from "../battle-brawlers/gate-gards";
import { GetUserName } from "./get-user-name";


export function handleGateCards(roomData: stateType) {

    if (!roomData) return

    roomData.protalSlots
        .filter(s => s.portalCard && !s.state.open && !s.state.blocked)
        .forEach(slot => {
            if(!slot.portalCard) return
            const gate = GateCardsList.find(c => c.key === slot.portalCard?.key)
            if (!gate) return

            const canActivate = gate.autoActivationCheck
                ? gate.autoActivationCheck({ portalSlot: slot, roomState: roomData })
                : false

            if (canActivate) {
                roomData.animations.push({
                    type: "OPEN_GATE_CARD",
                    data: {
                        slot: structuredClone(slot),
                        slotId: slot.id
                    },
                    resolved: false,
                    message: [{
                        text: `Carte Portail ouvre toi ! ${gate.name}`,
                        userName: GetUserName({ roomData: roomData, userId: slot.portalCard.userId })
                    }]
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