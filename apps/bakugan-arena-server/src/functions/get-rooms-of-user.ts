import { Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"

export function GetUsersRooms(userId: string) {
    const rooms: { p1: string, p2: string, roomId: string } [] = Battle_Brawlers_Game_State.filter((room) => room !== undefined).filter((room) => room.players.some((player) => player.userId === userId)).filter((room) => !room.status.finished).map((room) => ({
        p1: room.players[0].username,
        p2: room.players[1].username,
        roomId: room.roomId
    }))

    console.log('eh rooms')

    return rooms
}