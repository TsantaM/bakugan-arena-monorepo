'use server'

import { db } from "@/src/lib/db"

export async function GetReplayById(id: string) {
    if (!id) {
        throw new Error("Replay id is required")
    }

    const row = await db.query.replay.findFirst({
        where: (replay, { eq }) => eq(replay.id, id),
        columns: {
            id: true,
            title: true,
            roomId: true,
            blobUrl: true,
            replayData: true,
            replayMeta: true,
        },
    })

    if (!row) {
        throw new Error("Replay not found")
    }

    return row
}
