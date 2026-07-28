import {
    GateCards,
    logDiagnostic,
    resolutionGateCardType,
    stateType,
} from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { EmitMessage } from "./emit-messages"
import { grantActionIncrement } from "./start-player-timer"
import { clearAnimationsInRoom } from "../sockets/clear-animations-socket"
import {
    continueRoomFlowAfterAdditional,
    markAdditionalPending,
    tryEmitPendingAdditionalRequest,
} from "./resume-room-flow"

function invokeTurnActionUpdater({
    roomId,
    userId,
    io,
}: {
    roomId: string
    userId: string
    io: Server
}) {
    const { turnActionUpdater } = require("../sockets/turn-action") as typeof import("../sockets/turn-action")
    turnActionUpdater({ roomId, userId, io })
}

export function autoSkipGateAdditional({
    roomState,
    io,
}: {
    roomState: stateType
    io: Server
}): boolean {
    const request = roomState.gateCardActionRequest[0]
    if (!request) return false

    return processGateAdditionalResolution(io, {
        roomId: request.roomId,
        userId: request.userId,
        cardKey: request.cardKey,
        slot: request.slot,
        data: { type: "SKIP_ACTION" },
    })
}

export function processGateAdditionalResolution(
    io: Server,
    resolution: resolutionGateCardType,
): boolean {
    clearAnimationsInRoom(resolution.roomId)
    const roomData = Battle_Brawlers_Game_State.find(
        (room) => room?.roomId === resolution.roomId,
    )
    const roomIndex = Battle_Brawlers_Game_State.findIndex(
        (room) => room?.roomId === resolution.roomId,
    )
    if (!roomData || roomIndex === -1 || roomData.status.finished) return false

    const request = roomData.gateCardActionRequest.find(
        (req) =>
            req.cardKey === resolution.cardKey &&
            req.userId === resolution.userId,
    )
    const requestIndex = roomData.gateCardActionRequest.findIndex(
        (req) =>
            req.cardKey === resolution.cardKey &&
            req.userId === resolution.userId,
    )

    if (!request || requestIndex === -1) {
        logDiagnostic(roomData, {
            handler: "gate-additional.resolved",
            level: "warn",
            message: "Résolution gate additional — requête introuvable",
            input: resolution,
        })
        return false
    }

    const roomState = Battle_Brawlers_Game_State[roomIndex]
    if (!roomState) return false

    const card = GateCards[request.cardKey]
    if (!card.onAdditionalRequest) return false

    const result = card.onAdditionalRequest({
        resolution,
        roomState,
    })

    roomState.gateCardActionRequest.splice(requestIndex, 1)

    logDiagnostic(roomData, {
        handler: "gate-additional.resolved",
        message: "Résolution gate additional traitée",
        output: {
            cardKey: request.cardKey,
            resolutionType: resolution.data.type,
            remainingGateRequests: roomState.gateCardActionRequest.length,
            autoResolved: resolution.data.type === "SKIP_ACTION",
        },
    })

    io.to(roomData.roomId).emit("animations", roomState.animations)
    roomState.animations.forEach((animation) =>
        EmitMessage({ roomState, animation, io }),
    )
    roomState.animations = []

    const actingUserId = request.data.target ?? request.userId
    grantActionIncrement({ roomState: roomData, userId: actingUserId, io })

    if (roomState.gateCardActionRequest.length > 0) {
        markAdditionalPending(roomData.roomId)
        tryEmitPendingAdditionalRequest(roomData, io)
        return true
    }

    if (result !== null && result.type === "TURN_ACTION_LAUNCHER") {
        invokeTurnActionUpdater({
            roomId: roomData.roomId,
            userId: resolution.userId,
            io,
        })
        return true
    }

    continueRoomFlowAfterAdditional({
        roomState: roomData,
        io,
        userId: resolution.userId,
        source: "gate-additional-resolution.after",
    })
    return true
}
