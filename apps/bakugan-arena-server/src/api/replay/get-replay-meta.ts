import { eq } from "drizzle-orm"
import type { Request, Response } from "express"
import { db } from "../../lib/db"

type ReplayParams = {
    replayId: string
}

export async function GetReplayMeta(
    req: Request<ReplayParams>,
    res: Response,
) {
    try {
        const { replayId } = req.params

        const replay = await db.query.replay.findFirst({
            where: (row) => eq(row.id, replayId),
            columns: {
                id: true,
                roomId: true,
                title: true,
                replayData: true,
            },
        })

        if (!replay?.replayData) {
            return res.status(404).json({ error: "Replay not found" })
        }

        const { player1, player2 } = replay.replayData

        if (!player1 || !player2) {
            return res.status(404).json({ error: "Replay metadata incomplete" })
        }

        return res.json({
            id: replay.id,
            roomId: replay.roomId,
            title: replay.title,
            player1,
            player2,
        })
    } catch (error) {
        console.error("Failed to fetch replay metadata", error)
        return res.status(500).json({ error: "Failed to fetch replay metadata" })
    }
}
