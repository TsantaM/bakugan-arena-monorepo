import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { SetBakuganOnGate } from "../functions/set-bakugan-server";

export const socketUpdateBakuganState = (io: Server, socket: Socket) => {
    socket.on('set-bakugan', ({ roomId, bakuganKey, slot, userId }: { roomId: string, bakuganKey: string, slot: string, userId: string }) => {
        SetBakuganOnGate({ roomId, bakuganKey, slot, userId })
        const state = Battle_Brawlers_Game_State.find((s) => s.roomId === roomId)

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }
    })
}