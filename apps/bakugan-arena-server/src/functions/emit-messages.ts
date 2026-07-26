import type { AnimationDirectivesTypes, stateType } from "@bakugan-arena/game-data";
import { Server } from "socket.io";

/**
 * Diffuse les messages d’animation vers les parents Next.js (nextjsSocket).
 * Ignore les sockets vides (reconnect partiel) pour éviter les emits fantômes.
 */
export function EmitMessage({
    roomState,
    animation,
    io,
}: {
    roomState: stateType
    animation: AnimationDirectivesTypes
    io: Server
}) {
    const messages = animation.message

    if (!roomState) return
    if (!messages) return

    const connectedUsersSockets = roomState.connectedsUsers
    const spectatorsSockets = roomState.spectators

    messages.forEach((message) => {
        roomState.messages.push(message)
        connectedUsersSockets.forEach((s) => {
            if (!s.nextjsSocket) return
            io.to(s.nextjsSocket).emit('game-messages', message)
        })
        spectatorsSockets.forEach((s) => {
            if (!s.nextjsSocket) return
            io.to(s.nextjsSocket).emit('game-messages', message)
        })
    })
}

export function SendAllMessages({
    roomState,
    io,
    socketNext,
}: {
    roomState: stateType
    io: Server
    socketNext: string
}) {
    if (!roomState) return
    if (!socketNext) return

    const messages = roomState.messages
    if (messages.length > 0) {
        io.to(socketNext).emit('init-game-messages', messages)
    }
}
