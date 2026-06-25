import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { and, desc, eq } from "drizzle-orm"

const { rooms } = schema

export async function getLastRankedGameDatesByUserId(): Promise<Map<string, Date>> {
    const rankedRooms = await db
        .select({
            player1Id: rooms.player1Id,
            player2Id: rooms.player2Id,
            createdAt: rooms.createdAt,
        })
        .from(rooms)
        .where(and(eq(rooms.ranked, true), eq(rooms.finished, true)))
        .orderBy(desc(rooms.createdAt))

    const lastRankedByUserId = new Map<string, Date>()

    for (const room of rankedRooms) {
        if (!lastRankedByUserId.has(room.player1Id)) {
            lastRankedByUserId.set(room.player1Id, room.createdAt)
        }
        if (!lastRankedByUserId.has(room.player2Id)) {
            lastRankedByUserId.set(room.player2Id, room.createdAt)
        }
    }

    return lastRankedByUserId
}
