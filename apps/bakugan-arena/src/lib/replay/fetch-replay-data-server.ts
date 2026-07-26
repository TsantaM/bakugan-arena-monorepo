import { normalizeReplayData, type replayDataType } from "@bakugan-arena/game-data"

type ReplayStorageRow = {
    replayData: replayDataType | null
    blobUrl: string | null
}

export async function fetchReplayDataFromStorage(row: ReplayStorageRow): Promise<replayDataType> {
    if (row.replayData) {
        return normalizeReplayData(row.replayData)
    }

    if (row.blobUrl) {
        const response = await fetch(row.blobUrl)

        if (!response.ok) {
            throw new Error(`Failed to fetch replay blob (${response.status})`)
        }

        const parsed: unknown = await response.json()
        return normalizeReplayData(parsed)
    }

    throw new Error("Replay data unavailable")
}
