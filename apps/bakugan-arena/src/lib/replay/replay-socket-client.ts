import type { replayEntryType, replaySnapshotType } from "@bakugan-arena/game-data"
import type { Socket } from "socket.io-client"

export type RoomReplayPayload = {
    roomId: string
    replay: replayEntryType[]
    initialSnapshot: replaySnapshotType
}

type RoomReplayErrorPayload = {
    roomId: string
    error: string
    code?: string
}

export function fetchRoomReplayViaSocket(
    socket: Socket,
    {
        roomId,
        userId,
    }: {
        roomId: string
        userId: string
    },
): Promise<RoomReplayPayload> {
    return new Promise((resolve, reject) => {
        const onData = (payload: RoomReplayPayload) => {
            if (payload.roomId !== roomId) return
            cleanup()
            resolve(payload)
        }

        const onError = (payload: RoomReplayErrorPayload) => {
            if (payload.roomId !== roomId) return
            cleanup()
            reject(new Error(payload.error))
        }

        const cleanup = () => {
            socket.off("room-replay-data", onData)
            socket.off("room-replay-error", onError)
        }

        socket.on("room-replay-data", onData)
        socket.on("room-replay-error", onError)
        socket.emit("fetch-room-replay", { roomId, userId })
    })
}
