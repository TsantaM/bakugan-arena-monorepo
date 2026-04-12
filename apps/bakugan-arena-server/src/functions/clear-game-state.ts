import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

const MAX_ROOM_AGE = 30 * 60 * 1000 // 30 minutes

export function cleanGameStates() {
    const now = Date.now()

    let initialLength = Battle_Brawlers_Game_State.length

    for (let i = Battle_Brawlers_Game_State.length - 1; i >= 0; i--) {
        const room = Battle_Brawlers_Game_State[i]

        const isFinished = room.status.finished
        const isTooOld = now - room.createdAt > MAX_ROOM_AGE

        if (isFinished || isTooOld) {
            Battle_Brawlers_Game_State.splice(i, 1)
        }
    }

    const removed = initialLength - Battle_Brawlers_Game_State.length

    if (removed > 0) {
        console.log(`[CLEANUP] Removed ${removed} rooms`)
    }
}