'use server'

import { db } from "@/src/lib/db"

export async function GetReplays() {

    const data = await db.query.replay.findMany({
        columns: {
            id: true,
            roomId: true,
            title: true,
            createdAt: true,
            replayData: true
        },
        orderBy: (replay, { desc }) => [desc(replay.createdAt)]
    })

    return data

}