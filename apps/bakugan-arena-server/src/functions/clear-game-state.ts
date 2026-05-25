import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

const MAX_ROOM_AGE = 30 * 60 * 1000 // 30 min
const FINISHED_ROOM_LIFETIME = 5 * 60 * 1000 // 5 min après fin

export function cleanGameStates() {
    const now = Date.now()

    let initialLength = Battle_Brawlers_Game_State.length

    for (let i = Battle_Brawlers_Game_State.length - 1; i >= 0; i--) {
        const room = Battle_Brawlers_Game_State[i]

        const isTooOld =
            now - room.createdAt > MAX_ROOM_AGE

        const isFinishedTooLong =
            room.status.finished && 
            room.status.finisheAt !== null &&
            now - room.status.finisheAt > FINISHED_ROOM_LIFETIME

        if (isTooOld || isFinishedTooLong) {
            Battle_Brawlers_Game_State.splice(i, 1)
        }
    }

    const removed = initialLength - Battle_Brawlers_Game_State.length

    if (removed > 0) {
        console.log(`[CLEANUP] Removed ${removed} rooms`)
    }
}