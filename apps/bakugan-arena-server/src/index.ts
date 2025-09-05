import { Server } from "socket.io";
import { removeToWaitingList, setupSearchOpponentSocket } from "./sockets/search-opponent";
import { socketGetRoomState } from "./sockets/get-room-data";
import { socketTurn } from "./sockets/turn-action";
import { socketUpdateGateState } from "./sockets/update-gate-state";
import { socketUpdateBakuganState } from "./sockets/update-bakugans-state";



const PORT = 3005;
const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId

    console.log('A user connected:', 'socketId : ', socket.id, 'userId : ', userId );
    setupSearchOpponentSocket(io, socket)
    socketGetRoomState(io, socket)
    socketUpdateGateState(io, socket)
    socketUpdateBakuganState(io, socket)
    socketTurn(io, socket)

    socket.on('disconnect', (reason) => {
        console.log('A user disconnected:', 'socketId : ', socket.id, 'userId : ', userId, reason);
        removeToWaitingList({ userId: userId })
    })

});


io.listen(PORT)

console.log("Server is running on PORT: ", PORT);