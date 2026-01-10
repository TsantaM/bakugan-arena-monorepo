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