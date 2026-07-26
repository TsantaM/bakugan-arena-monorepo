import { Server, Socket } from "socket.io";
import { listRooms } from "../functions/room-registry";

type RoomsToWatchType = {
    playersIds: string[]
    roomId: string,
    p1: string,
    p2: string
}

function GetRoomsToWatch(userId: string): RoomsToWatchType[] {

    const rooms = listRooms().filter((room) => !room.players.some((player) => player.userId === userId)).filter((room) => !room.status.finished).map((room) => ({
        playersIds: room.players.map((p) => p.userId) ,
        p1: room.players[0].username,
        p2: room.players[1].username,
        roomId: room.roomId
    }))

    return rooms
}

export function WatchBattleSocket(io: Server, socket: Socket) {
    socket.on('get-battle-to-watch', (userId: string) => {
        const rooms = GetRoomsToWatch(userId)
        socket.emit('battle-to-watch', rooms)
    })
}