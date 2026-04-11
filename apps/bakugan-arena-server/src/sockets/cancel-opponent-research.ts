import { Server, Socket } from "socket.io/dist";
import { removeFromQueue } from "./search-opponent";

export function CancelOpponentResearch(io: Server, socket: Socket) {
    socket.on('cancel-search-opponent', ({ userId }: { userId: string }) => {
        removeFromQueue(userId)
        socket.emit('search-cancelled')
    })
}