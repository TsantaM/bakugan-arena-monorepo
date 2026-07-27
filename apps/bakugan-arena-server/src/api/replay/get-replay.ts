import { normalizeReplayData } from "@bakugan-arena/game-data"
import { eq } from "drizzle-orm"
import type { Request, Response } from "express"
import { db } from "../../lib/db"

type ReplayParams = {
    replayId: string
}

export async function GetReplay(
    req: Request<ReplayParams>,
    res: Response,
) {
    try {
        const { replayId } = req.params

        const replay = await db.query.replay.findFirst({
            where: (r) => eq(r.id, replayId),
            columns: {
                id: true,
                replayData: true,
                roomId: true,
                title: true,
            },
        })

        if (!replay?.replayData) {
            return res.status(404).json({ error: "Replay not found" })
        }

        return res.json(normalizeReplayData(replay.replayData))
    } catch (error) {
        console.error("Failed to fetch replay", error)
        return res.status(500).json({ error: "Failed to fetch replay" })
    }
}
