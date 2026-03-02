import type { AnimationDirectivesTypes, stateType } from "@bakugan-arena/game-data";
import { Server } from "socket.io/dist";

export function EmitMessage({ roomState, animation, io }: { roomState: stateType, animation: AnimationDirectivesTypes, io: Server }) {
    const messages = animation.message

    if (!roomState) return
    if (!messages) return

    const sockets = roomState.connectedsUsers

    messages.forEach((message) => {
        roomState.messages.push(message)
        sockets.forEach((s) => {
            console.log('parent-socket', s.nextjsSocket)
            io.to(s.nextjsSocket).emit('game-messages', message)
        })
    })

}

export function SendAllMessages({ roomState, io, socketNext }: { roomState: stateType, io: Server, socketNext: string }) {

    if (!roomState) return
    const messages = roomState.messages
    const sockets = roomState.connectedsUsers
    console.log('parent socket', socketNext)
    if (messages.length > 0) {
        sockets.forEach((s) => io.to(socketNext).emit('init-game-messages', messages))
    }

}