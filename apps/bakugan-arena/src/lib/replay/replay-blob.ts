import { upload } from "@vercel/blob/client"
import { normalizeReplayData, type replayDataType } from "@bakugan-arena/game-data"

const REPLAY_BLOB_UPLOAD_URL = "/api/replay/blob"

export function buildReplayBlobPathname(roomId: string): string {
    return `replays/${roomId}.json`
}

export async function uploadReplayToBlob(data: replayDataType): Promise<string> {
    const json = JSON.stringify(data)
    const file = new Blob([json], { type: "application/json" })
    const result = await upload(buildReplayBlobPathname(data.roomId), file, {
        access: "public",
        handleUploadUrl: REPLAY_BLOB_UPLOAD_URL,
        contentType: "application/json",
    })

    return result.url
}

export async function fetchReplayJsonFromBlob(url: string): Promise<replayDataType> {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Failed to fetch replay (${response.status})`)
    }

    const parsed: unknown = await response.json()
    return normalizeReplayData(parsed)
}

export function parseReplayJson(text: string): replayDataType {
    let parsed: unknown

    try {
        parsed = JSON.parse(text)
    } catch {
        throw new Error("JSON Invalid")
    }

    return normalizeReplayData(parsed)
}
