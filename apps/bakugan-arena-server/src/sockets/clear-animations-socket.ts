import { Server, Socket } from "socket.io";
import { getRoom } from "../functions/room-registry";

/** Vide le buffer d’animations serveur après broadcast (le client a déjà reçu le tableau). */
export function clearAnimationsInRoom(roomId: string) {
    const roomData = getRoom(roomId)
    if (!roomData) return
    roomData.animations = []
}

export const socketCleanAnimations = (_io: Server, socket: Socket) => {
    socket.on('clean-animation-table', ({ roomId }: { roomId: string, userId: string }) => {
        clearAnimationsInRoom(roomId)
    })
}
