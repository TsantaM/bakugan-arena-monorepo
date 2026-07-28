import { Server, Socket } from "socket.io";
import { UpdateGate } from "../functions/set-gate-server";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { ActivePlayerActionRequestType, addSlotToSetBakugan, InactivePlayerActionRequestType, removeActionByType, SetBakuganActionRequest, setGateCardProps, slots_id } from "@bakugan-arena/game-data";
import { turnActionUpdater } from "./turn-action";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { EmitMessage } from "../functions/emit-messages";
import { CheckTurnPermissions } from "../functions/ckeck-turn-permissions";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { grantActionIncrement, syncClocks } from "../functions/start-player-timer";
import { logPermissionDenied, logSocketEvent } from "../functions/log-socket-event";

export const socketUpdateGateState = (io: Server, socket: Socket) => {
    socket.on('set-gate', ({ roomId, gateId, slot, userId }: setGateCardProps) => {
        const roomIndex = Battle_Brawlers_Game_State.findIndex((s) => s?.roomId === roomId)
        if (roomIndex === -1) return

        let state = Battle_Brawlers_Game_State[roomIndex]
        if (!state || state.status.finished === true) return

        const checker = CheckTurnPermissions({
            roomState: state,
            userId: userId,
            response: {
                type: slot ? "SET_GATE_CARD_ACTION" : 'SELECT_GATE_CARD',
                gateId: gateId,
                slot: slot as slots_id | undefined
            }
        })

        if (!checker) {
            logPermissionDenied(state, "set-gate", userId)
            return
        }

        clearAnimationsInRoom(roomId)

        logSocketEvent(state, {
            handler: "set-gate",
            userId,
            input: { roomId, gateId, slot },
            message: slot ? "Pose de gate card" : "Sélection de gate card",
        })


        if (!slot) {
            const slot: slots_id = state.turnState.turn === userId ? 'slot-2' : 'slot-5'

            const animation = UpdateGate({ roomId, gateId, slot, userId })
            state = Battle_Brawlers_Game_State[roomIndex]
            if (!state) return
            io.to(roomId).emit('update-room-state', state)
            if (!animation) return
            io.to(roomId).emit('animations', animation)
            animation.forEach((a) => EmitMessage({ roomState: state, animation: a, io }))
        } else {

            const animation = UpdateGate({ roomId, gateId, slot, userId })
            state = Battle_Brawlers_Game_State[roomIndex]
            if (!state) return
            io.to(roomId).emit('update-room-state', state)
            if (!animation) return
            io.to(roomId).emit('animations', animation)
            animation.forEach((a) => EmitMessage({ roomState: state, animation: a, io }))

        }

        const activeSocket = state.connectedsUsers.get(state.turnState.turn)
        const inactiveSocket = state.connectedsUsers.get(state.turnState.previous_turn || '')

        if (state.turnState.turnCount === 0) {
            if (!Battle_Brawlers_Game_State[roomIndex]) return

            if (state.turnState.turn === userId) {
                const newState = removeActionByType(state.ActivePlayerActionRequest, "SELECT_GATE_CARD")
                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
            } else {
                const newState = removeActionByType(state.InactivePlayerActionRequest, "SELECT_GATE_CARD")
                Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest = newState as InactivePlayerActionRequestType
            }

            state = Battle_Brawlers_Game_State[roomIndex]

            const gateCardOnFieldCount = state.protalSlots.filter((portalSlot) => portalSlot.portalCard !== null).length

            grantActionIncrement({ roomState: state, userId, io })
            syncClocks({ roomState: state, io })

            if (gateCardOnFieldCount === 2) {
                turnActionUpdater({
                    io: io,
                    roomId: roomId,
                    userId: userId,
                })
            }

        } else {
            grantActionIncrement({ roomState: state, userId, io })
            if (state.turnState.turn === userId) {
                const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
                if (roomIndex === -1) return
                if (!activeSocket) return
                if (!Battle_Brawlers_Game_State[roomIndex]) return
                const newState = removeActionByType(Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest, "SET_GATE_CARD_ACTION")
                addSlotToSetBakugan(slot as slots_id, newState)
                SetBakuganActionRequest({ roomState: state })

                const checker = CheckTurnActionRequest({ roomState: state, userId: userId })
                if (!checker) {
                    syncClocks({ roomState: state, io })
                    return
                }

                Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
                io.to(activeSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].ActivePlayerActionRequest)
                syncClocks({ roomState: state, io })

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

                const checker = CheckTurnActionRequest({ roomState: state, userId: userId })
                if (!checker) {
                    syncClocks({ roomState: state, io })
                    return
                }

                if (merged.length <= 0) {
                    syncClocks({ roomState: state, io })
                    return
                }
                io.to(inactiveSocket.gameboardSocket).emit('turn-action-request', Battle_Brawlers_Game_State[roomIndex].InactivePlayerActionRequest)
                syncClocks({ roomState: state, io })
            }
        }

    })
}