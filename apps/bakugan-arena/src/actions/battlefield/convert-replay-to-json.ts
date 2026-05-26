'use server'

import { AnimationDirectivesTypes, playerDataType, replayDataType } from "@bakugan-arena/game-data";

export async function ConvertReplayToJson({replay, player1, player2, roomId } : {replay: AnimationDirectivesTypes[], roomId: string, player1: playerDataType, player2: playerDataType}) {

    const data: replayDataType = {
        roomId: roomId,
        player1: player1,
        player2: player2,
        replay: replay 
    }

    return JSON.stringify(data, null, 2)
}