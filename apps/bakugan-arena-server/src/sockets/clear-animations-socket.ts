import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";

export function clearAnimationsInRoom(roomId: string) {
    // FR: On récupère les données de la salle correspondant au roomId
    // ENG: Retrieve the room data matching the given roomId
    const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)

    // FR: On récupère aussi l'index de cette salle pour des modifications directes
    // ENG: Also get the room index for direct state updates
    const roomIndex = Battle_Brawlers_Game_State.findIndex((room) => room?.roomId === roomId)

    if (!roomData) return
    if (!Battle_Brawlers_Game_State[roomIndex]) return
    Battle_Brawlers_Game_State[roomIndex].animations = []
}

export const socketCleanAnimations = (io: Server, socket: Socket) => {
    socket.on('clean-animation-table', ({ roomId }: { roomId: string, userId: string }) => {
        clearAnimationsInRoom(roomId)
    })
}