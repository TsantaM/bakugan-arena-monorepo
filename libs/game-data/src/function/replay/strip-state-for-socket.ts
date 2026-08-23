import type { stateType } from "../../type/room-types.js"

/** État live sans buffer replay ni logs — pour les emits Socket.IO pendant la partie. */
export type SocketLiveRoomState = Omit<
    stateType,
    "animationsForReplay" | "initialReplaySnapshot" | "gameLog"
>

export function stripStateForSocket(state: stateType): SocketLiveRoomState {
    const {
        animationsForReplay: _animationsForReplay,
        initialReplaySnapshot: _initialReplaySnapshot,
        gameLog: _gameLog,
        ...live
    } = state

    return live
}
