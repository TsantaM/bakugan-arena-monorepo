import { Server } from "socket.io";
import { removeToWaitingList, setupSearchOpponentSocket } from "./sockets/search-opponent";



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

    socket.on('disconnect', (reason) => {
        console.log('A user disconnected:', 'socketId : ', socket.id, 'userId : ', userId, reason);
        removeToWaitingList({ userId: userId })
    })

});


io.listen(PORT)

console.log("Server is running on PORT: ", PORT);