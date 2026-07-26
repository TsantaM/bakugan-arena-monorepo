/**
 * Registre O(1) des rooms de combat.
 *
 * Historiquement l’état vivait uniquement dans `Battle_Brawlers_Game_State` (tableau),
 * ce qui forçait un `find`/`findIndex` à chaque event socket. Ce module maintient
 * une Map synchronisée pour les lookups chauds, tout en gardant le tableau pour
 * les itérations (cleanup, watch-battle, etc.).
 *
 * Toujours passer par `registerRoom` / `removeRoom` plutôt que `push`/`splice` directs.
 */
import type { stateType } from "@bakugan-arena/game-data"
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

/** Index roomId → état courant (même référence que dans le tableau). */
const roomsById = new Map<string, stateType>()

/**
 * Enregistre une room nouvellement créée.
 * Idempotent si la même référence est déjà présente.
 */
export function registerRoom(state: stateType): stateType {
    roomsById.set(state.roomId, state)

    const alreadyInArray = Battle_Brawlers_Game_State.some(
        (room) => room?.roomId === state.roomId,
    )
    if (!alreadyInArray) {
        Battle_Brawlers_Game_State.push(state)
    }

    return state
}

/**
 * Lookup O(1) avec fallback sur le tableau (rooms créées avant migration).
 */
export function getRoom(roomId: string): stateType | undefined {
    const cached = roomsById.get(roomId)
    if (cached) return cached

    const found = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
    if (found) {
        roomsById.set(roomId, found)
    }
    return found
}

/** Retire une room du registre et du tableau. */
export function removeRoom(roomId: string): boolean {
    roomsById.delete(roomId)
    const index = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)
    if (index === -1) return false
    Battle_Brawlers_Game_State.splice(index, 1)
    return true
}

/** Rebuild l’index Map depuis le tableau (après cleanup partiel). */
export function reindexRooms(): void {
    roomsById.clear()
    for (const room of Battle_Brawlers_Game_State) {
        if (room?.roomId) {
            roomsById.set(room.roomId, room)
        }
    }
}

export function listRooms(): stateType[] {
    return Battle_Brawlers_Game_State.filter((room): room is stateType => room != null)
}
