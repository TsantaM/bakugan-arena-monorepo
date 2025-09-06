import { Server, Socket } from "socket.io/dist";
import { UpdateGate } from "../functions/set-gate-server";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";

export const socketUpdateGateState = (io: Server, socket: Socket) => {
    socket.on('set-gate', ({ roomId, gateId, slot, userId }: { roomId: string, gateId: string, slot: string, userId: string }) => {
        UpdateGate({ roomId, gateId, slot, userId })
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }
    })
}