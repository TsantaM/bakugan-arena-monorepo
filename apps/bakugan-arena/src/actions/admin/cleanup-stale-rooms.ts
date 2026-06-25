'use server'

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { and, eq, lt } from "drizzle-orm"
import { requireAdmin } from "../getUserSession"
import { MAX_ROOM_AGE_MS } from "./constants"

const rooms = schema.rooms

export async function cleanupStaleRooms() {
    await requireAdmin()

    const cutoff = new Date(Date.now() - MAX_ROOM_AGE_MS)

    const deleted = await db
        .delete(rooms)
        .where(
            and(
                eq(rooms.finished, false),
                lt(rooms.createdAt, cutoff)
            )
        )
        .returning({ id: rooms.id })

    return { deletedCount: deleted.length }
}
