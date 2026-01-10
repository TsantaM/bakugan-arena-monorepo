import { connectedUsers, roomsSockets } from "../game-state/battle-brawlers-game-state";

export function addOrUpdateConnectedUser(userId: string, socketId: string) {
    const index = connectedUsers.findIndex(u => u.userId === userId);

    if (index !== -1) {
        // L'utilisateur existe déjà → on met à jour son socket
        connectedUsers[index].socketId = socketId;
    } else {
        // Nouvel utilisateur
        connectedUsers.push({ userId, socketId });
    }

    console.log(connectedUsers)

}

export function removeConnectedUserBySocket(socketId: string) {
    const index = connectedUsers.findIndex(u => u.socketId === socketId);

    if (index !== -1) {
        connectedUsers.splice(index, 1);
    }

    console.log(connectedUsers)
}

export function addRoomSocket(userId: string, socketId: string, roomId: string) {
    const index = roomsSockets.findIndex(u => u.userId === userId && u.roomId === roomId);

    if (index !== -1) {
        // L'utilisateur existe déjà → on met à jour son socket
        roomsSockets[index].socketId = socketId;
    } else {
        // Nouvel utilisateur
        roomsSockets.push({ userId, socketId, roomId });
    }

    console.log(roomsSockets)

}

export function removeRoomSocket(socketId: string, userId: string) {
    const index = roomsSockets.findIndex(u => u.socketId === socketId && userId === u.userId);

    if (index !== -1) {
        roomsSockets.splice(index, 1);
    }

    console.log(roomsSockets)
}