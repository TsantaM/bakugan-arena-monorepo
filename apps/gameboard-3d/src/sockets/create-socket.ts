import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function createSocket(userId: string, roomId: string) {
  if (socket) return socket // ⛔ jamais 2 sockets

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3005", {
    auth: { userId, roomId, socketType: 'game' }
  })

  socket.on("connect", () => {
  })

  socket.on("disconnect", reason => {

    console.error(reason)

  })

  return socket
}
