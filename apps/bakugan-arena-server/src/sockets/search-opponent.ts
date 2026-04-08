import { Server, Socket } from "socket.io";
import { CreateRoom } from "../functions/create-room";
import { createGameState } from "../functions/create-game-state";
import { Battle_Brawlers_Game_State, intervalIds } from "../game-state/battle-brawlers-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";
import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { findOpponent } from "../functions/matchmaking-functions/find-opponent";

export type waitingListElements = {
    socketId: string,
    userId: string,
    deckId: string,
    joinedAtt: number,
    ranked: boolean,
    elo: number
}


let waitingList: waitingListElements[] = []


// ADD TO WAITING LIST FUNCTION

const addToWaitingList = async ({ userId, deckId, socketId, ranked }: { userId: string, deckId: string, socketId: string, ranked: boolean }) => {
    const elo = await db.query.user.findFirst({
        where: (u) => eq(u.id, userId),
        columns: {
            elo: true
        }
    })
    const newEntry: waitingListElements = {
        socketId: socketId,
        userId: userId,
        deckId: deckId,
        joinedAtt: Date.now(),
        ranked: ranked,
        elo: elo ? elo.elo : 1000
    }

    const ckeckExist = waitingList.some(w => w.userId === userId)

    if (!ckeckExist) {
        waitingList.push(newEntry)
        console.log(`User ${userId} added to waiting list.`)

    } else {
        console.log(`User ${userId} is already in the waiting list.`)
    }

}

export const removeToWaitingList = ({ userId }: { userId: string }) => {
    waitingList = waitingList.filter(w => w.userId !== userId)
    console.log(`User ${userId} removed from waiting list.`)
    console.log(waitingList)
}

export const matchmaking = async (io: Server) => {
    if (waitingList.length < 2) return

    // 1. Trier par elo (CRUCIAL)
    waitingList.sort((a, b) => a.elo - b.elo)

    const matched = new Set<string>()

    for (const player of waitingList) {
        if (matched.has(player.userId)) continue

        const opponent = findOpponent(player, waitingList)

        if (!opponent) continue
        if (matched.has(opponent.userId)) continue

        // ✅ MATCH TROUVÉ
        matched.add(player.userId)
        matched.add(opponent.userId)

        const room = await CreateRoom({
            player1ID: player.userId,
            P1Deck: player.deckId,
            Player2ID: opponent.userId,
            P2Deck: opponent.deckId
        })

        const players = [player, opponent]

        // Emit match
        players.forEach(p => {
            io.to(p.socketId).emit('match-found', room.id)
        })

        // Init game state
        const newRoomState = await createGameState({ roomId: room.id, ranked: true })

        if (newRoomState) {
            Battle_Brawlers_Game_State.push(newRoomState)

            intervalIds.push({
                roomId: newRoomState.roomId,
                players: newRoomState.players.map(p => ({
                    userId: p.userId,
                    intervalId: null
                }))
            })
        }

        // Update rooms côté client
        players.forEach((p) => {
            const rooms = GetUsersRooms(p.userId)
            io.to(p.socketId).emit('get-rooms-user-id', rooms)
        })
    }

    // 2. Supprimer TOUS les joueurs matchés en une fois
    waitingList = waitingList.filter(p => !matched.has(p.userId))
}
// SOCKET ADD TO WAITING LIST

export const setupSearchOpponentSocket = (io: Server, socket: Socket) => {
    socket.on('search-opponent', async ({ userId, deckId, ranked }: { userId: string, deckId: string, ranked: boolean }) => {
        await addToWaitingList({ userId, deckId, socketId: socket.id, ranked: ranked })
        matchmaking(io)
    })
}