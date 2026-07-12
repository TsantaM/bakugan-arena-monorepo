import type { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import type { replayEntryType, replayMarkerType } from "../../type/replay-snapshot-types.js"
import type { stateType } from "../../type/type-index.js"
import { captureReplaySnapshot } from "./capture-replay-snapshot.js"

function getPerspectiveUserId(state: stateType): string {
    return state.players[0]?.userId ?? ""
}

function getStateBefore(state: stateType, animationsForReplay: replayEntryType[]) {
    if (animationsForReplay.length > 0) {
        return animationsForReplay[animationsForReplay.length - 1].stateAfter
    }

    return state.initialReplaySnapshot
}

export function pushReplayAnimation(
    state: stateType,
    animation: AnimationDirectivesTypes
): void {
    const perspectiveUserId = getPerspectiveUserId(state)
    const stateAfter = captureReplaySnapshot(state, perspectiveUserId)

    state.animationsForReplay.push({
        animation,
        stateBefore: getStateBefore(state, state.animationsForReplay),
        stateAfter,
    })
}

export function pushReplayMarker(
    state: stateType,
    marker: replayMarkerType
): void {
    const perspectiveUserId = getPerspectiveUserId(state)
    const stateAfter = captureReplaySnapshot(state, perspectiveUserId)

    state.animationsForReplay.push({
        animation: null,
        marker,
        stateBefore: getStateBefore(state, state.animationsForReplay),
        stateAfter,
    })
}
