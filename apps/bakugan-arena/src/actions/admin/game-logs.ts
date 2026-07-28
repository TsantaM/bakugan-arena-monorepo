'use server'

import { db } from "@/src/lib/db"
import { requireAdmin } from "../getUserSession"
import { schema } from "@bakugan-arena/drizzle-orm"
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm"

const { rooms, gameTurnLog, user } = schema

export type GameLogRoomResult = {
    id: string
    player1Id: string
    player2Id: string
    player1Name: string | null
    player2Name: string | null
    finished: boolean
    ranked: boolean
    winner: string | null
    createdAt: Date
    turnLogCount: number
}

export async function searchGameLogRooms(input?: {
    roomId?: string
    playerQuery?: string
    finished?: boolean | null
    limit?: number
}): Promise<GameLogRoomResult[]> {
    await requireAdmin()

    const limit = input?.limit ?? 50
    const conditions = []

    if (input?.roomId?.trim()) {
        conditions.push(eq(rooms.id, input.roomId.trim()))
    }

    if (input?.finished !== null && input?.finished !== undefined) {
        conditions.push(eq(rooms.finished, input.finished))
    }

    if (input?.playerQuery?.trim()) {
        const query = `%${input.playerQuery.trim()}%`
        const matchingUsers = await db.query.user.findMany({
            where: or(
                ilike(user.displayUsername, query),
                ilike(user.username, query),
                ilike(user.name, query),
            ),
            columns: { id: true },
        })

        const userIds = matchingUsers.map((row) => row.id)
        if (userIds.length === 0) return []

        conditions.push(
            or(
                inArray(rooms.player1Id, userIds),
                inArray(rooms.player2Id, userIds),
            ),
        )
    }

    const roomRows = await db.query.rooms.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(rooms.createdAt)],
        limit,
    })

    if (roomRows.length === 0) return []

    const roomIds = roomRows.map((room) => room.id)
    const playerIds = [...new Set(roomRows.flatMap((room) => [room.player1Id, room.player2Id]))]

    const [players, turnCounts] = await Promise.all([
        db.query.user.findMany({
            where: inArray(user.id, playerIds),
            columns: { id: true, displayUsername: true, username: true },
        }),
        db
            .select({
                roomId: gameTurnLog.roomId,
                count: sql<number>`count(*)::int`,
            })
            .from(gameTurnLog)
            .where(inArray(gameTurnLog.roomId, roomIds))
            .groupBy(gameTurnLog.roomId),
    ])

    const playersById = new Map(players.map((player) => [player.id, player]))
    const turnCountByRoom = new Map(turnCounts.map((row) => [row.roomId, row.count]))

    return roomRows.map((room) => {
        const player1 = playersById.get(room.player1Id)
        const player2 = playersById.get(room.player2Id)

        return {
            id: room.id,
            player1Id: room.player1Id,
            player2Id: room.player2Id,
            player1Name: player1?.displayUsername ?? player1?.username ?? null,
            player2Name: player2?.displayUsername ?? player2?.username ?? null,
            finished: room.finished,
            ranked: room.ranked,
            winner: room.winner,
            createdAt: room.createdAt,
            turnLogCount: turnCountByRoom.get(room.id) ?? 0,
        }
    })
}

export async function getGameTurnLogs(roomId: string) {
    await requireAdmin()

    const room = await db.query.rooms.findFirst({
        where: eq(rooms.id, roomId),
    })

    if (!room) return null

    const [player1, player2, turns] = await Promise.all([
        db.query.user.findFirst({
            where: eq(user.id, room.player1Id),
            columns: { id: true, displayUsername: true, username: true },
        }),
        db.query.user.findFirst({
            where: eq(user.id, room.player2Id),
            columns: { id: true, displayUsername: true, username: true },
        }),
        db.query.gameTurnLog.findMany({
            where: eq(gameTurnLog.roomId, roomId),
            orderBy: (row, { asc }) => [asc(row.turnNumber)],
        }),
    ])

    return {
        room,
        player1,
        player2,
        turns,
    }
}
