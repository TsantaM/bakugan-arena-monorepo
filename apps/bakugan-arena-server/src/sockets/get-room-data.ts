import { Server, Socket } from "socket.io/dist"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { initRoomState } from "../functions/init-game-room"


const roomState = ({roomId} : {roomId: string}) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    return roomData
}

export const socketGetRoomState = (io: Server, socket: Socket) => {
    socket.on('get-room-state', ({roomId}: {roomId: string}) => {
        const state = roomState({roomId})
        socket.join(roomId)
        io.to(roomId).emit('room-state', state)
    })
}

export const socketInitiRoomState = (io: Server, socket: Socket) => {
    socket.on('init-room-state', ({roomId}: {roomId: string}) => {
        const state = initRoomState({roomId})
        if(!state) return
        io.to(roomId).emit('init-room-state', state)
    } )
}