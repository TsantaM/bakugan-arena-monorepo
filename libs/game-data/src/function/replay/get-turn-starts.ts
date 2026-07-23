import type { replayEntryType, replaySnapshotType } from "../../type/replay-snapshot-types.js"
import type { replayDataType } from "../../type/battlefield-and-replay-types.js"

/** Indices d'entrée qui marquent le début d'un tour (après chaque `turn_end`). */
export function getTurnStarts(replay: replayEntryType[]): number[] {
    const starts = [0]
    for (let i = 0; i < replay.length; i++) {
        if (replay[i].marker === "turn_end" && i + 1 < replay.length) {
            starts.push(i + 1)
        }
    }
    return starts
}

export function findNextTurnStart(
    replay: replayEntryType[],
    currentIndex: number,
): number | null {
    const starts = getTurnStarts(replay)
    return starts.find((start) => start > currentIndex) ?? null
}

export function findPrevTurnStart(
    replay: replayEntryType[],
    currentIndex: number,
): number | null {
    const starts = getTurnStarts(replay)
    let currentStart = 0

    for (const start of starts) {
        if (start <= currentIndex) currentStart = start
        else break
    }

    if (currentIndex > currentStart) return currentStart

    const idx = starts.indexOf(currentStart)
    if (idx <= 0) return null
    return starts[idx - 1]
}

/** Snapshot au début d'une entrée (comme le seek replay 3D). */
export function getSnapshotAtEntryIndex(
    data: Pick<replayDataType, "initialSnapshot" | "replay">,
    entryIndex: number,
): replaySnapshotType {
    if (entryIndex <= 0) return structuredClone(data.initialSnapshot)
    const entry = data.replay[entryIndex]
    if (!entry) return structuredClone(data.initialSnapshot)
    return structuredClone(entry.stateBefore)
}

export type ReplayTurnOption = {
    /** Index 1-based pour l'UI (tour 1, tour 2…) */
    turnNumber: number
    /** Index dans `replay[]` (0 = initialSnapshot) */
    entryIndex: number
    turnCount: number
    turnUserId: string
}

export function listReplayTurnOptions(
    data: Pick<replayDataType, "initialSnapshot" | "replay">,
): ReplayTurnOption[] {
    return getTurnStarts(data.replay).map((entryIndex, index) => {
        const snapshot = getSnapshotAtEntryIndex(data, entryIndex)
        return {
            turnNumber: index + 1,
            entryIndex,
            turnCount: snapshot.turnState.turnCount,
            turnUserId: snapshot.turnState.turn,
        }
    })
}
