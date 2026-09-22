import type { replayEntryType, replaySnapshotType, stateType } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../../game-state/battle-brawlers-game-state"
import { REPLAY_ENABLED } from "../../lib/replay-flag"

export type RoomReplayPayload = {
    roomId: string
    replay: replayEntryType[]
    initialSnapshot: replaySnapshotType
}

export class ReplayDisabledError extends Error {
    constructor() {
        super("Replay feature is disabled")
        this.name = "ReplayDisabledError"
    }
}

export class RoomReplayNotFoundError extends Error {
    constructor(roomId: string) {
        super(`Replay unavailable for room ${roomId}`)
        this.name = "RoomReplayNotFoundError"
    }
}

export class RoomReplayForbiddenError extends Error {
    constructor() {
        super("Only room players can fetch the replay")
        this.name = "RoomReplayForbiddenError"
    }
}

export class RoomReplayNotFinishedError extends Error {
    constructor(roomId: string) {
        super(`Room ${roomId} is not finished`)
        this.name = "RoomReplayNotFinishedError"
    }
}

function getRoomState(roomId: string): stateType | undefined {
    return Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
}

export function getRoomReplayFromState({
    roomId,
    userId,
}: {
    roomId: string
    userId: string
}): RoomReplayPayload {
    if (!REPLAY_ENABLED) {
        throw new ReplayDisabledError()
    }

    const roomState = getRoomState(roomId)

    if (!roomState) {
        throw new RoomReplayNotFoundError(roomId)
    }

    const isPlayer = roomState.players.some((player) => player.userId === userId)
    if (!isPlayer) {
        throw new RoomReplayForbiddenError()
    }

    if (!roomState.status.finished) {
        throw new RoomReplayNotFinishedError(roomId)
    }

    const { animationsForReplay, initialReplaySnapshot } = roomState
    if (animationsForReplay.length === 0 || !initialReplaySnapshot) {
        throw new RoomReplayNotFoundError(roomId)
    }

    return {
        roomId,
        replay: animationsForReplay,
        initialSnapshot: initialReplaySnapshot,
    }
}
