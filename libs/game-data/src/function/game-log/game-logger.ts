import type { stateType } from "../../type/room-types.js"
import type {
    GameLogCategory,
    GameLogEvent,
    GameLogLevel,
    GameLogState,
    TurnLogBundle,
    TurnLogSummary,
} from "../../type/game-log-types.js"

/** Feature désactivée : trop coûteuse (RAM, clones IA, sérialisation socket). */
export const GAME_LOGS_ENABLED = false

const MAX_STRING_LENGTH = 500
const MAX_ARRAY_LENGTH = 20
const MAX_OBJECT_KEYS = 30

function truncateString(value: string): string {
    if (value.length <= MAX_STRING_LENGTH) return value
    return `${value.slice(0, MAX_STRING_LENGTH)}…`
}

export function sanitizeForLog(value: unknown, depth = 0): unknown {
    if (value === null || value === undefined) return value
    if (typeof value === "string") return truncateString(value)
    if (typeof value === "number" || typeof value === "boolean") return value
    if (typeof value === "bigint") return value.toString()
    if (typeof value === "function") return "[Function]"
    if (value instanceof Map) {
        return sanitizeForLog(Object.fromEntries(value.entries()), depth + 1)
    }
    if (value instanceof Set) {
        return sanitizeForLog([...value], depth + 1)
    }
    if (Array.isArray(value)) {
        if (depth > 3) return "[Array]"
        return value
            .slice(0, MAX_ARRAY_LENGTH)
            .map((item) => sanitizeForLog(item, depth + 1))
    }
    if (typeof value === "object") {
        if (depth > 3) return "[Object]"
        const entries = Object.entries(value as Record<string, unknown>).slice(
            0,
            MAX_OBJECT_KEYS,
        )
        return Object.fromEntries(
            entries.map(([key, nested]) => [key, sanitizeForLog(nested, depth + 1)]),
        )
    }
    return String(value)
}

function createEventId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyGameLogState(): GameLogState {
    return {
        turnLogs: [],
        currentTurnEvents: [],
    }
}

export function summarizeStateForLog(state: stateType): TurnLogSummary {
    return {
        turnCount: state.turnState.turnCount,
        activePlayerId: state.turnState.turn,
        battleInProcess: state.battleState.battleInProcess,
        battleTurns: state.battleState.battleInProcess
            ? state.battleState.turns
            : undefined,
        battleSlot: state.battleState.battleInProcess
            ? state.battleState.slot
            : undefined,
        finished: state.status.finished,
    }
}

type LogGameEventInput = {
    handler: string
    category: GameLogCategory
    level?: GameLogLevel
    input?: unknown
    output?: unknown
    message?: string
    durationMs?: number
}

export function logGameEvent(state: stateType, event: LogGameEventInput): void {
    if (!GAME_LOGS_ENABLED) return

    if (!state.gameLog) {
        state.gameLog = createEmptyGameLogState()
    }

    const entry: GameLogEvent = {
        id: createEventId(),
        ts: Date.now(),
        turnCount: state.turnState.turnCount,
        activePlayerId: state.turnState.turn,
        level: event.level ?? "info",
        category: event.category,
        handler: event.handler,
        input: event.input !== undefined ? sanitizeForLog(event.input) : undefined,
        output: event.output !== undefined ? sanitizeForLog(event.output) : undefined,
        message: event.message,
        durationMs: event.durationMs,
    }

    state.gameLog.currentTurnEvents.push(entry)
}

export function finalizeTurnLog(state: stateType): TurnLogBundle | null {
    if (!GAME_LOGS_ENABLED) return null

    if (!state.gameLog) {
        state.gameLog = createEmptyGameLogState()
    }

    const summaryEnd = summarizeStateForLog(state)
    const events = [...state.gameLog.currentTurnEvents]

    if (events.length === 0 && state.gameLog.turnLogs.length > 0) {
        return null
    }

    const summaryStart =
        state.gameLog.turnLogs.length > 0
            ? state.gameLog.turnLogs[state.gameLog.turnLogs.length - 1].summaryEnd
            : summarizeStateForLog(state)

    const bundle: TurnLogBundle = {
        turnNumber: state.gameLog.turnLogs.length + 1,
        turnCount: summaryEnd.turnCount,
        activePlayerId: summaryEnd.activePlayerId,
        battleInProcess: summaryEnd.battleInProcess,
        events,
        summaryStart,
        summaryEnd,
    }

    state.gameLog.turnLogs.push(bundle)
    state.gameLog.currentTurnEvents = []

    return bundle
}

export function attachActionRequestsToLastTurn(state: stateType): void {
    if (!GAME_LOGS_ENABLED) return
    if (!state.gameLog || state.gameLog.turnLogs.length === 0) return

    const lastTurn = state.gameLog.turnLogs[state.gameLog.turnLogs.length - 1]
    lastTurn.actionRequests = {
        active: structuredClone(state.ActivePlayerActionRequest),
        inactive: structuredClone(state.InactivePlayerActionRequest),
    }
}

export function getLastTurnLog(state: stateType): TurnLogBundle | null {
    if (!GAME_LOGS_ENABLED) return null
    if (!state.gameLog || state.gameLog.turnLogs.length === 0) return null
    return state.gameLog.turnLogs[state.gameLog.turnLogs.length - 1]
}

export async function runWithGameLog<T>(
    state: stateType,
    meta: Omit<LogGameEventInput, "output" | "durationMs">,
    fn: () => T | Promise<T>,
): Promise<T> {
    if (!GAME_LOGS_ENABLED) return fn()

    const startedAt = Date.now()
    try {
        const output = await fn()
        logGameEvent(state, {
            ...meta,
            output,
            durationMs: Date.now() - startedAt,
        })
        return output
    } catch (error) {
        logGameEvent(state, {
            ...meta,
            level: "error",
            output: error instanceof Error ? error.message : String(error),
            durationMs: Date.now() - startedAt,
            message: meta.message ?? `${meta.handler} failed`,
        })
        throw error
    }
}
