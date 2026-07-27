import type { playerDataType, replayDataType, replayEntryType } from "@bakugan-arena/game-data"

export type SaveReplayInput = {
    roomId: string
    player1: playerDataType
    player2: playerDataType
    replay: replayEntryType[]
    initialSnapshot: replayDataType["initialSnapshot"]
}
