import { stateType } from "@bakugan-arena/game-data";

export function CheckTurnActionRequest({ roomState, userId }: { roomState: stateType, userId: string }): boolean {

    if (!roomState) return false

    const players = roomState.players
    if(!players.some((player) => player.userId === userId)) return false

    return true

}