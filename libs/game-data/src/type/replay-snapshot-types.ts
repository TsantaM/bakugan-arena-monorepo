import type { AnimationDirectivesTypes, Message } from "./animations-directives.js"
import type { replayPatchType } from "../function/replay/replay-patch.js"
import type {
    battleState,
    deckType,
    portalSlotsType,
    turnStateType,
} from "./room-types.js"

export type replaySnapshotType = {
    turnState: turnStateType
    battleState: battleState
    portalSlots: portalSlotsType
    decksState: deckType[]
    eliminated: {
        user: number
        opponnent: number
    }
    timers: {
        userId: string
        timer: number
    }[]
    messages: Message[]
    finished: Message | undefined
}

export type replayMarkerType = "turn_end" | "turn_start"

export type replayEntryType = {
    animation: AnimationDirectivesTypes | null
    marker?: replayMarkerType
    /** @deprecated Dérivé via getReplayStateBeforeAt — conservé pour les replays existants */
    stateBefore?: replaySnapshotType
    /**
     * Snapshot complet. Présent uniquement sur les keyframes (et sur les replays
     * enregistrés avant l'encodage delta). Sinon, l'état est reconstruit à partir
     * de `patch` — voir `getReplayStateAfterAt`.
     */
    stateAfter?: replaySnapshotType
    /** Différence avec le snapshot de l'entrée précédente. */
    patch?: replayPatchType
}
