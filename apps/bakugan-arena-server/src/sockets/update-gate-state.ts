import { Server, Socket } from "socket.io/dist";
import { UpdateGate } from "../functions/set-gate-server";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { setGateCardProps, slots_id } from "@bakugan-arena/game-data";
import { addSlotToSetBakugan, removeActionByType } from "@bakugan-arena/game-data/src/function/create-animation-directives/remove-action-by-type";
import { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";

export const socketUpdateGateState = (io: Server, socket: Socket) => {
    socket.on('set-gate', ({ roomId, gateId, slot, userId }: setGateCardProps) => {
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return
        state.animations = [];
        const animation = UpdateGate({ roomId, gateId, slot, userId })

        if (state) {
            const animations = state.animations
            console.log('animations', animations)
            io.to(roomId).emit('update-room-state', state)
            if (!animation) return
            io.to(roomId).emit('animations', animation)
        }

        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

        console.log('sockets', activeSocket, inactiveSocket)

        if (state.turnState.turn === userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!activeSocket) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "SET_GATE_CARD_ACTION")
            addSlotToSetBakugan(slot as slots_id, newState)
            console.log('new State:', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
            Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            io.to(activeSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)

        }

        if (state.turnState.turn !== userId) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return
            if (!inactiveSocket) return
            const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "SET_GATE_CARD_ACTION")
            addSlotToSetBakugan(slot as slots_id, newState)
            Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType
            console.log('new State:', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
            const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
            if (merged.length <= 0) return
            io.to(inactiveSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
        }
    })
}