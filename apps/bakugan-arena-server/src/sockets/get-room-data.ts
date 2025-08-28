// import { AbilityCardsList, attribut, BakuganList, ExclusiveAbilitiesList, GateCardsList } from "../../../../libs/game-data"
// import { getDecksDataPrisma, getRoomPlayers } from "../functions/get-room-data"

import { Server, Socket } from "socket.io/dist"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

// const ToggleTurn = ({ players }: {
//     players: {
//         player1: {
//             player1: {
//                 id: string;
//             } | null;
//         };
//         player2: {
//             player2: {
//                 id: string;
//             } | null;
//         };
//     }
// }) => {
//     let turn
//     turn = turn === players["player1"].player1?.id ? players["player2"].player2?.id : players["player1"].player1?.id
// }


const roomState = ({roomId} : {roomId: string}) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room.roomId === roomId)
    console.log(roomData)
    return roomData
}

export const socketGetRoomState = (io: Server, socket: Socket) => {
    socket.on('get-room-state', ({roomId}: {roomId: string}) => {
        const state = roomState({roomId})
        console.log
        socket.join(roomId)
        io.to(roomId).emit('room-state', state)
    })
}