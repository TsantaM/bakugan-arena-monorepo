import { GateCards, resolutionGateCardType } from "@bakugan-arena/game-data";
import { Server, Socket } from "socket.io";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { EmitMessage } from "../functions/emit-messages";
import { turnActionUpdater } from "./turn-action";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { grantActionIncrement, syncClocks } from "../functions/start-player-timer";


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
        if (requestIndex === -1) return
        if (!Battle_Brawlers_Game_State[roomIndex]) return

        const card = GateCards[request.cardKey]
        if (!card.onAdditionalRequest) return

        const result = card.onAdditionalRequest({
            resolution: resolution,
            roomState: Battle_Brawlers_Game_State[roomIndex]
        })

        Battle_Brawlers_Game_State[roomIndex].gateCardActionRequest.splice(requestIndex, 1)

        io.to(roomData.roomId).emit('animations', Battle_Brawlers_Game_State[roomIndex].animations)
        Battle_Brawlers_Game_State[roomIndex].animations.forEach((animation) => EmitMessage({ roomState: Battle_Brawlers_Game_State[roomIndex], animation, io }))

        Battle_Brawlers_Game_State[roomIndex].animations = []

        const actingUserId = request.data.target ?? request.userId
        grantActionIncrement({ roomState: roomData, userId: actingUserId, io })

        if (Battle_Brawlers_Game_State[roomIndex].gateCardActionRequest.length > 0) {
            const requests = Battle_Brawlers_Game_State[roomIndex].gateCardActionRequest
            if (!requests || requests.length <= 0) {
                syncClocks({ roomState: roomData, io })
                return
            }
            const next = requests[0]
            const targetId = next.data.target ?? next.userId
            const targetSocket = roomData.connectedsUsers.get(targetId)
            if (!targetSocket) {
                syncClocks({ roomState: roomData, io })
                return
            }
            io.to(targetSocket.gameboardSocket).emit('gate-card-additional-request', next)
            syncClocks({ roomState: roomData, io })
            return
        }

        if (result !== null && result.type === 'TURN_ACTION_LAUNCHER') {
            turnActionUpdater({
                io: io,
                roomId: roomData.roomId,
                userId: resolution.userId
            })
            return
        }

        const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
        const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')

        if (roomData.turnState.turn === resolution.userId) {

            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === resolution.roomId)
            if (roomIndex === -1) return
            if (!activeSocket) {
                syncClocks({ roomState: roomData, io })
                return
            }
            if (!Battle_Brawlers_Game_State[roomIndex]) return

            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()

            const checker = CheckTurnActionRequest({ roomState: roomData, userId: resolution.userId })
            if (!checker) {
                syncClocks({ roomState: roomData, io })
                return
            }

            if (merged.length > 0) {
                io.to(activeSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
                syncClocks({ roomState: roomData, io })
            } else {
                clearAnimationsInRoom(resolution.roomId)
                turnActionUpdater({ roomId: resolution.roomId, userId: request.userId, io })
            }

        }

        if (roomData.turnState.turn !== resolution.userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === resolution.roomId)
            if (roomIndex === -1) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return
            if (!inactiveSocket) {
                syncClocks({ roomState: roomData, io })
                return
            }

            const checker = CheckTurnActionRequest({ roomState: roomData, userId: resolution.userId })
            if (!checker) {
                syncClocks({ roomState: roomData, io })
                return
            }

            const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional].flat()
            if (merged.length <= 0) {
                syncClocks({ roomState: roomData, io })
                return
            }
            io.to(inactiveSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
            syncClocks({ roomState: roomData, io })
        }

    })
}
