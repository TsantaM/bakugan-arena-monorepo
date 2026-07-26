import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

function emitRoomResync(activeSocket: Socket, userId: string, roomId: string) {
  const params = new URLSearchParams(window.location.search)
  const parentSocket = params.get('parentSocket')
  const isSpectator = window.location.pathname.includes('viewer')

  /**
   * Réécrit `gameboardSocket` côté serveur après une reconnexion réseau.
   * Sans ça, les turn-action-request ciblent l’ancien socket.id → UI figée.
   */
  activeSocket.emit('get-room-state', {
    roomId,
    userId,
    parentSocket,
    isSpectator,
  })
}

/**
 * Socket gameboard unique par onglet.
 * Resync uniquement sur reconnect (le premier `init-room-state` reste dans main/viewer).
 */
export function createSocket(userId: string, roomId: string) {
  if (socket) return socket // ⛔ jamais 2 sockets

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3005", {
    auth: { userId, roomId, socketType: 'game' }
  })

  socket.io.on("reconnect", () => {
    if (!socket) return
    emitRoomResync(socket, userId, roomId)
  })

  socket.on("disconnect", reason => {
    console.error(reason)
  })

  return socket
}
