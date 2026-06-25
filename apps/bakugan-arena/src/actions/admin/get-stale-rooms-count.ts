'use server'

import { db } from "@/src/lib/db"
import { requireAdmin } from "../getUserSession"
import { MAX_ROOM_AGE_MS } from "./constants"

export async function getStaleRoomsCount() {
    await requireAdmin()

    const cutoff = new Date(Date.now() - MAX_ROOM_AGE_MS)

    const stale = await db.query.rooms.findMany({
        where: (r, { and, eq, lt }) =>
            and(eq(r.finished, false), lt(r.createdAt, cutoff)),
        columns: { id: true },
    })

    return { count: stale.length }
}
