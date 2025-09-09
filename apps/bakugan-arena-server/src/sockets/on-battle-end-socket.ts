import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { onBattleEnd } from "../functions/on-battle-end";

export const socketOnBattleEnd = (io: Server, socket: Socket) => {
    socket.on('resolve-battle', ({ roomId }: { roomId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

        if (roomData && roomData.battleState.turns === 0 && roomData.battleState.battleInProcess && !roomData.battleState.paused) {
            onBattleEnd({ roomId })
        }
        
        const state = Battle_Brawlers_Game_State[roomIndex]

        if (state) {
            io.to(roomId).emit('update-room-state', state)
        }
    })
}