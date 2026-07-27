import type { Request, Response } from "express"
import { normalizeReplayData } from "@bakugan-arena/game-data"
import { ReplayAlreadyExistsError, saveReplayCore, type SaveReplayInput } from "./save-replay-core"

type PostReplayBody = SaveReplayInput & {
    ifExists?: "return" | "reject"
}

export async function PostReplay(req: Request, res: Response) {
    try {
        const body = req.body as PostReplayBody

        const saved = await saveReplayCore(body, {
            ifExists: body.ifExists ?? "return",
        })

        const replayData = normalizeReplayData(buildReplayData(body))

        return res.status(saved.created ? 201 : 200).json({
            id: saved.id,
            roomId: saved.roomId,
            title: saved.title,
            player1: replayData.player1,
            player2: replayData.player2,
        })
    } catch (error) {
        if (error instanceof ReplayAlreadyExistsError) {
            return res.status(409).json({ error: error.message })
        }

        console.error("Failed to save replay", error)
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Failed to save replay",
        })
    }
}

function buildReplayData(body: SaveReplayInput) {
    return {
        roomId: body.roomId,
        player1: body.player1,
        player2: body.player2,
        initialSnapshot: body.initialSnapshot,
        replay: body.replay,
    }
}
