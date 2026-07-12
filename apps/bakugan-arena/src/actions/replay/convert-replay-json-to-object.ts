'use server'

import { normalizeReplayData, replayDataType } from "@bakugan-arena/game-data";

export async function ConvertReplayToObject(json: string): Promise<replayDataType> {

    let parse: unknown

    try {
        parse = JSON.parse(json)
    } catch {
        throw new Error('JSON Invalid')
    }

    return normalizeReplayData(parse)
}
