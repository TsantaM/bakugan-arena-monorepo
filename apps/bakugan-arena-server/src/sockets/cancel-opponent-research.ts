import { assertActor } from "./assert-actor"
import { Server, Socket } from "socket.io";
import { removeFromQueue } from "./search-opponent";

export function CancelOpponentResearch(io: Server, socket: Socket) {
    socket.on('cancel-search-opponent', ({ userId }: { userId: string }) => {
        if (!assertActor(socket, userId, 'cancel-search-opponent')) return

        removeFromQueue(userId)
        socket.emit('search-cancelled')
    })
}