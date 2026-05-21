import { GateCards, resolutionGateCardType } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io/dist";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { EmitMessage } from "../functions/emit-messages";
import { turnActionUpdater } from "./turn-action";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";


export function GateCardAdditionalEffectSocket(io: Server, socket: Socket) {
    socket.on('gate-card-additional-request', (resolution: resolutionGateCardType) => {

        clearAnimationsInRoom(resolution.roomId)
        const roomData = Battle_Brawlers_Game_State.find((room) => room && room.roomId === resolution.roomId)
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room && room.roomId === resolution.roomId)
        if (!roomData) return
        if (roomIndex === -1) return
        if (roomData.status.finished === true) return

        const request = roomData.gateCardActionRequest.find((req) => req.cardKey === resolution.cardKey && req.userId === resolution.userId)
        const requestIndex = roomData.gateCardActionRequest.findIndex((req) => req.cardKey === resolution.cardKey && req.userId === resolution.userId)

        if (!request) return
        console.log('request find')
        if (requestIndex === -1) return
        console.log('request index find')
        if (!Battle_Brawlers_Game_State[roomIndex]) return

        const card = GateCards[request.cardKey]
        if (!card.onAdditionalRequest) return


        // ACTIVATION

        const result = card.onAdditionalRequest({
            resolution: resolution,
            roomState: Battle_Brawlers_Game_State[roomIndex]
        })

        // ACTIVATION_END

        Battle_Brawlers_Game_State[roomIndex].gateCardActionRequest.splice(requestIndex, 1)

        io.to(roomData.roomId).emit('animations', Battle_Brawlers_Game_State[roomIndex].animations)
        Battle_Brawlers_Game_State[roomIndex].animations.forEach((animation) => EmitMessage({ roomState: Battle_Brawlers_Game_State[roomIndex], animation, io }))

        Battle_Brawlers_Game_State[roomIndex].animations = []

        if (Battle_Brawlers_Game_State[roomIndex].gateCardActionRequest.length > 0) {
            const requests = Battle_Brawlers_Game_State[roomIndex].gateCardActionRequest
            if (!requests) return
            if (requests.length <= 0) return
            const socket = roomData.connectedsUsers.get(requests[0].userId)
            if (!socket) return
            io.to(socket.gameboardSocket).emit('gate-card-additional-request', requests[0])
        } else if (result !== null && result.type === 'TURN_ACTION_LAUNCHER') {
            turnActionUpdater({
                io: io,
                roomId: roomData.roomId,
                userId: resolution.userId
            })
        } else {

            const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
            const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')

            if (roomData.turnState.turn === resolution.userId) {

                const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === resolution.roomId)
                if (roomIndex === -1) return
                if (!activeSocket) return
                if (!Battle_Brawlers_Game_State[roomIndex]) return

                const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()

                const checker = CheckTurnActionRequest({ roomState: roomData, userId: resolution.userId })
                if (!checker) return

                if (merged.length > 0) {
                    io.to(activeSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
                } else {
                    clearAnimationsInRoom(resolution.roomId)
                    turnActionUpdater({ roomId: resolution.roomId, userId: request.userId, io })
                }

            }

            if (roomData.turnState.turn !== resolution.userId) {
                const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === resolution.roomId)
                if (roomIndex === -1) return
                if (!Battle_Brawlers_Game_State[roomIndex]) return
                if (!inactiveSocket) return

                const checker = CheckTurnActionRequest({ roomState: roomData, userId: resolution.userId })
                if (!checker) return

                const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional].flat()
                if (merged.length <= 0) return
                io.to(inactiveSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
            }
        }

    })
}