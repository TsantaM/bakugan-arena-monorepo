process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION", reason)
})

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err)
})


import { Server } from "socket.io";
import { processMatchmaking, setupSearchOpponentSocket, waitingMap } from "./sockets/search-opponent";
import { socketGetRoomState, socketInitiRoomState } from "./sockets/get-room-data";
import { socketTurn } from "./sockets/turn-action";
import { socketUpdateGateState } from "./sockets/update-gate-state";
import { socketUpdateBakuganState } from "./sockets/update-bakugans-state";
import { socketActiveGateCard } from "./sockets/active-gate-card-socket";
import { socketUseAbilityCard } from "./sockets/use-ability-card-socket";
import { socketCleanAnimations } from "./sockets/clear-animations-socket";
import { AbilitiesAdditionalEffectsSocket } from "./sockets/abilities-additional-effect-socket";
import { addOrUpdateConnectedUser, removeConnectedUserBySocket, removeRoomSocket } from "./functions/connected-users-management";
import { CancelChalengeSocket, ChalengeAcceptSocket, ChalengeSomeoneSocket, RejectChalengeSocket } from "./sockets/chalenge-someone-socket";
import { getUsersRooms } from "./sockets/get-users-rooms";
import { CheckActivitiesSocket } from "./sockets/check-activities-socket";
import { CancelOpponentResearch } from "./sockets/cancel-opponent-research";
import { WatchBattleSocket } from "./sockets/watch-battle-socket";
import { ChatMessageSocket } from "./sockets/chat-message-socket";
import { SendMessageInGame } from "./sockets/messages-in-game";
import { forfeitSocket } from "./sockets/forfeit-socket";
import { cleanGameStates } from "./functions/clear-game-state";
import { GlobalChatSocket, OnOpentUpdateMessages, RecieveMessge } from "./sockets/global-chat-socket";
import { CLEANUP_INTERVAL_GLOBAL_CHAT, cleanupOldMessages } from "./game-state/global-chat-store";
import { GateCardAdditionalEffectSocket } from "./sockets/gate-card-additional-effect-socket";



const PORT = Number(process.env.PORT) || 3005
const io = new Server({
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN?.split(",") ?? "*",
        methods: ["GET", "POST"]
    }
});

// 🔥 MATCHMAKING LOOP GLOBAL
setInterval(() => {
    processMatchmaking(io)
}, 1000)

setInterval(() => {
    cleanGameStates()
}, 60000)

setInterval(() => {
    cleanupOldMessages()
}, CLEANUP_INTERVAL_GLOBAL_CHAT)

io.on('connection', (socket) => {
    const { userId, roomId, socketType } = socket.handshake.auth
    console.log('A user connected:', 'socketId : ', socket.id, 'userId : ', userId);
    if (!roomId && (!socketType || socketType === 'game')) {
        addOrUpdateConnectedUser(userId, socket.id, io);
    }

    ChatMessageSocket(io, socket)
    GlobalChatSocket(io, socket)
    RecieveMessge(io, socket)
    OnOpentUpdateMessages(io, socket)
    getUsersRooms(io, socket)
    WatchBattleSocket(io, socket)
    ChalengeSomeoneSocket(io, socket)
    ChalengeAcceptSocket(io, socket)
    CancelChalengeSocket(io, socket)
    RejectChalengeSocket(io, socket)
    setupSearchOpponentSocket(io, socket)
    CancelOpponentResearch(io, socket)
    socketGetRoomState(io, socket)
    socketCleanAnimations(io, socket)
    CheckActivitiesSocket(io, socket)
    socketInitiRoomState(io, socket)
    SendMessageInGame(io, socket)
    socketUpdateGateState(io, socket)
    socketUpdateBakuganState(io, socket)
    socketUseAbilityCard(io, socket)
    AbilitiesAdditionalEffectsSocket(io, socket)
    socketActiveGateCard(io, socket)
    GateCardAdditionalEffectSocket(io, socket)
    socketTurn(io, socket)
    forfeitSocket(io, socket)

    socket.on('disconnect', (reason) => {
        console.log('A user disconnected:', 'socketId : ', socket.id, 'userId : ', userId, reason);
        // clean auto
        for (const [userId, p] of waitingMap.entries()) {
            if (p.socketId === socket.id) {
                waitingMap.delete(userId)
            }
        }
        removeConnectedUserBySocket(socket.id, io);
        removeRoomSocket(socket.id, userId)
    })

});


io.listen(PORT)

console.log("Server is running on PORT: ", PORT);