import { Server, Socket } from "socket.io/dist";
import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state";
import { schema } from "@bakugan-arena/drizzle-orm";
import { CalculateAndUpdateElo } from "../functions/ladder-functions/calculate-elo";
import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { forfeitSocketProps } from "@bakugan-arena/game-data";
import { SendUserRooms } from "../functions/send-user-rooms";
import { StopPlayerTimer } from "../functions/start-player-timer";

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
        players.forEach((player) => StopPlayerTimer({roomState: roomData, userId: player.userId}))
        roomData.status.finished = true
        roomData.status.winner = winner.userId


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