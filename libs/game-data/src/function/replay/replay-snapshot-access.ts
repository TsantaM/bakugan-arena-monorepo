import type { replayDataType } from "../../type/battlefield-and-replay-types.js"
import type { replayEntryType, replaySnapshotType } from "../../type/replay-snapshot-types.js"

export type ReplayTimeline = Pick<replayDataType, "initialSnapshot" | "replay">

/** Snapshot au début de l'entrée `index` (compatible ancien format avec stateBefore explicite). */
export function getReplayStateBeforeAt(
    timeline: ReplayTimeline,
    index: number,
): replaySnapshotType {
    if (index <= 0) {
        return timeline.initialSnapshot
    }

    const entry = timeline.replay[index]
    if (!entry) {
        return timeline.initialSnapshot
    }

    if (entry.stateBefore) {
        return entry.stateBefore
    }

    const previous = timeline.replay[index - 1]
    if (previous?.stateAfter) {
        return previous.stateAfter
    }

    return timeline.initialSnapshot
}

/** Snapshot à la fin de l'entrée `index`. */
export function getReplayStateAfterAt(
    timeline: ReplayTimeline,
    index: number,
): replaySnapshotType {
    const entry = timeline.replay[index]
    if (!entry) {
        return timeline.initialSnapshot
    }

    if (entry.stateAfter) {
        return entry.stateAfter
    }

    if (entry.stateBefore) {
        return entry.stateBefore
    }

    return timeline.initialSnapshot
}
