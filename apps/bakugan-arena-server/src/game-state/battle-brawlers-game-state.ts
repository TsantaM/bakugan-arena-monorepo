/**
 * État global en mémoire du serveur de combat.
 *
 * - `Battle_Brawlers_Game_State` : liste des rooms (itérations cleanup / spectate).
 * - Pour les lookups par roomId, préférer `getRoom()` / `registerRoom()`
 *   (`functions/room-registry.ts`) qui maintiennent une Map O(1) synchronisée.
 * - Les mutations d’une room doivent passer par `enqueueRoomTask` /
 *   `runRoomSocketAction` (`functions/room-runtime.ts`) pour éviter les courses.
 */
import { stateType } from "@bakugan-arena/game-data";

export const Battle_Brawlers_Game_State: stateType[] = []
export const connectedUsers: {userId: string, socketId: string}[] = []
export const chalenges: {
    chalenger: {
        userId: string,
        deckId: string,
        userSocket: string
    },
    target: {
        userId: string,
        userSocket: string,
        deckId: string
    }
}[] = []

export const roomsSockets: {
    userId: string,
    socketId: string,
    roomId: string
}[] = []


export const intervalIds: {
    roomId: string
    finishing: boolean
    players: {
        userId: string
        timeoutId: NodeJS.Timeout | null
        deadlineAt: number | null
    }[]
}[] = []
