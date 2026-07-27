import type { playerDataType } from "@bakugan-arena/game-data"

export type ReplaySelection = {
    id: string
    roomId: string
    player1: NonNullable<playerDataType>
    player2: NonNullable<playerDataType>
}
