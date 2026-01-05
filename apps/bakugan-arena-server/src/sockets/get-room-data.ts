import { Server, Socket } from "socket.io/dist"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { initRoomState } from "../functions/init-game-room"
import { Message } from "@bakugan-arena/game-data/src/type/animations-directives"
// import { CreateActionRequestFunction } from "@bakugan-arena/game-data"
// import { turnCountSocketProps } from "@bakugan-arena/game-data/src/type/sockets-props-types"


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

            if (isActivePlayer) {
                const request = roomData.ActivePlayerActionRequest
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
                const request = roomData.InactivePlayerActionRequest
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

            if (roomData.status.finished) {

                let message: Message

                if (roomData.status.winner !== null) {
                    const winner = roomData.players.find((p) => p.userId === roomData.status.winner)?.username ? roomData.players.find((p) => p.userId === roomData.status.winner)?.username : ''

                    message = {
                        text: `Combat terminé ! Vainceur ${winner}`
                    }

                } else {
                    message = {
                        text: `Combat terminé ! Match Null !`
                    }
                }

                socket.emit('game-finished', message)

            }


        }
    )
}