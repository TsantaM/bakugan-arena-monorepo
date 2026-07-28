import type { stateType } from "@bakugan-arena/game-data"
import {
    buildActionRequestsSummary,
    buildConnectedUsersSummary,
    countActionRequestActions,
    logDiagnostic,
} from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { CheckTurnActionRequest } from "./check-turn-action-request-permissions"

type EmitResult = {
    role: "active" | "inactive"
    userId: string
    emitted: boolean
    reason: string
    gameboardSocket?: string
    actionCounts?: ReturnType<typeof countActionRequestActions>
}

function describeBlockers(state: stateType) {
    return {
        finished: state.status.finished,
        gateAdditionalPending: state.gateCardActionRequest.length,
        abilityAdditionalPending: state.AbilityAditionalRequest.length,
    }
}

export function emitTurnActionRequestsWithDiagnostics({
    roomState,
    io,
    userId,
    source,
}: {
    roomState: stateType
    io: Server
    userId: string
    source: string
}): void {
    const blockers = describeBlockers(roomState)
    const results: EmitResult[] = []

    const activeUserId = roomState.turnState.turn
    const inactiveUserId = roomState.turnState.previous_turn ?? ""
    const activeSocket = roomState.connectedsUsers.get(activeUserId)
    const inactiveSocket = inactiveUserId
        ? roomState.connectedsUsers.get(inactiveUserId)
        : undefined

    const additionalBlocking =
        blockers.gateAdditionalPending > 0 || blockers.abilityAdditionalPending > 0

    if (
        activeSocket &&
        !roomState.status.finished &&
        !additionalBlocking
    ) {
        const checker = CheckTurnActionRequest({ roomState, userId })
        const actionCounts = countActionRequestActions(
            roomState.ActivePlayerActionRequest.actions,
        )

        if (!checker) {
            results.push({
                role: "active",
                userId: activeUserId,
                emitted: false,
                reason: "CheckTurnActionRequest refusé",
                gameboardSocket: activeSocket.gameboardSocket,
                actionCounts,
            })
        } else {
            io.to(activeSocket.gameboardSocket).emit(
                "turn-action-request",
                roomState.ActivePlayerActionRequest,
            )
            results.push({
                role: "active",
                userId: activeUserId,
                emitted: true,
                reason: "émis",
                gameboardSocket: activeSocket.gameboardSocket,
                actionCounts,
            })
        }
    } else {
        let reason = "non émis"
        if (!activeSocket) reason = "socket actif absent"
        else if (roomState.status.finished) reason = "partie terminée"
        else if (additionalBlocking) reason = "additional request en attente"

        results.push({
            role: "active",
            userId: activeUserId,
            emitted: false,
            reason,
            gameboardSocket: activeSocket?.gameboardSocket,
            actionCounts: countActionRequestActions(
                roomState.ActivePlayerActionRequest.actions,
            ),
        })
    }

    if (
        inactiveSocket &&
        !roomState.status.finished &&
        !additionalBlocking
    ) {
        const checker = CheckTurnActionRequest({ roomState, userId })
        const actionCounts = countActionRequestActions(
            roomState.InactivePlayerActionRequest.actions,
        )
        const merged = actionCounts.total

        if (!checker) {
            results.push({
                role: "inactive",
                userId: inactiveUserId,
                emitted: false,
                reason: "CheckTurnActionRequest refusé",
                gameboardSocket: inactiveSocket.gameboardSocket,
                actionCounts,
            })
        } else if (merged === 0) {
            results.push({
                role: "inactive",
                userId: inactiveUserId,
                emitted: false,
                reason: "aucune action disponible (merged vide)",
                gameboardSocket: inactiveSocket.gameboardSocket,
                actionCounts,
            })
        } else {
            io.to(inactiveSocket.gameboardSocket).emit(
                "turn-action-request",
                roomState.InactivePlayerActionRequest,
            )
            results.push({
                role: "inactive",
                userId: inactiveUserId,
                emitted: true,
                reason: "émis",
                gameboardSocket: inactiveSocket.gameboardSocket,
                actionCounts,
            })
        }
    } else if (inactiveUserId) {
        let reason = "non émis"
        if (!inactiveSocket) reason = "socket inactif absent"
        else if (roomState.status.finished) reason = "partie terminée"
        else if (additionalBlocking) reason = "additional request en attente"

        results.push({
            role: "inactive",
            userId: inactiveUserId,
            emitted: false,
            reason,
            gameboardSocket: inactiveSocket?.gameboardSocket,
            actionCounts: countActionRequestActions(
                roomState.InactivePlayerActionRequest.actions,
            ),
        })
    }

    const hasWarning = results.some(
        (result) =>
            !result.emitted &&
            (result.actionCounts?.total ?? 0) > 0 &&
            !additionalBlocking &&
            !roomState.status.finished,
    )

    logDiagnostic(roomState, {
        handler: "turn-action-request.emit",
        message: `Émission turn-action-request (${source})`,
        level: hasWarning ? "warn" : "info",
        output: {
            source,
            blockers,
            actionRequests: buildActionRequestsSummary(roomState),
            connectedUsers: buildConnectedUsersSummary(roomState),
            results,
        },
    })
}
