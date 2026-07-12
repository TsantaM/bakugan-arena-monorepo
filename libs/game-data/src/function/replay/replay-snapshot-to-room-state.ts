import type { replaySnapshotType } from "../../type/replay-snapshot-types.js"
import type { roomStateType } from "../../type/room-types.js"

export function replaySnapshotToRoomState(
    snapshot: replaySnapshotType
): roomStateType {
    return {
        turnState: structuredClone(snapshot.turnState),
        deck: structuredClone(snapshot.decksState),
        portalSlots: structuredClone(snapshot.portalSlots),
        battleState: structuredClone(snapshot.battleState),
        timers: structuredClone(snapshot.timers),
        eliminated: structuredClone(snapshot.eliminated),
        finished: snapshot.finished,
    }
}
