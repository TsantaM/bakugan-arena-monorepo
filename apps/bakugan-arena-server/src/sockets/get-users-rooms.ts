import { Server, Socket } from "socket.io/dist";
import { GetUsersRooms } from "../functions/get-rooms-of-user";

export const getUsersRooms = (io: Server, socket: Socket) => {
    socket.on('get-rooms-user-id', (userId: string) => {
        const rooms = GetUsersRooms(userId)

        socket.emit('get-rooms-user-id', rooms)
    })
}