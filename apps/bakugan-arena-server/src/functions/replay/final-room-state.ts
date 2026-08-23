import type { stateType } from "@bakugan-arena/game-data"
import { Server } from "socket.io"

export type FinalRoomStatePayload = {
    p1: string
    p2: string
    roomId: string
    finished: boolean
    replayAvailable: boolean
}

export function buildFinalRoomStatePayload(roomState: stateType): FinalRoomStatePayload {
    return {
        roomId: roomState.roomId,
        p1: roomState.players[0]?.userId ?? "",
        p2: roomState.players[1]?.userId ?? "",
        finished: roomState.status.finished,
        replayAvailable: roomState.animationsForReplay.length > 0,
    }
}

export function emitFinalRoomState(roomState: stateType, io: Server): void {
    const payload = buildFinalRoomStatePayload(roomState)

    roomState.connectedsUsers.forEach((player) => {
        io.to(player.nextjsSocket).emit("final-room-state", payload)
    })
}
