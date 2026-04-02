import { ReceiveMessageSocketType, SendMessageSocketType } from "@bakugan-arena/game-data/dist";
import { Server, Socket } from "socket.io/dist";
import { connectedUsers } from "../game-state/battle-brawlers-game-state";

export function ChatMessageSocket(io: Server, socket: Socket) {

    socket.on('chat-message', ({ targetId, message, senderId, targetName }: SendMessageSocketType) => {

        const target = connectedUsers.find((user) => user.userId === targetId)?.socketId
        const sender = connectedUsers.find((user) => user.userId === senderId)?.socketId

        const receive: ReceiveMessageSocketType = {
            message: message,
            targetId: targetId,
            targetName: targetName
        }

        if(target) {
            io.to(target).emit('receive-message', receive)
        }

        if(sender) {
            io.to(sender).emit('receive-message', receive)
        }

    })

}