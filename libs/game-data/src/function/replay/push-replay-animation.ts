import type { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import type { replayMarkerType } from "../../type/replay-snapshot-types.js"
import type { stateType } from "../../type/type-index.js"
import { captureReplaySnapshot } from "./capture-replay-snapshot.js"

function getPerspectiveUserId(state: stateType): string {
    return state.players[0]?.userId ?? ""
}

export function pushReplayAnimation(
    state: stateType,
    animation: AnimationDirectivesTypes
): void {
    const perspectiveUserId = getPerspectiveUserId(state)
    const stateAfter = captureReplaySnapshot(state, perspectiveUserId)

    state.animationsForReplay.push({
        // Clone so later mutations of live slot.state (e.g. open=true) cannot rewrite past events
        animation: structuredClone(animation),
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
        stateAfter,
    })
}
