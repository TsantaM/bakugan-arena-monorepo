import { Server, Socket } from "socket.io"
import {
    getRoomReplayFromState,
    RoomReplayForbiddenError,
    RoomReplayNotFinishedError,
    RoomReplayNotFoundError,
} from "../functions/replay/room-replay-from-state"

type FetchRoomReplayPayload = {
    roomId: string
    userId: string
}

export function fetchRoomReplaySocket(_io: Server, socket: Socket) {
    socket.on("fetch-room-replay", (payload: FetchRoomReplayPayload) => {
        const { roomId, userId } = payload

        if (!roomId || !userId) {
            socket.emit("room-replay-error", {
                roomId: roomId ?? "",
                error: "Missing roomId or userId",
                code: "INVALID_REQUEST",
            })
            return
        }

        const authUserId = socket.handshake.auth.userId as string | undefined
        if (authUserId && authUserId !== userId) {
            socket.emit("room-replay-error", {
                roomId,
                error: "User mismatch",
                code: "FORBIDDEN",
            })
            return
        }

        try {
            const replay = getRoomReplayFromState({ roomId, userId })
            socket.emit("room-replay-data", replay)
        } catch (error) {
            if (
                error instanceof RoomReplayNotFoundError ||
                error instanceof RoomReplayForbiddenError ||
                error instanceof RoomReplayNotFinishedError
            ) {
                socket.emit("room-replay-error", {
                    roomId,
                    error: error.message,
                    code: error.name,
                })
                return
            }

            console.error("[fetch-room-replay] failed", { roomId, userId, error })
            socket.emit("room-replay-error", {
                roomId,
                error: error instanceof Error ? error.message : "Failed to fetch replay",
                code: "INTERNAL_ERROR",
            })
        }
    })
}
