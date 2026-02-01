process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION", reason)
})

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err)
})


import { Server } from "socket.io";
import { removeToWaitingList, setupSearchOpponentSocket } from "./sockets/search-opponent.js";
import { socketGetRoomState, socketInitiRoomState } from "./sockets/get-room-data.js";
import { socketTurn } from "./sockets/turn-action.js";
import { socketUpdateGateState } from "./sockets/update-gate-state.js";
import { socketUpdateBakuganState } from "./sockets/update-bakugans-state.js";
import { socketActiveGateCard } from "./sockets/active-gate-card-socket.js";
import { socketUseAbilityCard } from "./sockets/use-ability-card-socket.js";
import { socketCleanAnimations } from "./sockets/clear-animations-socket.js";
import { AbilitiesAdditionalEffectsSocket } from "./sockets/abilities-additional-effect-socket.js";
import { addOrUpdateConnectedUser, addRoomSocket, removeConnectedUserBySocket, removeRoomSocket } from "./functions/connected-users-management.js";
import { ChalengeAcceptSocket, ChalengeSomeoneSocket } from "./sockets/chalenge-someone-socket.js";
import { getUsersRooms } from "./sockets/get-users-rooms.js";
import { CheckActivitiesSocket } from "./sockets/check-activities-socket.js";
import { CancelOpponentResearch } from "./sockets/cancel-opponent-research.js";



const PORT = Number(process.env.PORT) || 3005
const io = new Server({
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN?.split(",") ?? "*",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    const { userId, roomId, socketType } = socket.handshake.auth
    console.log('A user connected:', 'socketId : ', socket.id, 'userId : ', userId);
    if (!roomId && (!socketType || socketType === 'game')) {
        addOrUpdateConnectedUser(userId, socket.id);
    } else {

    }

    getUsersRooms(io, socket),
    ChalengeSomeoneSocket(io, socket),
    ChalengeAcceptSocket(io, socket),
    setupSearchOpponentSocket(io, socket)
    CancelOpponentResearch(io, socket)
    socketGetRoomState(io, socket)
    socketCleanAnimations(io, socket)
    CheckActivitiesSocket(io, socket)
    socketInitiRoomState(io, socket)
    socketUpdateGateState(io, socket)
    socketUpdateBakuganState(io, socket)
    socketUseAbilityCard(io, socket)
    AbilitiesAdditionalEffectsSocket(io, socket)
    socketActiveGateCard(io, socket)
    socketTurn(io, socket)

    socket.on('disconnect', (reason) => {
        console.log('A user disconnected:', 'socketId : ', socket.id, 'userId : ', userId, reason);
        removeToWaitingList({ userId: userId })
        removeConnectedUserBySocket(socket.id);
        addRoomSocket(userId, socket.id, roomId)
        removeRoomSocket(socket.id, userId)
    })

});


io.listen(PORT)

console.log("Server is running on PORT: ", PORT);