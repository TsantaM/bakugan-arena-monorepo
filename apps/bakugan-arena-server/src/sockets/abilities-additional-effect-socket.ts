import { Server, Socket } from "socket.io";
import { AbilityCardsList, ActivePlayerActionRequestType, ExclusiveAbilitiesList, InactivePlayerActionRequestType, removeActionByType, resolutionType } from "@bakugan-arena/game-data";
import { clearAnimationsInRoom } from "./clear-animations-socket";
import { turnActionUpdater } from "./turn-action";
import { EmitMessage } from "../functions/emit-messages";
import { CheckTurnActionRequest } from "../functions/check-turn-action-request-permissions";
import {
    emitToUserGameboard,
    runRoomSocketAction,
} from "../functions/room-runtime";

export function AbilitiesAdditionalEffectsSocket(io: Server, socket: Socket) {
    socket.on('ability-additional-request', (resolution: resolutionType & { actionSeq?: number | string }) => {
        runRoomSocketAction({
            socket,
            roomId: resolution.roomId,
            event: 'ability-additional-request',
            actionSeq: resolution.actionSeq,
            userId: resolution.userId,
            handler: (roomData) => {
                clearAnimationsInRoom(resolution.roomId)
                if (roomData.status.finished === true) return

                const roomId = roomData.roomId
                const request = roomData.AbilityAditionalRequest.find((req) =>
                    req.bakuganKey === resolution.bakuganKey
                    && req.cardKey === resolution.cardKey
                    && req.userId === resolution.userId
                )
                const requestIndex = roomData.AbilityAditionalRequest.findIndex((req) =>
                    req.bakuganKey === resolution.bakuganKey
                    && req.cardKey === resolution.cardKey
                    && req.userId === resolution.userId
                )

                if (!request || requestIndex === -1) return

                const ability = [AbilityCardsList, ExclusiveAbilitiesList].flat().find((a) => a.key === request.cardKey)
                if (!ability?.onAdditionalEffect) return

                const result = ability.onAdditionalEffect({
                    resolution,
                    roomData,
                })

                roomData.AbilityAditionalRequest.splice(requestIndex, 1)

                io.to(roomData.roomId).emit('animations', roomData.animations)
                roomData.animations.forEach((animation) => EmitMessage({ roomState: roomData, animation, io }))
                roomData.animations = []

                if (roomData.AbilityAditionalRequest.length > 0) {
                    const next = roomData.AbilityAditionalRequest[0]
                    const targetId = next.data.target ? next.data.target : next.userId
                    emitToUserGameboard(io, roomData, targetId, 'ability-additional-request', next, socket.id)
                    return
                }

                if (roomData.turnState.turn === resolution.userId) {
                    if (!roomData.battleState.battleInProcess || roomData.battleState.paused) {
                        roomData.ActivePlayerActionRequest = removeActionByType(
                            roomData.ActivePlayerActionRequest,
                            "SET_BAKUGAN",
                        ) as ActivePlayerActionRequestType
                        roomData.ActivePlayerActionRequest = removeActionByType(
                            roomData.ActivePlayerActionRequest,
                            "SET_GATE_CARD_ACTION",
                        ) as ActivePlayerActionRequestType
                    }

                    roomData.ActivePlayerActionRequest = removeActionByType(
                        roomData.ActivePlayerActionRequest,
                        "USE_ABILITY_CARD",
                    ) as ActivePlayerActionRequestType

                    const merged = [
                        roomData.ActivePlayerActionRequest.actions.mustDo,
                        roomData.ActivePlayerActionRequest.actions.mustDoOne,
                        roomData.ActivePlayerActionRequest.actions.optional,
                    ].flat()

                    if (!CheckTurnActionRequest({ roomState: roomData, userId: resolution.userId })) return

                    if (merged.length > 0) {
                        emitToUserGameboard(
                            io,
                            roomData,
                            resolution.userId,
                            'turn-action-request',
                            roomData.ActivePlayerActionRequest,
                            socket.id,
                        )
                    } else if (!result?.turnActionLaucher) {
                        clearAnimationsInRoom(roomId)
                        turnActionUpdater({
                            roomId,
                            userId: request.userId,
                            io,
                            fallbackSocketId: socket.id,
                        })
                    }
                } else {
                    roomData.InactivePlayerActionRequest = removeActionByType(
                        roomData.InactivePlayerActionRequest,
                        "USE_ABILITY_CARD",
                    ) as InactivePlayerActionRequestType

                    if (!CheckTurnActionRequest({ roomState: roomData, userId: resolution.userId })) return

                    const merged = [
                        roomData.InactivePlayerActionRequest.actions.mustDo,
                        roomData.InactivePlayerActionRequest.actions.mustDoOne,
                        roomData.InactivePlayerActionRequest.actions.optional,
                    ].flat()
                    if (merged.length <= 0) return

                    emitToUserGameboard(
                        io,
                        roomData,
                        resolution.userId,
                        'turn-action-request',
                        roomData.InactivePlayerActionRequest,
                        socket.id,
                    )
                }

                if (result?.turnActionLaucher) {
                    turnActionUpdater({
                        io,
                        roomId,
                        userId: resolution.userId,
                        fallbackSocketId: socket.id,
                    })
                }
            },
        })
    })
}
