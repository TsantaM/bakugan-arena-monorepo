import { Server, Socket } from "socket.io";
import { UpdateGate } from "../functions/set-gate-server";
import {
    ActivePlayerActionRequestType,
    addSlotToSetBakugan,
    InactivePlayerActionRequestType,
    removeActionByType,
    SetBakuganActionRequest,
    setGateCardProps,
    slots_id,
} from "@bakugan-arena/game-data";
import { turnActionUpdater } from "./turn-action";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { EmitMessage } from "../functions/emit-messages";
import { CheckTurnPermissions } from "../functions/ckeck-turn-permissions";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import { StopPlayerTimer } from "../functions/start-player-timer";
import {
    emitRoomStateUpdate,
    emitToUserGameboard,
    runRoomSocketAction,
} from "../functions/room-runtime";

export const socketUpdateGateState = (io: Server, socket: Socket) => {
    socket.on('set-gate', (payload: setGateCardProps & { actionSeq?: number | string }) => {
        const { roomId, gateId, slot, userId, actionSeq } = payload

        runRoomSocketAction({
            socket,
            roomId,
            event: 'set-gate',
            actionSeq,
            userId,
            handler: (state) => {
                if (state.status.finished === true) return

                const checker = CheckTurnPermissions({
                    roomState: state,
                    userId: userId,
                    response: {
                        type: slot ? "SET_GATE_CARD_ACTION" : 'SELECT_GATE_CARD',
                        gateId: gateId,
                        slot: slot as slots_id | undefined
                    }
                })

                if (!checker) return

                clearAnimationsInRoom(roomId)

                const resolvedSlot: slots_id = slot
                    ? (slot as slots_id)
                    : (state.turnState.turn === userId ? 'slot-2' : 'slot-5')

                const animation = UpdateGate({
                    roomId,
                    gateId,
                    slot: resolvedSlot,
                    userId,
                })

                emitRoomStateUpdate(io, state, "update-room-state")

                if (animation && animation.length > 0) {
                    io.to(roomId).emit('animations', animation)
                    animation.forEach((a) => EmitMessage({ roomState: state, animation: a, io }))
                }

                if (state.turnState.turnCount === 0) {
                    if (state.turnState.turn === userId) {
                        state.ActivePlayerActionRequest = removeActionByType(
                            state.ActivePlayerActionRequest,
                            "SELECT_GATE_CARD",
                        ) as ActivePlayerActionRequestType
                    } else {
                        state.InactivePlayerActionRequest = removeActionByType(
                            state.InactivePlayerActionRequest,
                            "SELECT_GATE_CARD",
                        ) as InactivePlayerActionRequestType
                    }

                    const gateCardOnFieldCount = state.protalSlots.filter(
                        (portalSlot) => portalSlot.portalCard !== null,
                    ).length

                    StopPlayerTimer({ roomState: state, userId: userId })

                    if (gateCardOnFieldCount === 2) {
                        turnActionUpdater({
                            io: io,
                            roomId: roomId,
                            userId: userId,
                            fallbackSocketId: socket.id,
                        })
                    }
                    return
                }

                if (state.turnState.turn === userId) {
                    const newState = removeActionByType(
                        state.ActivePlayerActionRequest,
                        "SET_GATE_CARD_ACTION",
                    )
                    addSlotToSetBakugan(resolvedSlot, newState)
                    SetBakuganActionRequest({ roomState: state })

                    if (!CheckTurnActionRequest({ roomState: state, userId: userId })) return

                    state.ActivePlayerActionRequest = newState as ActivePlayerActionRequestType
                    emitToUserGameboard(
                        io,
                        state,
                        userId,
                        'turn-action-request',
                        state.ActivePlayerActionRequest,
                        socket.id,
                    )
                    return
                }

                const newState = removeActionByType(
                    state.InactivePlayerActionRequest,
                    "SET_GATE_CARD_ACTION",
                )
                addSlotToSetBakugan(resolvedSlot, newState)
                state.InactivePlayerActionRequest = newState as InactivePlayerActionRequestType

                const merged = [
                    state.InactivePlayerActionRequest.actions.mustDo,
                    state.InactivePlayerActionRequest.actions.mustDoOne,
                    state.InactivePlayerActionRequest.actions.optional,
                ].flat()

                if (!CheckTurnActionRequest({ roomState: state, userId: userId })) return
                if (merged.length <= 0) return

                emitToUserGameboard(
                    io,
                    state,
                    userId,
                    'turn-action-request',
                    state.InactivePlayerActionRequest,
                    socket.id,
                )
            },
        })
    })
}
