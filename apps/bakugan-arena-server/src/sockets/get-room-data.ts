import { Server, Socket } from "socket.io/dist"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { initRoomState } from "../functions/init-game-room"
import { CreateActionRequestFunction } from "@bakugan-arena/game-data"
import { turnCountSocketProps } from "@bakugan-arena/game-data/src/type/sockets-props-types"


const roomState = ({ roomId }: { roomId: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    return roomData
}

export const socketGetRoomState = (io: Server, socket: Socket) => {
    socket.on('get-room-state', ({ roomId }: { roomId: string }) => {
        const state = roomState({ roomId })
        socket.join(roomId)
        io.to(roomId).emit('room-state', state)
        if (!state) return

        if (state.AbilityAditionalRequest.length > 0) {
            const requests = state.AbilityAditionalRequest
            if (!requests) return
            if (requests.length <= 0) return
            const socket = state.connectedsUsers.get(requests[0].userId)
            if (!socket) return
            io.to(socket).emit('ability-additional-request', requests[0])
            console.log(socket, 'ability-additional-request', requests[0])
        } else {
            const activeSocket = state.connectedsUsers.get(state.turnState.turn)
            const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

            if (activeSocket) {
                const request = state.ActivePlayerActionRequest
                io.to(activeSocket).emit('turn-action-request', request)
            }

            if (inactiveSocket) {
                const request = state.InactivePlayerActionRequest
                io.to(inactiveSocket).emit('turn-action-request', request)
            }
        }

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
        const turnState: turnCountSocketProps = {
            turnCount: roomData.turnState.turnCount,
            battleTurn: roomData.battleState.battleInProcess ? roomData.battleState.turns : undefined
        }

        io.to(roomId).emit('turn-count-updater', turnState)
        
        if (roomData.turnState.turnCount === 0) {
            CreateActionRequestFunction({
                roomState: roomData
            })
            const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
            const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')

            if (roomData.turnState.turn === userId) {
                if (activeSocket) {
                    const request = roomData.ActivePlayerActionRequest
                    const merged = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat()
                    if (merged.length === 0) return
                    io.to(activeSocket).emit('turn-action-request', request)
                }
            } else {
                if (inactiveSocket) {
                    const request = roomData.InactivePlayerActionRequest
                    const merged = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat()
                    if (merged.length === 0) return
                    io.to(inactiveSocket).emit('turn-action-request', request)
                }
            }

        } else {

            if (roomData.AbilityAditionalRequest.length > 0) {
                const requests = roomData.AbilityAditionalRequest
                if (!requests) return
                if (requests.length <= 0) return
                const socket = roomData.connectedsUsers.get(requests[0].userId)
                if (!socket) return
                io.to(socket).emit('ability-additional-request', requests[0])
                console.log(socket, 'ability-additional-request', requests[0])
            } else {
                const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
                const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')

                if (roomData.turnState.turn === userId) {
                    if (activeSocket) {
                        const request = roomData.ActivePlayerActionRequest
                        const merged = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat()
                        if (merged.length === 0) return
                        io.to(activeSocket).emit('turn-action-request', request)
                    }
                } else {
                    if (inactiveSocket) {
                        const request = roomData.InactivePlayerActionRequest
                        const merged = [request.actions.mustDo, request.actions.mustDoOne, request.actions.optional].flat()
                        if (merged.length === 0) return
                        io.to(inactiveSocket).emit('turn-action-request', request)
                    }
                }
            }

        }

    })
}