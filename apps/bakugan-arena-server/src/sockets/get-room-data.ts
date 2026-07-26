/**
 * Handlers d’hydratation / resync room.
 *
 * `init-room-state` et `get-room-state` doivent TOUJOURS réécrire `gameboardSocket`
 * (iframe reconnectée = nouvel id). Sinon les turn-action-request partent vers
 * un socket mort et le client doit F5.
 */
import { Server, Socket } from "socket.io"
import { initRoomState } from "../functions/init-game-room"
import { CreateActionRequestFunction, Message, replayEntryType, replaySnapshotType } from "@bakugan-arena/game-data"
import { SendAllMessages } from "../functions/emit-messages"
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions"
import { getRoom } from "../functions/room-registry"
import {
    bindUserSockets,
    emitPendingRequestsToSocket,
    emitTurnActionRequests,
} from "../functions/room-runtime"

export const socketGetRoomState = (io: Server, socket: Socket) => {
    socket.on(
        'get-room-state',
        ({ roomId, userId, parentSocket, isSpectator }: {
            roomId: string
            userId: string
            parentSocket: string
            isSpectator?: boolean
        }) => {
            const state = getRoom(roomId)
            if (!state) return

            socket.join(roomId)
            bindUserSockets(state, userId, {
                gameboardSocket: socket.id,
                nextjsSocket: parentSocket,
                isSpectator: !!isSpectator,
            })

            socket.emit('room-state', state)
            SendAllMessages({ roomState: state, io: io, socketNext: parentSocket })
            emitPendingRequestsToSocket(io, state, userId, socket.id)
        }
    )
}

export const socketInitiRoomState = (io: Server, socket: Socket) => {
    socket.on(
        'init-room-state',
        ({ roomId, userId, parentSocket, isSpectator = false }: {
            roomId: string
            userId: string
            parentSocket: string
            isSpectator?: boolean
        }) => {
            socket.join(roomId)

            const roomData = getRoom(roomId)
            if (!roomData) return

            bindUserSockets(roomData, userId, {
                gameboardSocket: socket.id,
                nextjsSocket: parentSocket,
                isSpectator,
            })

            const state = initRoomState({ roomId, userId: userId })
            if (!state) return
            socket.emit('init-room-state', state)
            SendAllMessages({ roomState: roomData, io: io, socketNext: parentSocket })

            socket.emit('turn-count-updater', {
                turnCount: roomData.turnState.turnCount,
                battleTurn: roomData.battleState.battleInProcess
                    ? roomData.battleState.turns
                    : undefined
            })

            if (!roomData.status.finished) {
                if (isSpectator) {
                    return
                }

                const abilityRequest = roomData.AbilityAditionalRequest[0]
                if (abilityRequest) {
                    if (!abilityRequest.data.target && abilityRequest.userId === userId) {
                        socket.emit('ability-additional-request', abilityRequest)
                    } else if (abilityRequest.data.target === userId) {
                        socket.emit('ability-additional-request', abilityRequest)
                    }
                    return
                }

                const gateRequest = roomData.gateCardActionRequest[0]
                if (gateRequest) {
                    if (!gateRequest.data.target && gateRequest.userId) {
                        socket.emit('gate-card-additional-request', gateRequest)
                    } else if (gateRequest.data.target === userId) {
                        socket.emit('gate-card-additional-request', gateRequest)
                    }
                    return
                }

                const isActivePlayer = roomData.turnState.turn === userId
                const isInactivePlayer = roomData.turnState.previous_turn === userId
                const turn = roomData.turnState.turnCount

                const checker = CheckTurnActionRequest({ roomState: roomData, userId: userId })
                if (!checker) return

                if (isActivePlayer) {
                    const request = roomData.ActivePlayerActionRequest
                    const merged = [
                        request.actions.mustDo,
                        request.actions.mustDoOne,
                        request.actions.optional
                    ].flat()

                    if (merged.length > 0) {
                        socket.emit('turn-action-request', request)
                    } else if (turn > 0) {
                        // Requests vides après reconnect : régénère et redistribue.
                        CreateActionRequestFunction({ roomState: roomData })
                        emitTurnActionRequests(io, roomData, { fallbackSocketId: socket.id })
                    }
                    return
                }

                if (isInactivePlayer) {
                    const request = roomData.InactivePlayerActionRequest
                    const merged = [
                        request.actions.mustDo,
                        request.actions.mustDoOne,
                        request.actions.optional
                    ].flat()

                    if (merged.length > 0) {
                        socket.emit('turn-action-request', request)
                    } else if (turn > 0) {
                        CreateActionRequestFunction({ roomState: roomData })
                        emitTurnActionRequests(io, roomData, { fallbackSocketId: socket.id })
                    }
                }

                return
            }

            let message: Message

            if (roomData.status.winner !== null) {
                const winner = roomData.players.find((p) => p.userId === roomData.status.winner)?.username
                    ? roomData.players.find((p) => p.userId === roomData.status.winner)?.username
                    : ''

                message = {
                    key: 'game_over_winner',
                    params: { winner: winner ?? '' },
                    turn: roomData.turnState.turnCount
                }
            } else {
                message = {
                    key: 'game_over_draw',
                    turn: roomData.turnState.turnCount
                }
            }

            socket.emit('game-finished', message)

            const room: {
                p1: string
                p2: string
                roomId: string
                finished: boolean
                replay: replayEntryType[]
                initialSnapshot: replaySnapshotType
            } = {
                roomId: roomData.roomId,
                p1: roomData.players[0].userId,
                p2: roomData.players[1].userId,
                replay: roomData.animationsForReplay,
                initialSnapshot: roomData.initialReplaySnapshot,
                finished: roomData.status.finished
            }

            const player = roomData.connectedsUsers.get(userId)
            if (player?.nextjsSocket) {
                io.to(player.nextjsSocket).emit('final-room-state', room)
            }

            roomData.connectedsUsers.forEach((s) => {
                if (s.nextjsSocket) {
                    io.to(s.nextjsSocket).emit('game-messages', [message])
                }
            })
        }
    )
}
