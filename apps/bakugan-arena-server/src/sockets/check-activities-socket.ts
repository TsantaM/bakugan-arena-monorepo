import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { CreateActionRequestFunction } from "@bakugan-arena/game-data";

export function CheckActivitiesSocket(io: Server, socket: Socket) {
    socket.on('check-activities', ({ userId, roomId }: { userId: string, roomId: string }) => {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

        // FR: On récupère aussi l'index de cette salle pour des modifications directes
        // ENG: Also get the room index for direct state updates
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

        // FR: Si la salle n'existe pas ou que l'index est invalide, on arrête
        // ENG: If the room does not exist or index is invalid, exit early
        if (!roomData || roomIndex === -1) return

        if (roomData.AbilityAditionalRequest.length > 0) {
            if (!roomData.AbilityAditionalRequest.some((action) => action.userId === userId)) return

            const action = roomData.AbilityAditionalRequest.find((a) => a.userId === userId)
            if (!action) return
            socket.emit('ability-additional-request', action)
        } else {
            const isTurn = roomData.turnState.turn === userId ? true : false
            if (!isTurn) return

            const activeRequest = roomData.ActivePlayerActionRequest
            const activeMerged = [
                activeRequest.actions.mustDo,
                activeRequest.actions.mustDoOne,
                activeRequest.actions.optional
            ].flat()

            const inactiveRequest = roomData.InactivePlayerActionRequest
            const inactiveMerged = [
                inactiveRequest.actions.mustDo,
                inactiveRequest.actions.mustDoOne,
                inactiveRequest.actions.optional
            ].flat()

            if (activeMerged.length <= 0) {
                CreateActionRequestFunction({ roomState: roomData })
                const activeSocket = roomData.connectedsUsers.get(roomData.turnState.turn)
                const inactiveSocket = roomData.connectedsUsers.get(roomData.turnState.previous_turn || '')
                if (!activeSocket) return
                io.to(activeSocket).emit('turn-action-request', activeRequest)
                if (!inactiveSocket) return
                io.to(inactiveSocket).emit('turn-action-request', inactiveMerged)
            }

        }
    })
}