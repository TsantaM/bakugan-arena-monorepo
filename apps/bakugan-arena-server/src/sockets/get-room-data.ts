import { Server, Socket } from "socket.io/dist"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { initRoomState } from "../functions/init-game-room"
import { CreateActionRequestFunction, Message } from "@bakugan-arena/game-data"


const roomState = ({ roomId }: { roomId: string }) => {
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    return roomData
}

export const socketGetRoomState = (io: Server, socket: Socket) => {
    socket.on(
        'get-room-state',
        ({ roomId, userId }: { roomId: string; userId: string }) => {

            const state = roomState({ roomId })
            if (!state) return

            // On rattache / met à jour le socket du user
            socket.join(roomId)
            state.connectedsUsers.set(userId, socket.id)

            /**
             * 1️⃣ Etat global de la room
             * -> UNIQUEMENT pour le demandeur
             */
            socket.emit('room-state', state)

            /**
             * 2️⃣ Ability additional request
             * -> seulement si CE user est concerné
             */
            const abilityRequest = state.AbilityAditionalRequest[0]
            if (abilityRequest && abilityRequest.userId === userId) {
                socket.emit('ability-additional-request', abilityRequest)
                return
            }

            /**
             * 3️⃣ Turn action request
             * -> dépend du rôle du joueur
             */
            const isActivePlayer = state.turnState.turn === userId
            const isInactivePlayer =
                state.turnState.previous_turn === userId

            if (isActivePlayer) {
                const request = state.ActivePlayerActionRequest
                const merged = [
                    request.actions.mustDo,
                    request.actions.mustDoOne,
                    request.actions.optional
                ].flat()

                if (merged.length > 0) {
                    socket.emit('turn-action-request', request)
                }
                return
            }

            if (isInactivePlayer) {
                const request = state.InactivePlayerActionRequest
                const merged = [
                    request.actions.mustDo,
                    request.actions.mustDoOne,
                    request.actions.optional
                ].flat()

                if (merged.length > 0) {
                    socket.emit('turn-action-request', request)
                }
                return
            }
        }
    )
}

export const socketInitiRoomState = (io: Server, socket: Socket) => {
    socket.on(
        'init-room-state',
        ({ roomId, userId }: { roomId: string; userId: string }) => {

            socket.join(roomId)

            const roomData = Battle_Brawlers_Game_State.find(
                (room) => room?.roomId === roomId
            )
            if (!roomData) return

            // Associer (ou réassocier) le socket au user
            roomData.connectedsUsers.set(userId, socket.id)

            // Init state UNIQUEMENT pour le demandeur
            const state = initRoomState({ roomId, userId: userId })
            if (!state) return
            socket.emit('init-room-state', state)

            // Turn state (info neutre, ok à renvoyer)
            socket.emit('turn-count-updater', {
                turnCount: roomData.turnState.turnCount,
                battleTurn: roomData.battleState.battleInProcess
                    ? roomData.battleState.turns
                    : undefined
            })

            /**
             * 1️⃣ Ability additional request
             * -> seulement si CE user est concerné
             */
            const abilityRequest = roomData.AbilityAditionalRequest[0]
            if (abilityRequest && abilityRequest.userId === userId) {
                socket.emit('ability-additional-request', abilityRequest)
                return
            }

            /**
             * 2️⃣ Turn action request
             * -> déterminer si le joueur est actif ou non
             */
            const isActivePlayer = roomData.turnState.turn === userId
            const isInactivePlayer =
                roomData.turnState.previous_turn === userId
            const turn = roomData.turnState.turnCount
            if (isActivePlayer) {
                const request = roomData.ActivePlayerActionRequest
                const merged = [
                    request.actions.mustDo,
                    request.actions.mustDoOne,
                    request.actions.optional
                ].flat()

                if (merged.length > 0) {
                    socket.emit('turn-action-request', request)
                } else {
                    const activeRequest = roomData.ActivePlayerActionRequest
                    const activeMerged = [
                        activeRequest.actions.mustDo,
                        activeRequest.actions.mustDoOne,
                        activeRequest.actions.optional
                    ].flat()

                    if (activeMerged.length <= 0 && turn > 0) {
                        CreateActionRequestFunction({ roomState: roomData })
                        const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
                        const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')
                        if (!activeSocket) return
                        io.to(activeSocket).emit('turn-action-request', activeRequest)
                        if (!inactiveSocket) return
                        io.to(inactiveSocket).emit('turn-action-request', request)
                    }
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
                } else {

                    const activeRequest = roomData.ActivePlayerActionRequest
                    const activeMerged = [
                        activeRequest.actions.mustDo,
                        activeRequest.actions.mustDoOne,
                        activeRequest.actions.optional
                    ].flat()

                    if (activeMerged.length <= 0 && turn > 0) {
                        CreateActionRequestFunction({ roomState: roomData })
                        const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
                        const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')
                        if (!activeSocket) return
                        io.to(activeSocket).emit('turn-action-request', activeRequest)
                        if (!inactiveSocket) return
                        io.to(inactiveSocket).emit('turn-action-request', request)
                    }

                }
                return
            }

            const activeName = roomData.players.find((p) => p.userId === roomData.turnState.turn)?.username
            const inactiveName = roomData.players.find((p) => p.userId === roomData.turnState.previous_turn || '')?.username
            console.log('turn count', roomData.turnState.turnCount)
            console.log('active socket', roomData.ActivePlayerActionRequest, activeName);
            console.log('inactive socket', roomData.InactivePlayerActionRequest, inactiveName)

            if (roomData.status.finished) {

                let message: Message

                if (roomData.status.winner !== null) {
                    const winner = roomData.players.find((p) => p.userId === roomData.status.winner)?.username ? roomData.players.find((p) => p.userId === roomData.status.winner)?.username : ''

                    message = {
                        text: `Game is over ! The winner is ${winner}`
                    }

                } else {
                    message = {
                        text: `Game is over ! Equality !`
                    }
                }

                socket.emit('game-finished', message)

            }


        }
    )
}