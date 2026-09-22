import type { Socket } from "socket.io"

/**
 * Identité réelle de la socket, fixée à la connexion (`io(url, { auth: { userId } })`).
 * C'est la seule source fiable : le `userId` présent dans le payload d'un event
 * est choisi par le client.
 */
export function getSocketUserId(socket: Socket): string | undefined {
    const value = socket.handshake.auth?.userId
    return typeof value === "string" && value.length > 0 ? value : undefined
}

export function isAuthorizedActor(socket: Socket, claimedUserId: unknown): boolean {
    const authUserId = getSocketUserId(socket)
    if (!authUserId) return false
    return authUserId === claimedUserId
}

/**
 * À appeler en tout premier dans chaque handler de gameplay : refuse qu'une socket
 * agisse au nom d'un autre joueur (jouer son tour, résoudre ses choix, forfaiter…).
 */
export function assertActor(
    socket: Socket,
    claimedUserId: unknown,
    event: string,
): boolean {
    if (isAuthorizedActor(socket, claimedUserId)) return true

    console.warn("[socket] acteur refusé", {
        event,
        socketUserId: getSocketUserId(socket) ?? null,
        claimedUserId,
        socketId: socket.id,
    })

    socket.emit("action-rejected", { event, reason: "ACTOR_MISMATCH" })
    return false
}
