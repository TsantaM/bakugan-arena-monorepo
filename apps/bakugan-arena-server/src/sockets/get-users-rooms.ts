import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";

export const getUsersRooms = (io: Server, socket: Socket) => {
    socket.on('get-rooms-user-id', (userId: string) => {
        const rooms = GetUsersRooms(userId)

        socket.emit('get-rooms-user-id', rooms)
    })
}