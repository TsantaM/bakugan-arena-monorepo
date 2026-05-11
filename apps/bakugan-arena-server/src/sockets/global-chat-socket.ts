import { Server, Socket } from "socket.io/dist";
import { GlobalChatStore } from "../game-state/global-chat-store";
import { v4 as uuidv4 } from 'uuid';
import { GlobalChatMessage, SendedMessage } from "@bakugan-arena/game-data";

export function GetGlobalMessages(io: Server, socket: Socket) {
    socket.on('get-all-messages', () => {
        socket.emit('get-all-messages', GlobalChatStore)
    })
}

export function GlobalChatSocket(io: Server, socket: Socket) {
    socket.on('send-message-global', ({ text, username, userId }: SendedMessage) => {

        const message: GlobalChatMessage = {
            username,
            text,
            userId,
            date: new Date(),
            id: uuidv4(),
            viewers: [userId]
        };

        GlobalChatStore.push(message);

        io.emit('new-message-global', message)

    })
}


export function RecieveMessge(io: Server, socket: Socket) {
    socket.on('receive-message-response', ({ message, userId }: { message: GlobalChatMessage, userId: string }) => {
        const messageToUpdate: GlobalChatMessage | undefined = GlobalChatStore.find((m) => m.id === message.id)

        if (!messageToUpdate) return
        if (messageToUpdate.viewers.includes(userId)) return

        messageToUpdate.viewers.push(userId)

        socket.emit('get-all-messages', GlobalChatStore)
    })
}

export function OnOpentUpdateMessages(io: Server, socket: Socket) {
    socket.on('on-open-update-messages', ({messagesToUpdate, userId} : {userId: string, messagesToUpdate: GlobalChatMessage[]}) => {
        messagesToUpdate.forEach((message) => {
            const messageToUpdate: GlobalChatMessage | undefined = GlobalChatStore.find((m) => m.id === message.id)

            if (!messageToUpdate) return
            if (messageToUpdate.viewers.includes(userId)) return

            messageToUpdate.viewers.push(userId)
        })

        socket.emit('get-all-messages', GlobalChatStore)

    })
}