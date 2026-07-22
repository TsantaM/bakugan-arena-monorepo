import { schema } from "@bakugan-arena/drizzle-orm"
import { computeDecayedElo } from "@bakugan-arena/game-data"
import { and, desc, eq } from "drizzle-orm"
import { db } from "../../lib/db"

const { rooms, user } = schema

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

export async function getLastRankedGameDate(userId: string): Promise<Date | null> {
    const room = await db.query.rooms.findFirst({
        where: (r, { and, eq, or }) =>
            and(
                eq(r.ranked, true),
                eq(r.finished, true),
                or(eq(r.player1Id, userId), eq(r.player2Id, userId))
            ),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        columns: { createdAt: true },
    })

    return room?.createdAt ?? null
}

export async function applyEloDecayForUser(userId: string, storedElo: number): Promise<number> {
    const lastRankedAt = await getLastRankedGameDate(userId)
    const decayedElo = computeDecayedElo(storedElo, lastRankedAt)

    if (decayedElo !== storedElo) {
        await db.update(user).set({ elo: decayedElo }).where(eq(user.id, userId))
    }

    return decayedElo
}

export async function applyEloDecayToAllUsers(): Promise<void> {
    const usersAboveMin = await db.query.user.findMany({
        where: (u, { gt }) => gt(u.elo, 1000),
        columns: { id: true, elo: true },
    })

    if (usersAboveMin.length === 0) return

    const lastRankedByUserId = await getLastRankedGameDatesByUserId()

    for (const { id, elo } of usersAboveMin) {
        const lastRankedAt = lastRankedByUserId.get(id) ?? null
        const decayedElo = computeDecayedElo(elo, lastRankedAt)

        if (decayedElo !== elo) {
            await db.update(user).set({ elo: decayedElo }).where(eq(user.id, id))
        }
    }
}
