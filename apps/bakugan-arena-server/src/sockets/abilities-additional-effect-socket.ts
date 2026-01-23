import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { AbilityCardsList, ExclusiveAbilitiesList, resolutionType } from "@bakugan-arena/game-data";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { turnActionUpdater } from "./turn-action";

export function AbilitiesAdditionalEffectsSocket(io: Server, socket: Socket) {
    socket.on('ability-additional-request', (resolution: resolutionType) => {
        clearAnimationsInRoom(resolution.roomId)
        const roomData = Battle_Brawlers_Game_State.find((room) => room && room.roomId === resolution.roomId)
        const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room && room.roomId === resolution.roomId)
        if (!roomData) return
        if (roomIndex === -1) return

        const roomId = roomData.roomId
        const request = roomData.AbilityAditionalRequest.find((req) => req.bakuganKey === resolution.bakuganKey && req.cardKey === resolution.cardKey && req.userId === resolution.userId)
        const requestIndex = roomData.AbilityAditionalRequest.findIndex((req) => req.bakuganKey === resolution.bakuganKey && req.cardKey === resolution.cardKey && req.userId === resolution.userId)

        if (!request) return
        if (requestIndex === -1) return

        if (!Battle_Brawlers_Game_State[roomIndex]) return

        const ability = [AbilityCardsList, ExclusiveAbilitiesList].flat().find((ability) => ability.key === request.cardKey)
        if (!ability) return
        if (!ability.onAdditionalEffect) return

        const result = ability.onAdditionalEffect({
            resolution: resolution,
            roomData: Battle_Brawlers_Game_State[roomIndex]
        })

        Battle_Brawlers_Game_State[roomIndex].AbilityAditionalRequest.splice(requestIndex, 1)

        io.to(roomData.roomId).emit('animations', Battle_Brawlers_Game_State[roomIndex].animations)
        Battle_Brawlers_Game_State[roomIndex].animations = []

        if (Battle_Brawlers_Game_State[roomIndex].AbilityAditionalRequest.length > 0) {
            const requests = Battle_Brawlers_Game_State[roomIndex].AbilityAditionalRequest
            if (!requests) return
            if (requests.length <= 0) return
            const socket = roomData.connectedsUsers.get(requests[0].userId)
            if (!socket) return
            io.to(socket).emit('ability-additional-request', requests[0])
        } else {
            // if (roomData.turnState.turn === resolution.userId) {
            //     const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            //     if (roomIndex === -1) return
            //     if (!activeSocket) return
            //     if (!Battle_Brawlers_Game_State[roomIndex]) return

            //     const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
            //     if (merged.length > 0) {
            //         io.to(activeSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
            //     } else {
            //         clearAnimationsInRoom(roomId)
            //         turnActionUpdater({ roomId, userId: request.userId, io })
            //     }

            // }

            // if (roomData.turnState.turn !== resolution.userId) {
            //     const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            //     if (roomIndex === -1) return
            //     if (!Battle_Brawlers_Game_State[roomIndex]) return
            //     if (!inactiveSocket) return

            //     const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional].flat()
            //     if (merged.length <= 0) return
            //     io.to(inactiveSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
            // }
            const { battleInProcess, paused, slot } = Battle_Brawlers_Game_State[roomIndex].battleState
            if (battleInProcess && !paused && slot !== null) {
                turnActionUpdater({
                    io: io,
                    roomId: roomId,
                    userId: resolution.userId,
                    updateBattleState: false
                })
            } else {
                const activePlayer = roomData.players.find((player) => player.userId === roomData.turnState.turn)?.userId
                if (!activePlayer) return
                const activePlayerSocket = roomData.connectedsUsers.get(activePlayer)
                if (!activePlayerSocket) return
                io.to(activePlayerSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
            }

        }

        if (!result) return
        if (result.turnActionLaucher) {
            turnActionUpdater({
                io: io,
                roomId: roomId,
                userId: resolution.userId
            })
        }

    })
}