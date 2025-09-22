import { activeGateCardProps, GateCardsList, slots_id } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"



export const ActiveGateCard = ({ roomId, gateId, slot, userId }: activeGateCardProps ) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)


    if (roomData) {
        const slotOfGate = roomData.protalSlots.find((s) => s.id === slot)
        const gateCard = GateCardsList.find((g) => g.key === gateId)
        if (slotOfGate && slotOfGate.portalCard?.key === gateId && !slotOfGate.state.open && !slotOfGate.state.blocked && gateCard) {
            const bakugan = slotOfGate.bakugans.find((b) => b.userId === userId)?.key
            const key = bakugan === undefined || bakugan === '' ? undefined : bakugan

            gateCard.onOpen?.({ roomState: roomData, slot: slot, bakuganKey: key, userId: userId })
        }
    }
}