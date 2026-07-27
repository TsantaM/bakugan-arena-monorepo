import type { replayReferenceType } from "../../type/battlefield-and-replay-types.js"

export function isReplayReference(data: unknown): data is replayReferenceType {
    if (!data || typeof data !== "object") return false

    const candidate = data as Record<string, unknown>

    return (
        typeof candidate.id === "string" &&
        typeof candidate.roomId === "string" &&
        Boolean(candidate.player1) &&
        Boolean(candidate.player2) &&
        !Array.isArray(candidate.replay) &&
        candidate.initialSnapshot === undefined
    )
}
