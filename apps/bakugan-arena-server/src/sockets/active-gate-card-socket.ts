import { Server, Socket } from "socket.io/dist";
import { ActiveGateCard } from "../functions/active-gate-card";
import { activeGateCardProps, slots_id } from "@bakugan-arena/game-data";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";

export const socketActiveGateCard = (io: Server, socket: Socket) => {
    socket.on('active-gate-card', ({ roomId, gateId, slot, userId }: activeGateCardProps) => {
        ActiveGateCard({ roomId, gateId, slot, userId })
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }
    })
}