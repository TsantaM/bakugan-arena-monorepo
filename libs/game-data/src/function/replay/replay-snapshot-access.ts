import type { replayDataType } from "../../type/battlefield-and-replay-types.js"
import type { replayEntryType, replaySnapshotType } from "../../type/replay-snapshot-types.js"
import { applyReplayPatch } from "./replay-patch.js"

export type ReplayTimeline = Pick<replayDataType, "initialSnapshot" | "replay">

/**
 * Reconstruit les snapshots d'une timeline encodée en deltas.
 *
 * Avance incrémentalement sur son propre snapshot de travail ; en cas de seek
 * arrière, repart du keyframe (entrée portant un `stateAfter`) le plus proche.
 */
class ReplayTimelineHydrator {
    /** Index de l'entrée dont `working` représente l'état final (-1 = initialSnapshot). */
    private cursor = -1
    private working: replaySnapshotType

    constructor(private readonly timeline: ReplayTimeline) {
        this.working = structuredClone(timeline.initialSnapshot)
    }

    private restartAt(index: number): void {
        for (let i = index; i >= 0; i--) {
            const keyframe = this.timeline.replay[i]?.stateAfter
            if (keyframe) {
                this.working = structuredClone(keyframe)
                this.cursor = i
                return
            }
        }

        this.working = structuredClone(this.timeline.initialSnapshot)
        this.cursor = -1
    }

    /** État à la fin de l'entrée `index` (référence interne, ne pas muter). */
    stateAfter(index: number): replaySnapshotType {
        if (index < 0) {
            if (this.cursor !== -1) this.restartAt(-1)
            return this.working
        }

        if (this.cursor > index) this.restartAt(index)

        while (this.cursor < index) {
            const next = this.cursor + 1
            const entry = this.timeline.replay[next]

            if (!entry) break

            if (entry.stateAfter) {
                this.working = structuredClone(entry.stateAfter)
            } else if (entry.patch) {
                this.working = applyReplayPatch(this.working, entry.patch) as replaySnapshotType
            }

            this.cursor = next
        }

        return this.working
    }
}

const hydrators = new WeakMap<replayEntryType[], ReplayTimelineHydrator>()

function getHydrator(timeline: ReplayTimeline): ReplayTimelineHydrator {
    let hydrator = hydrators.get(timeline.replay)

    if (!hydrator) {
        hydrator = new ReplayTimelineHydrator(timeline)
        hydrators.set(timeline.replay, hydrator)
    }

    return hydrator
}

/** Snapshot au début de l'entrée `index` (compatible ancien format avec stateBefore explicite). */
export function getReplayStateBeforeAt(
    timeline: ReplayTimeline,
    index: number,
): replaySnapshotType {
    if (index <= 0) {
        return structuredClone(timeline.initialSnapshot)
    }

    const entry = timeline.replay[index]
    if (!entry) {
        return structuredClone(timeline.initialSnapshot)
    }

    if (entry.stateBefore) {
        return structuredClone(entry.stateBefore)
    }

    return structuredClone(getHydrator(timeline).stateAfter(index - 1))
}

/** Snapshot à la fin de l'entrée `index`. */
export function getReplayStateAfterAt(
    timeline: ReplayTimeline,
    index: number,
): replaySnapshotType {
    const entry = timeline.replay[index]
    if (!entry) {
        return structuredClone(timeline.initialSnapshot)
    }

    if (!entry.stateAfter && !entry.patch && entry.stateBefore) {
        return structuredClone(entry.stateBefore)
    }

    return structuredClone(getHydrator(timeline).stateAfter(index))
}
