import { Server, Socket } from "socket.io";
import { CreateActionRequestFunction } from "@bakugan-arena/game-data";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { getRoom } from "../functions/room-registry";
import {
    bindUserSockets,
    emitTurnActionRequests,
} from "../functions/room-runtime";

/**
 * Filet de sécurité client : redemande les actions pending si l’UI est vide.
 */
export function CheckActivitiesSocket(io: Server, socket: Socket) {
    socket.on('check-activities', ({ userId, roomId }: { userId: string, roomId: string }) => {
        const roomData = getRoom(roomId)
        if (!roomData) return
        if (roomData.status.finished === true) return

        bindUserSockets(roomData, userId, {
            gameboardSocket: socket.id,
        })

        if (roomData.AbilityAditionalRequest.length > 0) {
            if (!roomData.AbilityAditionalRequest.some((action) => action.userId === userId)) return

            const action = roomData.AbilityAditionalRequest.find((a) => a.userId === userId)
            if (!action) return
            socket.emit('ability-additional-request', action)
            return
        }

        const isTurn = roomData.turnState.turn === userId
        if (!isTurn) return

        const activeRequest = roomData.ActivePlayerActionRequest
        const activeMerged = [
            activeRequest.actions.mustDo,
            activeRequest.actions.mustDoOne,
            activeRequest.actions.optional
        ].flat()

        if (activeMerged.length <= 0) {
            CreateActionRequestFunction({ roomState: roomData })

            const checker = CheckTurnActionRequest({ roomState: roomData, userId: userId })
            if (!checker) return

            emitTurnActionRequests(io, roomData, { fallbackSocketId: socket.id })
        }
    })
}
