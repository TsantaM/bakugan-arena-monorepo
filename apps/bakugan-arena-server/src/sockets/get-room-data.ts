import { Server, Socket } from "socket.io/dist"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { initRoomState } from "../functions/init-game-room"
import { CreateActionRequestFunction } from "@bakugan-arena/game-data"


const roomState = ({ roomId }: { roomId: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    return roomData
}

export const socketGetRoomState = (io: Server, socket: Socket) => {
    socket.on('get-room-state', ({ roomId }: { roomId: string }) => {
        const state = roomState({ roomId })
        socket.join(roomId)
        io.to(roomId).emit('room-state', state)
    })
}

export const socketInitiRoomState = (io: Server, socket: Socket) => {
    socket.on('init-room-state', ({ roomId, userId }: { roomId: string, userId: string }) => {
        socket.join(roomId)
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        if (!roomData) return
        const socketId = socket.id

        if (roomData.connectedsUsers.has(userId)) {
            roomData.connectedsUsers.set(userId, socketId)
        } else {
            roomData.connectedsUsers.set(userId, socketId)
        }

        const state = initRoomState({ roomId })
        if (!state) return
        socket.emit('init-room-state', state)


        if (roomData.turnState.turnCount === 0) {
            CreateActionRequestFunction({
                roomState: roomData
            })
            const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
            const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')

            if (activeSocket) {
                const request = roomData.ActivePlayerActionRequest
                io.to(activeSocket).emit('turn-action-request', request)
            }

            if (inactiveSocket) {
                const request = roomData.InactivePlayerActionRequest
                io.to(inactiveSocket).emit('turn-action-request', request)
            }
        }

    })
}