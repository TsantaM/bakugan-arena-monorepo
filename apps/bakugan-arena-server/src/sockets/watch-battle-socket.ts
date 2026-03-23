import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";

type RoomsToWatchType = {
    roomId: string,
    p1: string,
    p2: string
}

function GetRoomsToWatch(userId: string): RoomsToWatchType[] {

    const rooms = Battle_Brawlers_Game_State.filter((room) => room !== undefined).filter((room) => !room.players.some((player) => player.userId === userId)).filter((room) => !room.status.finished).map((room) => ({
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