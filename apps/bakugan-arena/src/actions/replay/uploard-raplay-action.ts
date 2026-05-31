'use server'

import {
    AnimationDirectivesTypes,
    playerDataType,
    replayDataType
} from "@bakugan-arena/game-data"

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"

const replaySchema = schema.replay

type Props = {
    replay: AnimationDirectivesTypes[],
    roomId: string,
    player1: playerDataType,
    player2: playerDataType
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
        super("Invalid replay data (missing player or replay)")
        this.name = "InvalidReplayDataError"
    }
}

// ================== FUNCTION ==================
export async function UploadReplay({
    roomId,
    player1,
    player2,
    replay
}: Props) {

    try {
        // ---------- VALIDATION ----------
        if (!roomId || !player1 || !player2 || !replay) {
            throw new InvalidReplayDataError()
        }

        // ---------- CHECK EXISTING REPLAY ----------
        const existing = await db.query.replay.findFirst({
            where: (replay, { eq }) => eq(replay.roomId, roomId)
        })

        if (existing) {
            throw new ReplayAlreadyExistsError(roomId)
        }

        // ---------- BUILD DATA ----------
        const data: replayDataType = {
            roomId,
            player1,
            player2,
            replay
        }

        const title = `Bakugan-Arena-${player1.displayUsername}-VS-${player2.displayUsername}-${roomId}`

        // ---------- INSERT ----------
        const result = await db.insert(replaySchema)
            .values({
                replayData: data,
                roomId,
                title
            })
            .returning()

        return result[0]

    } catch (error) {

        // ---------- KNOWN ERRORS ----------
        if (error instanceof ReplayError) {
            throw error
        }

        // ---------- POSTGRES UNIQUE VIOLATION SAFETY NET ----------
        // (au cas où race condition)
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as any).code === "23505"
        ) {
            throw new ReplayAlreadyExistsError(roomId)
        }

        // ---------- UNKNOWN ERROR ----------
        throw new Error("Failed to upload replay")
    }
}