import type { stateType } from "../../type/room-types.js"
import type { GameLogLevel } from "../../type/game-log-types.js"
import { logGameEvent } from "./game-logger.js"

type ActionCounts = {
    mustDo: number
    mustDoOne: number
    optional: number
    total: number
}

export function countActionRequestActions(actions: {
    mustDo: unknown[]
    mustDoOne: unknown[]
    optional: unknown[]
}): ActionCounts {
    const mustDo = actions.mustDo.length
    const mustDoOne = actions.mustDoOne.length
    const optional = actions.optional.length
    return {
        mustDo,
        mustDoOne,
        optional,
        total: mustDo + mustDoOne + optional,
    }
}

export function buildConnectedUsersSummary(state: stateType) {
    return [...state.connectedsUsers.entries()].map(([userId, sockets]) => ({
        userId,
        gameboardSocket: sockets.gameboardSocket,
        nextjsSocket: sockets.nextjsSocket,
    }))
}

export function buildActionRequestsSummary(state: stateType) {
    return {
        active: countActionRequestActions(state.ActivePlayerActionRequest.actions),
        inactive: countActionRequestActions(state.InactivePlayerActionRequest.actions),
        gateAdditionalPending: state.gateCardActionRequest.length,
        abilityAdditionalPending: state.AbilityAditionalRequest.length,
    }
}

export function logDiagnostic(
    state: stateType,
    event: {
        handler: string
        message: string
        output?: unknown
        input?: unknown
        level?: GameLogLevel
    },
): void {
    logGameEvent(state, {
        ...event,
        category: "diagnostic",
        level: event.level ?? "info",
    })
}
