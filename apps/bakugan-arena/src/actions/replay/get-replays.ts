'use server'

import { db } from "@/src/lib/db"

export async function GetReplays() {
    return db.query.replay.findMany({
        columns: {
            id: true,
            roomId: true,
            title: true,
            createdAt: true,
        },
        orderBy: (replay, { desc }) => [desc(replay.createdAt)],
    })
}

/** @deprecated use GetReplays */
export async function GetReplayList() {
    return GetReplays()
}
