import { Server } from "socket.io/dist";
import { connectedUsers } from "../game-state/battle-brawlers-game-state";
import { GetUsersRooms } from "./get-rooms-of-user";

export function SendUserRooms({ userId, io }: { userId: string, io: Server }) {
    const rooms = GetUsersRooms(userId)

    const user = connectedUsers.find((u) => u.userId === userId)
    if (!user) return

    io.to(user.socketId).emit('get-rooms-user-id', rooms)
}