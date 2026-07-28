import type { stateType } from "@bakugan-arena/game-data"
import { logGameEvent, sanitizeForLog } from "@bakugan-arena/game-data"

type SocketLogInput = {
    handler: string
    userId?: string
    input?: unknown
    output?: unknown
    message?: string
    ok?: boolean
}

export function logSocketEvent(state: stateType, event: SocketLogInput): void {
    logGameEvent(state, {
        handler: event.handler,
        category: "socket",
        level: event.ok === false ? "warn" : "info",
        input: {
            userId: event.userId,
            ...(event.input !== undefined
                ? (sanitizeForLog(event.input) as Record<string, unknown>)
                : {}),
        },
        output: event.output,
        message: event.message,
    })
}

export function logPermissionDenied(
    state: stateType,
    handler: string,
    userId: string,
    reason?: string,
): void {
    logGameEvent(state, {
        handler,
        category: "permission",
        level: "warn",
        input: { userId },
        message: reason ?? "Permission refusée",
        output: { ok: false },
    })
}
