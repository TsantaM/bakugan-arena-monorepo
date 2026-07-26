import { Server, Socket } from "socket.io";
import { schema } from "@bakugan-arena/drizzle-orm";
import { CalculateAndUpdateElo } from "../functions/ladder-functions/calculate-elo";
import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { forfeitSocketProps } from "@bakugan-arena/game-data";
import { SendUserRooms } from "../functions/send-user-rooms";
import { stopAllRoomClocks } from "../functions/start-player-timer";
import { runRoomSocketAction } from "../functions/room-runtime";

export function forfeitSocket(io: Server, socket: Socket) {
    const rooms = schema.rooms

    socket.on('forfait', (payload: forfeitSocketProps & { actionSeq?: number | string }) => {
        const { roomId, userId, actionSeq } = payload

        runRoomSocketAction({
            socket,
            roomId,
            event: 'forfait',
            actionSeq,
            userId,
            handler: (roomData) => {
                if (roomData.status.finished) return
                const players = roomData.players
                if (!players.some((player) => player.userId === userId)) return

                const loser = players.find((p) => p.userId === userId)
                const winner = players.find((p) => p.userId !== userId)
                if (!winner || !loser) return

                stopAllRoomClocks({ roomState: roomData, io })
                roomData.status.finished = true
                roomData.status.finisheAt = Date.now()
                roomData.status.winner = winner.userId

                // DB + Elo hors chemin critique socket
                void (async () => {
                    try {
                        await db
                            .update(rooms)
                            .set({
                                winner: winner.userId,
                                looser: loser.userId,
                                finished: true,
                            })
                            .where(eq(rooms.id, roomId))

                        await CalculateAndUpdateElo({
                            loser: loser.userId,
                            winner: winner.userId,
                            roomData: roomData,
                            io: io,
                            roomId: roomId,
                            forfeit: true,
                        })
                        SendUserRooms({ userId: winner.userId, io: io })
                        SendUserRooms({ userId: loser.userId, io: io })
                    } catch (error) {
                        console.error(`[forfait ${roomId}]`, error)
                    }
                })()
            },
        })
    })
}
