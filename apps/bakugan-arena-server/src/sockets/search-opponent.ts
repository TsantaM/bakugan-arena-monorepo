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

type QueuePlayer = {
    socketId: string
    userId: string
    deckId: string
    joinedAt: number
    ranked: boolean
    elo: number
}

export const waitingMap = new Map<string, QueuePlayer>() // anti doublon
let isProcessing = false


export const addToQueue = async ({
    userId,
    deckId,
    socketId,
    ranked
}: {
    userId: string
    deckId: string
    socketId: string
    ranked: boolean
}) => {

    if (waitingMap.has(userId)) {
        return // déjà en queue → ignore
    }

    const user = await db.query.user.findFirst({
        where: (u) => eq(u.id, userId),
        columns: { elo: true }
    })

    waitingMap.set(userId, {
        userId,
        deckId,
        socketId,
        ranked,
        joinedAt: Date.now(),
        elo: user?.elo ?? 1000
    })
}

export const removeFromQueue = (userId: string) => {
    waitingMap.delete(userId)
}

export const processMatchmaking = async (io: Server) => {
    if (isProcessing) return
    isProcessing = true

    try {
        const players = Array.from(waitingMap.values())

        if (players.length < 2) return

        // tri stable
        players.sort((a, b) => a.elo - b.elo)

        const used = new Set<string>()

        for (let i = 0; i < players.length; i++) {
            const p1 = players[i]

            if (used.has(p1.userId)) continue
            if (!waitingMap.has(p1.userId)) continue // sécurité

            const opponent = findBestOpponent(p1, players, used)

            if (!opponent) continue

            // 🔒 LOCK LOCAL
            used.add(p1.userId)
            used.add(opponent.userId)

            // 🔒 REMOVE AVANT ASYNC → CRUCIAL
            waitingMap.delete(p1.userId)
            waitingMap.delete(opponent.userId)

            // 🎮 CREATE MATCH
            const room = await CreateRoom({
                player1ID: p1.userId,
                P1Deck: p1.deckId,
                Player2ID: opponent.userId,
                P2Deck: opponent.deckId
            })

            const matchedPlayers = [p1, opponent]

            matchedPlayers.forEach(p => {
                io.to(p.socketId).emit('match-found', room.id)
            })

            const state = await createGameState({
                roomId: room.id,
                ranked: true
            })

            if (!state) continue

            Battle_Brawlers_Game_State.push(state)

            intervalIds.push({
                roomId: state.roomId,
                players: state.players.map(p => ({
                    userId: p.userId,
                    intervalId: null
                }))
            })

            matchedPlayers.forEach(p => {
                const rooms = GetUsersRooms(p.userId)
                io.to(p.socketId).emit('get-rooms-user-id', rooms)
            })
        }

    } finally {
        isProcessing = false
    }
}
// SOCKET ADD TO WAITING LIST
const findBestOpponent = (
    player: QueuePlayer,
    players: QueuePlayer[],
    used: Set<string>
) => {
    const MAX_ELO_DIFF_BASE = 100

    const waitTime = Date.now() - player.joinedAt

    // plus il attend, plus on élargit
    const dynamicRange = MAX_ELO_DIFF_BASE + Math.floor(waitTime / 2000) * 50

    return players.find(p =>
        p.userId !== player.userId &&
        !used.has(p.userId) &&
        Math.abs(p.elo - player.elo) <= dynamicRange
    )
}

export const setupSearchOpponentSocket = (io: Server, socket: Socket) => {

    socket.on('search-opponent', async ({ userId, deckId, ranked }) => {
        await addToQueue({ userId, deckId, socketId: socket.id, ranked })
        // processMatchmaking(io)
    })

    socket.on('disconnect', () => {
        // clean auto
        for (const [userId, p] of waitingMap.entries()) {
            if (p.socketId === socket.id) {
                waitingMap.delete(userId)
            }
        }
    })
}