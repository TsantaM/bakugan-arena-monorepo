import { Server, Socket } from "socket.io/dist";
import { UpdateGate } from "../functions/set-gate-server";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { setGateCardProps, slots_id } from "@bakugan-arena/game-data";
import { addSlotToSetBakugan, removeActionByType } from "@bakugan-arena/game-data/src/function/create-animation-directives/remove-action-by-type";
import { ActivePlayerActionRequestType, InactivePlayerActionRequestType } from "@bakugan-arena/game-data/src/type/actions-serveur-requests";
import { turnActionUpdater } from "./turn-action";
import { clearAnimationsInRoom } from "./clear-animations-socket";

export const socketUpdateGateState = (io: Server, socket: Socket) => {
    socket.on('set-gate', ({ roomId, gateId, slot, userId }: setGateCardProps) => {
        const state = Battle_Brawlers_Game_State.find((s) => s?.roomId === roomId)
        if (!state) return
        clearAnimationsInRoom(roomId)

        console.log(state.turnState.turnCount)

        if (!slot) {
            const slot: slots_id = state.turnState.turn === userId ? 'slot-2' : 'slot-5'

            const animation = UpdateGate({ roomId, gateId, slot, userId })
            if (state) {
                io.to(roomId).emit('update-room-state', state)
                if (!animation) return
                io.to(roomId).emit('animations', animation)
            }
        } else {

            const animation = UpdateGate({ roomId, gateId, slot, userId })
            if (state) {
                io.to(roomId).emit('update-room-state', state)
                if (!animation) return
                io.to(roomId).emit('animations', animation)
            }

        }


        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

        if (state.turnState.turnCount === 0) {
            const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
            if (roomIndex === -1) return
            if (!Battle_Brawlers_Game_State[roomIndex]) return

            if (state.turnState.turn === userId) {
                const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "SELECT_GATE_CARD")
                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            } else {
                const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest, "SELECT_GATE_CARD")
                Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType
            }

            const gateCardOnFieldCount = Battle_Brawlers_Game_State[roomIndex].protalSlots.filter((slot) => slot.portalCard !== null).length


            console.log('turn count before update', state.turnState.turnCount)
            console.log('gate card count', gateCardOnFieldCount)

            if (gateCardOnFieldCount === 2) {
                turnActionUpdater({
                    io: io,
                    roomId: roomId,
                    userId: userId,
                })
            }

            console.log('turn count after set gate', state.turnState.turnCount)


        } else {
            if (state.turnState.turn === userId) {
                const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
                if (roomIndex === -1) return
                if (!activeSocket) return
                if (!Battle_Brawlers_Game_State[roomIndex]) return
                const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "SET_GATE_CARD_ACTION")
                addSlotToSetBakugan(slot as slots_id, newState)
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
                const merged = [Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDo, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.mustDoOne, Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest.actions.optional].flat()
                if (merged.length <= 0) return
                io.to(inactiveSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
            }
        }

    })
}