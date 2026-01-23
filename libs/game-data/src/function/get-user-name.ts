import { stateType } from '../type/type-index.js'

export function GetUserName({ roomData, userId }: { roomData: stateType, userId: string }) {
    if (!roomData) return ''

    const userName = roomData.players.find((p) => p.userId === userId)?.username

    if(!userName) return ''

    return userName

}