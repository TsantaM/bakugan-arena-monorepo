'use server'

import { playerDataType, replayDataType, replayEntryType, replaySnapshotType } from "@bakugan-arena/game-data";

export async function ConvertReplayToJson({
    replay,
    initialSnapshot,
    player1,
    player2,
    roomId,
}: {
    replay: replayEntryType[]
    initialSnapshot: replaySnapshotType
    roomId: string
    player1: playerDataType
    player2: playerDataType
}) {

    const data: replayDataType = {
        roomId: roomId,
        player1: player1,
        player2: player2,
        initialSnapshot,
        replay,
    }

    return JSON.stringify(data, null, 2)
}
