import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { SetBakuganOnGate } from "../functions/set-bakugan-server";
import { setBakuganProps } from "@bakugan-arena/game-data";
import { removeActionByType } from "@bakugan-arena/game-data/src/function/create-animation-directives/remove-action-by-type";
import { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export const socketUpdateBakuganState = (io: Server, socket: Socket) => {
    socket.on('set-bakugan', ({ roomId, bakuganKey, slot, userId }: setBakuganProps) => {
        const animation = SetBakuganOnGate({ roomId, bakuganKey, slot, userId })
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return

        if (state) {
            const animations = state.animations
            console.log('animations', animations)
            io.to(roomId).emit('update-room-state', state)
            if (!animation) return
            io.to(roomId).emit('animations', animation)
        }

        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

        if (state.turnState.turn === userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!activeSocket) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "SET_BAKUGAN")
            console.log('new State:', state.ActivePlayerActionRequest)
            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
            console.log('merged', merged)
            if (merged.length <= 0) return
            io.to(activeSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
        }

        if (state.turnState.turn !== userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return
            if (!inactiveSocket) return
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "SET_BAKUGAN")
            console.log('new State:', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType
            const merged = [Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest.actions.optional].flat()
            console.log('merged', merged)
            if (merged.length <= 0) return
            io.to(inactiveSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
        }
    })
}