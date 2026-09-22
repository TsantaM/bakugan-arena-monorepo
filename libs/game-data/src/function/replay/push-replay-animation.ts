import type { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import type {
    replayEntryType,
    replayMarkerType,
    replaySnapshotType,
} from "../../type/replay-snapshot-types.js"
import type { stateType } from "../../type/type-index.js"
import { captureReplaySnapshot, readReplaySnapshotView } from "./capture-replay-snapshot.js"
import { isReplayEnabled } from "./replay-config.js"
import { applyReplayPatch, diffReplayValue } from "./replay-patch.js"

/**
 * Une entrée sur `REPLAY_KEYFRAME_INTERVAL` embarque un snapshot complet.
 * Les autres ne stockent qu'un delta : cela borne le coût de reconstruction
 * lors d'un seek tout en gardant le replay léger.
 */
export const REPLAY_KEYFRAME_INTERVAL = 200

/**
 * Dernier snapshot enregistré par room, gardé hors de `stateType` pour ne pas
 * être sérialisé (socket, DB, clones du bot). WeakMap : libéré avec la room.
 */
const recorderBaselines = new WeakMap<stateType, replaySnapshotType>()

function getPerspectiveUserId(state: stateType): string {
    return state.players[0]?.userId ?? ""
}

/**
 * Construit l'entrée de replay : keyframe si aucune base n'est disponible ou si
 * l'intervalle est atteint, sinon simple delta par rapport à la base courante.
 */
function buildEntry(state: stateType): Pick<replayEntryType, "stateAfter" | "patch"> {
    const perspectiveUserId = getPerspectiveUserId(state)
    const baseline = recorderBaselines.get(state)
    const isKeyframe =
        !baseline || state.animationsForReplay.length % REPLAY_KEYFRAME_INTERVAL === 0

    if (isKeyframe) {
        const snapshot = captureReplaySnapshot(state, perspectiveUserId)
        // La baseline est mutée en place par les deltas suivants : elle ne doit
        // jamais partager de références avec le snapshot stocké dans l'entrée.
        recorderBaselines.set(state, structuredClone(snapshot))
        return { stateAfter: snapshot }
    }

    const patch = diffReplayValue(baseline, readReplaySnapshotView(state, perspectiveUserId))
    if (patch) applyReplayPatch(baseline, patch)

    return patch ? { patch } : {}
}

export function pushReplayAnimation(
    state: stateType,
    animation: AnimationDirectivesTypes
): void {
    if (!isReplayEnabled()) return

    state.animationsForReplay.push({
        // Clone so later mutations of live slot.state (e.g. open=true) cannot rewrite past events
        animation: structuredClone(animation),
        ...buildEntry(state),
    })
}

export function pushReplayMarker(
    state: stateType,
    marker: replayMarkerType
): void {
    if (!isReplayEnabled()) return

    state.animationsForReplay.push({
        animation: null,
        marker,
        ...buildEntry(state),
    })
}
