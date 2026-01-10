import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function createSocket(userId: string, roomId: string) {
  if (socket) return socket // ⛔ jamais 2 sockets

  socket = io("http://localhost:3005", {
    auth: { userId, roomId, socketType: 'game' }
  })

  socket.on("connect", () => {
    console.log("🟢 SOCKET CONNECTED:", socket?.id)
  })

  socket.on("disconnect", reason => {
    console.log("🔴 SOCKET DISCONNECTED:", reason)
  })

  return socket
}
