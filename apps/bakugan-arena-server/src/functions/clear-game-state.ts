/**
 * Cleanup des rooms expirées / terminées.
 * Utilise `removeRoom` pour garder Map + tableau + runtime (queue/version) synchronisés.
 */
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { removeRoom } from "./room-registry"
import { clearRoomRuntime } from "./room-runtime"

const MAX_ROOM_AGE = 30 * 60 * 1000 // 30 min
const FINISHED_ROOM_LIFETIME = 5 * 60 * 1000 // 5 min après fin

export function cleanGameStates() {
    const now = Date.now()
    const initialLength = Battle_Brawlers_Game_State.length
    const toRemove: string[] = []

    for (const room of Battle_Brawlers_Game_State) {
        if (!room) continue

        const isTooOld = now - room.createdAt > MAX_ROOM_AGE
        const isFinishedTooLong =
            room.status.finished &&
            room.status.finisheAt !== null &&
            now - room.status.finisheAt > FINISHED_ROOM_LIFETIME

        if (isTooOld || isFinishedTooLong) {
            toRemove.push(room.roomId)
        }
    }

    for (const roomId of toRemove) {
        removeRoom(roomId)
        clearRoomRuntime(roomId)
    }

    const removed = initialLength - Battle_Brawlers_Game_State.length
    if (removed > 0) {
        console.log(`[CLEANUP] Removed ${removed} rooms`)
    }
}
