'use server'

import {
    playerDataType,
    replayMetaType,
} from "@bakugan-arena/game-data"

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"

const replaySchema = schema.replay

type Props = {
    roomId: string
    player1: playerDataType
    player2: playerDataType
    blobUrl: string
}

// ================== ERRORS ==================
class ReplayError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ReplayError"
    }
}

class ReplayAlreadyExistsError extends ReplayError {
    constructor(roomId: string) {
        super(`Replay already exists for this roomId`)
        this.name = "ReplayAlreadyExistsError"
    }
}

class InvalidReplayDataError extends ReplayError {
    constructor() {
        super("Invalid replay data (missing player or blob URL)")
        this.name = "InvalidReplayDataError"
    }
}

// ================== FUNCTION ==================
export async function UploadReplay({
    roomId,
    player1,
    player2,
    blobUrl,
}: Props) {

    try {
        if (!roomId || !player1 || !player2 || !blobUrl) {
            throw new InvalidReplayDataError()
        }

        const existing = await db.query.replay.findFirst({
            where: (replay, { eq }) => eq(replay.roomId, roomId)
        })

        if (existing) {
            throw new ReplayAlreadyExistsError(roomId)
        }

        const replayMeta: replayMetaType = { player1, player2 }
        const title = `Bakugan-Arena-${player1.displayUsername}-VS-${player2.displayUsername}-${roomId}`

        const result = await db.insert(replaySchema)
            .values({
                roomId,
                title,
                blobUrl,
                replayMeta,
            })
            .returning()

        return result[0]

    } catch (error) {

        if (error instanceof ReplayError) {
            throw error
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: string }).code === "23505"
        ) {
            throw new ReplayAlreadyExistsError(roomId)
        }

        throw new Error("Failed to upload replay")
    }
}
