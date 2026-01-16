import { Server, Socket } from "socket.io/dist";
import { removeToWaitingList } from "./search-opponent";

export function CancelOpponentResearch(io: Server, socket: Socket) {
    socket.on('cancel-search-opponent', ({ userId }: { userId: string }) => {
        removeToWaitingList({ userId: userId })
        socket.emit('search-cancelled')
    })
}