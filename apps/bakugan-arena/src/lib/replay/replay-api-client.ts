import {
    isReplayReference,
    normalizeReplayData,
    type replayDataType,
    type replayReferenceType,
} from "@bakugan-arena/game-data"
import type { ReplaySelection } from "./replay-selection"
import type { SaveReplayInput } from "./replay-save-types"

export function getReplayApiBase(): string {
    return (process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3005").replace(/\/$/, "")
}

export function serializeReplayReference(reference: replayReferenceType): string {
    return JSON.stringify(reference, null, 2)
}

export async function loadReplaySelectionFromId(replayId: string): Promise<ReplaySelection> {
    const metadata = await fetchReplayMetadata(replayId)

    return {
        id: metadata.id,
        roomId: metadata.roomId,
        player1: metadata.player1,
        player2: metadata.player2,
    }
}

export async function fetchReplayMetadata(replayId: string): Promise<ReplaySelection & { title: string }> {
    const response = await fetch(`${getReplayApiBase()}/api/replay/${replayId}/meta`)

    if (!response.ok) {
        throw new Error(`Replay metadata unavailable (${response.status})`)
    }

    const data = await response.json() as ReplaySelection & { title: string }
    return data
}

export async function fetchReplayData(replayId: string): Promise<replayDataType> {
    const response = await fetch(`${getReplayApiBase()}/api/replay/${replayId}`)

    if (!response.ok) {
        throw new Error(`Replay unavailable (${response.status})`)
    }

    const payload: unknown = await response.json()
    return normalizeReplayData(payload)
}

export async function saveReplayToServer(
    input: SaveReplayInput,
    options: { ifExists: "return" | "reject" },
): Promise<ReplaySelection> {
    const response = await fetch(`${getReplayApiBase()}/api/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, ifExists: options.ifExists }),
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(errorBody?.error ?? `Failed to save replay (${response.status})`)
    }

    const saved = await response.json() as ReplaySelection
    return saved
}

export async function resolveReplayImportFromText(text: string): Promise<ReplaySelection> {
    let parsed: unknown

    try {
        parsed = JSON.parse(text)
    } catch {
        throw new Error("JSON Invalid")
    }

    if (isReplayReference(parsed)) {
        if (!parsed.player1 || !parsed.player2) {
            throw new Error("Missing player data")
        }

        await fetchReplayMetadata(parsed.id)

        return {
            id: parsed.id,
            roomId: parsed.roomId,
            player1: parsed.player1,
            player2: parsed.player2,
        }
    }

    const replayData = normalizeReplayData(parsed)

    if (!replayData.player1 || !replayData.player2) {
        throw new Error("Missing player data")
    }

    return saveReplayToServer(
        {
            roomId: replayData.roomId,
            player1: replayData.player1,
            player2: replayData.player2,
            replay: replayData.replay,
            initialSnapshot: replayData.initialSnapshot,
        },
        { ifExists: "return" },
    )
}

export async function resolveSandboxReplayImportFromText(text: string): Promise<replayDataType> {
    let parsed: unknown

    try {
        parsed = JSON.parse(text)
    } catch {
        throw new Error("JSON Invalid")
    }

    if (isReplayReference(parsed)) {
        return fetchReplayData(parsed.id)
    }

    return normalizeReplayData(parsed)
}
