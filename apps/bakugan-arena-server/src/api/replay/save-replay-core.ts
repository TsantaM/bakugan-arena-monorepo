import type { playerDataType, replayDataType, replayEntryType } from "@bakugan-arena/game-data"
import { eq } from "drizzle-orm"
import { db } from "../../lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"

export type SaveReplayInput = {
    roomId: string
    player1: playerDataType
    player2: playerDataType
    replay: replayEntryType[]
    initialSnapshot: replayDataType["initialSnapshot"]
}

export type SavedReplayRow = {
    id: string
    roomId: string
    title: string
    created: boolean
}

export class ReplayAlreadyExistsError extends Error {
    constructor(roomId: string) {
        super(`Replay already exists for room ${roomId}`)
        this.name = "ReplayAlreadyExistsError"
    }
}

function buildReplayData(input: SaveReplayInput): replayDataType {
    return {
        roomId: input.roomId,
        player1: input.player1,
        player2: input.player2,
        initialSnapshot: input.initialSnapshot,
        replay: input.replay,
    }
}

function buildTitle(player1: playerDataType, player2: playerDataType, roomId: string) {
    return `Bakugan-Arena-${player1?.displayUsername}-VS-${player2?.displayUsername}-${roomId}`
}

export async function saveReplayCore(
    input: SaveReplayInput,
    options: { ifExists: "return" | "reject" },
): Promise<SavedReplayRow> {
    const { roomId, player1, player2, replay, initialSnapshot } = input

    if (!roomId || !player1 || !player2 || !replay || !initialSnapshot) {
        throw new Error("Invalid replay data")
    }

    const existing = await db.query.replay.findFirst({
        where: (row) => eq(row.roomId, roomId),
        columns: { id: true, roomId: true, title: true },
    })

    if (existing) {
        if (options.ifExists === "reject") {
            throw new ReplayAlreadyExistsError(roomId)
        }
        return { ...existing, created: false }
    }

    const replayData = buildReplayData(input)
    const title = buildTitle(player1, player2, roomId)

    const [inserted] = await db.insert(schema.replay)
        .values({ replayData, roomId, title })
        .returning({
            id: schema.replay.id,
            roomId: schema.replay.roomId,
            title: schema.replay.title,
        })

    return { ...inserted, created: true }
}
