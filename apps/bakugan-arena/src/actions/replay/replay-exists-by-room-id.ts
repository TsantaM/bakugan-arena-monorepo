'use server'

import { db } from "@/src/lib/db"

export async function ReplayExistsByRoomId(roomId: string): Promise<boolean> {
    if (!roomId) return false

    const existing = await db.query.replay.findFirst({
        where: (replay, { eq }) => eq(replay.roomId, roomId),
        columns: { id: true },
    })

    return Boolean(existing)
}
