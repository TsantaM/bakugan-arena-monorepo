import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export function GetUsersRooms(userId: string) {
    const rooms: { p1: string, p2: string, roomId: string, finished: boolean }[] = Battle_Brawlers_Game_State
        .filter(
            (room) => room !== undefined)
        .filter((room) => room.players.some((player) => player.userId === userId || room.spectators.has(userId)))
        // .filter((room) => !room.status.finished)
        // .filter((room) => !room.status.finished)
        .map((room) => ({
            p1: room.players[0].username,
            p2: room.players[1].username,
            roomId: room.roomId,
            finished: room.status.finished
        }))

    return rooms
}