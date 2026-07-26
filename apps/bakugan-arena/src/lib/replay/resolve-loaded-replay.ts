import { normalizeReplayData, type replayDataType } from "@bakugan-arena/game-data"
import { fetchReplayJsonFromBlob } from "./replay-blob"
import type { LoadedReplay } from "./loaded-replay"

type ReplayRowSource = {
    blobUrl: string | null
    replayData: replayDataType | null
}

export async function resolveLoadedReplay(source: ReplayRowSource): Promise<LoadedReplay> {
    if (source.blobUrl) {
        const data = await fetchReplayJsonFromBlob(source.blobUrl)
        return { data, blobUrl: source.blobUrl }
    }

    if (source.replayData) {
        const data = normalizeReplayData(source.replayData)
        return { data, blobUrl: null }
    }

    throw new Error("Replay data unavailable")
}
