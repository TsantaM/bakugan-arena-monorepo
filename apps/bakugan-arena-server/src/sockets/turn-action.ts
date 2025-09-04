import { Server, Socket } from "socket.io/dist";
import { UpdateGate } from "../functions/set-gate-server";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";

export const socketTurn = (io: Server, socket: Socket) => {

    socket.on('turn-action', ({ roomId }: { roomId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room.roomId === roomId)
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room.roomId === roomId)

        console.log('bonsoir depuis le server')
        
        if (roomData) {
            console.log(roomData.roomId, roomIndex)
            // Add turn counter
            const turnCount = roomData.turnState.turnCount + 1

            // Update player turn
            const players = roomData.decksState.map((d) => d.userId)
            const newUserTurn = players.find((p) => p != roomData.turnState.turn)

            const turn = newUserTurn ? roomData.turnState.turn = newUserTurn : roomData.turnState.turn

            Battle_Brawlers_Game_State[roomIndex].turnState.turnCount = turnCount
            Battle_Brawlers_Game_State[roomIndex].turnState.turn = turn

            if (Battle_Brawlers_Game_State[roomIndex].turnState.turnCount === 2) {
                Battle_Brawlers_Game_State[roomIndex].protalSlots[4].can_set = true
            } else {
                Battle_Brawlers_Game_State[roomIndex].protalSlots.forEach(p => {
                    if (p.can_set === false && p.portalCard === null) {
                        p.can_set = true
                    }
                })
            }

            const state = Battle_Brawlers_Game_State[roomIndex]
            console.log('bonsoir depuis le server 2')

            io.to(roomId).emit('turn-action', state)
            console.log('bonsoir depuis le server 3')

        }

    })

}