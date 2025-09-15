import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CheckBattle } from "../functions/check-battle-start";
import { CheckGameFinished } from "@bakugan-arena/game-data";

export const socketTurn = (io: Server, socket: Socket) => {

    socket.on('turn-action', ({ roomId, userId }: { roomId: string, userId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

        console.log('bonsoir depuis le server')

        if (roomData && roomData.turnState.previous_turn != userId) {
            console.log(roomData.roomId, roomIndex)
            // Add turn counter
            const turnCount = roomData.turnState.turnCount + 1

            // Update player turn
            const players = roomData.decksState.map((d) => d.userId)
            const newUserTurn = players.find((p) => p != roomData.turnState.turn)

            const turn = newUserTurn ? roomData.turnState.turn = newUserTurn : roomData.turnState.turn

            if (!Battle_Brawlers_Game_State[roomIndex]) return

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

            if (Battle_Brawlers_Game_State[roomIndex].turnState.turnCount > 2) {
                Battle_Brawlers_Game_State[roomIndex].turnState.set_new_bakugan = true
                Battle_Brawlers_Game_State[roomIndex].turnState.use_ability_card = true
            }

            if (Battle_Brawlers_Game_State[roomIndex].battleState.battleInProcess === true && !Battle_Brawlers_Game_State[roomIndex].battleState.paused) {

                if (Battle_Brawlers_Game_State[roomIndex].battleState.turns > 0) {
                    Battle_Brawlers_Game_State[roomIndex].battleState.turns -= 1
                }
            }

            if (Battle_Brawlers_Game_State[roomIndex].battleState.battleInProcess === false) {
                CheckBattle({ roomId })
            }

            CheckGameFinished({roomId, roomState: roomData})

            const state = Battle_Brawlers_Game_State[roomIndex]
            console.log('bonsoir depuis le server 2')

            io.to(roomId).emit('turn-action', state)
            console.log('bonsoir depuis le server 3')

        }

    })

}