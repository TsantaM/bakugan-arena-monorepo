import type { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import type { replayDataType } from "../../type/battlefield-and-replay-types.js"
import type { replayEntryType, replaySnapshotType } from "../../type/replay-snapshot-types.js"
import { createEmptyReplaySnapshot } from "./capture-replay-snapshot.js"

type LegacyReplayDataType = {
    roomId: string
    player1: replayDataType["player1"]
    player2: replayDataType["player2"]
    replay: AnimationDirectivesTypes[]
}

function wrapLegacyAnimation(animation: AnimationDirectivesTypes, snapshot: replaySnapshotType): replayEntryType {
    return {
        animation,
        stateBefore: snapshot,
        stateAfter: snapshot,
    }
}

function isLegacyReplayData(data: replayDataType & LegacyReplayDataType): boolean {
    if (!Array.isArray(data.replay) || data.replay.length === 0) return true
    const first = data.replay[0] as AnimationDirectivesTypes | replayEntryType
    return first !== null && typeof first === "object" && "type" in first && !("stateBefore" in first)
}

export function normalizeReplayData(data: unknown): replayDataType {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid replay data")
    }

    const candidate = data as replayDataType & LegacyReplayDataType

    if (
        typeof candidate.roomId === "string" &&
        candidate.player1 &&
        candidate.player2 &&
        Array.isArray(candidate.replay)
    ) {
        if (isLegacyReplayData(candidate)) {
            const emptySnapshot = createEmptyReplaySnapshot()
            const legacyReplay = candidate.replay as AnimationDirectivesTypes[]
            return {
                roomId: candidate.roomId,
                player1: candidate.player1,
                player2: candidate.player2,
                initialSnapshot: emptySnapshot,
                replay: legacyReplay.map((animation) => wrapLegacyAnimation(animation, emptySnapshot)),
                legacyReplay,
            }
        }

        if (candidate.initialSnapshot) {
            return candidate as replayDataType
        }
    }

    throw new Error("JSON structure invalid")
}
