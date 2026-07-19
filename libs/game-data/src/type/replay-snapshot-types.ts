import type { AnimationDirectivesTypes, Message } from "./animations-directives.js"
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
    stateBefore: replaySnapshotType
    stateAfter: replaySnapshotType
}
