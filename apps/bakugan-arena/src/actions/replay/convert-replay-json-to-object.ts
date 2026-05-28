'use server'

import { replayDataType } from "@bakugan-arena/game-data";

function isReplayData (data: any): data is replayDataType {

    return (
        data &&
        typeof data === "object" &&
        typeof data.roomId === "string" &&
        data.player1 && data.player2 && Array.isArray(data.replay)
    )
    

}

export async function ConvertReplayToObject(json: string): Promise<replayDataType> {

    let parse: unknown

    try {
        parse = JSON.parse(json)
    } catch {
        throw new Error('JSON Invalid')
    }

    if(!isReplayData(parse)) {
        throw new Error('JSON structure invalid')
    }

    return parse
}