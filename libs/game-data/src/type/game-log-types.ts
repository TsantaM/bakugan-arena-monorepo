import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
} from "./actions-serveur-requests.js"

export type GameLogLevel = "debug" | "info" | "warn" | "error"

export type GameLogCategory =
    | "socket"
    | "engine"
    | "battle"
    | "permission"
    | "bot"
    | "timer"
    | "system"
    | "diagnostic"

export type GameLogEvent = {
    id: string
    ts: number
    turnCount: number
    activePlayerId: string
    level: GameLogLevel
    category: GameLogCategory
    handler: string
    input?: unknown
    output?: unknown
    message?: string
    durationMs?: number
}

export type TurnLogSummary = {
    turnCount: number
    activePlayerId: string
    battleInProcess: boolean
    battleTurns?: number
    battleSlot?: string | null
    finished: boolean
}

export type TurnLogBundle = {
    turnNumber: number
    turnCount: number
    activePlayerId: string
    battleInProcess: boolean
    events: GameLogEvent[]
    summaryStart: TurnLogSummary
    summaryEnd: TurnLogSummary
    actionRequests?: {
        active: ActivePlayerActionRequestType
        inactive: InactivePlayerActionRequestType
    }
}

export type GameLogState = {
    turnLogs: TurnLogBundle[]
    currentTurnEvents: GameLogEvent[]
    /** True une fois les logs écrits en BDD (fin de partie ou cleanup). */
    persisted?: boolean
}
