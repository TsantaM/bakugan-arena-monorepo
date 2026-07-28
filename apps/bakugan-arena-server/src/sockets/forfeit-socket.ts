import { Server, Socket } from "socket.io";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { schema } from "@bakugan-arena/drizzle-orm";
import { CalculateAndUpdateElo } from "../functions/ladder-functions/calculate-elo";
import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { forfeitSocketProps, logGameEvent } from "@bakugan-arena/game-data";
import { SendUserRooms } from "../functions/send-user-rooms";
import { stopAllRoomClocks } from "../functions/start-player-timer";
import { persistAllGameLogs } from "../functions/flush-turn-log";

export function forfeitSocket(io: Server, socket: Socket) {
    const rooms = schema.rooms

    async function onForfait({ roomId, userId }: forfeitSocketProps) {
        const roomData = Battle_Brawlers_Game_State.find((room) => room?.roomId === roomId)
        if (!roomData) return
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

        logGameEvent(roomData, {
            handler: "forfait",
            category: "socket",
            input: { roomId, userId, loserId: loser.userId, winnerId: winner.userId },
            message: "Forfait — fin de partie",
        })

        await persistAllGameLogs(roomData)

        await db
            .update(rooms)
            .set({
                winner: winner.userId,
                looser: loser.userId,
                finished: true,
            })
            .where(eq(rooms.id, roomId))

        await CalculateAndUpdateElo({ loser: loser.userId, winner: winner.userId, roomData: roomData, io: io, roomId: roomId, forfeit: true })
        SendUserRooms({ userId: winner.userId, io: io })
        SendUserRooms({ userId: loser.userId, io: io })
    }


    socket.on('forfait', onForfait)

}