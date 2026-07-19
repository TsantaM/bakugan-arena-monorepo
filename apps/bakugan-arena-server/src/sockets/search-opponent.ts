import { Server, Socket } from "socket.io";
import { CreateRoom } from "../functions/create-room";
import { createGameState } from "../functions/create-game-state";
import { Battle_Brawlers_Game_State, connectedUsers, intervalIds } from "../game-state/battle-brawlers-game-state";
import { GetUsersRooms } from "../functions/get-rooms-of-user";
import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { findOpponent } from "../functions/matchmaking-functions/find-opponent";
import { StartTwoTimers, UpdatePlayerTimer } from "../functions/start-player-timer";
import { getAvailableBot, getBotSocketId, isBotUserId } from "../functions/bot-manager";

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

/** Seul joueur humain connecté → délai avant bot */
const BOT_WAIT_ALONE_MS = 20_000
/** D'autres humains en ligne → délai plus long, on privilégie un vrai match */
const BOT_WAIT_OTHERS_ONLINE_MS = 60_000

const hasOtherHumansOnline = (searcherUserId: string) => {
    return connectedUsers.some(
        (u) =>
            u.userId !== "" &&
            u.userId !== searcherUserId &&
            !isBotUserId(u.userId)
    )
}

const getBotWaitMs = (searcherUserId: string) => {
    return hasOtherHumansOnline(searcherUserId)
        ? BOT_WAIT_OTHERS_ONLINE_MS
        : BOT_WAIT_ALONE_MS
}

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

const matchPlayerWithBot = async (io: Server, player: QueuePlayer) => {
    const bot = await getAvailableBot({ ranked: player.ranked })
    const botSocketId = bot ? getBotSocketId(bot.userId) : undefined

    if (!bot || !botSocketId) return false

    waitingMap.delete(player.userId)

    const room = await CreateRoom({
        player1ID: player.userId,
        P1Deck: player.deckId,
        Player2ID: bot.userId,
        P2Deck: bot.deckId,
        ranked: player.ranked
    })

    // L'état doit exister AVANT match-found : le bot init immédiatement
    const state = await createGameState({
        roomId: room.id,
        ranked: player.ranked
    })

    if (!state) return false

    Battle_Brawlers_Game_State.push(state)

    intervalIds.push({
        roomId: state.roomId,
        players: state.players.map((p) => ({
            userId: p.userId,
            intervalId: null
        }))
    })

    const roomState = Battle_Brawlers_Game_State[Battle_Brawlers_Game_State.indexOf(state)]
    StartTwoTimers({ io: io, roomState: roomState, roomId: roomState.roomId })

    io.to(player.socketId).emit('match-found', room.id)
    io.to(player.socketId).emit('get-rooms-user-id', GetUsersRooms(player.userId))
    io.to(botSocketId).emit('match-found', room.id)

    return true
}

export const processMatchmaking = async (io: Server) => {
    if (isProcessing) return
    isProcessing = true

    try {
        const players = Array.from(waitingMap.values())

        // 1️⃣ Priorité : match humain vs humain
        if (players.length >= 2) {
            // tri stable
            players.sort((a, b) => a.elo - b.elo)

            const used = new Set<string>()
            const BASE_RANGE = 50
            const EXPANSION_PER_SEC = 5

            for (let i = 0; i < players.length - 1; i++) {
                const p1 = players[i]
                const p2 = players[i + 1]

                if (used.has(p1.userId) || used.has(p2.userId)) continue

                if (!waitingMap.has(p1.userId) || !waitingMap.has(p2.userId)) continue

                if (p1.ranked !== p2.ranked) continue

                const now = Date.now()

                const wait1 = (now - p1.joinedAt) / 1000
                const wait2 = (now - p2.joinedAt) / 1000

                const range1 = BASE_RANGE + wait1 * EXPANSION_PER_SEC
                const range2 = BASE_RANGE + wait2 * EXPANSION_PER_SEC

                const diff = Math.abs(p1.elo - p2.elo)

                if (diff > range1 || diff > range2) continue

                // 🔒 LOCK
                used.add(p1.userId)
                used.add(p2.userId)

                waitingMap.delete(p1.userId)
                waitingMap.delete(p2.userId)

                // 🎮 MATCH CREATION — état prêt avant match-found
                const room = await CreateRoom({
                    player1ID: p1.userId,
                    P1Deck: p1.deckId,
                    Player2ID: p2.userId,
                    P2Deck: p2.deckId,
                    ranked: p1.ranked
                })

                const state = await createGameState({
                    roomId: room.id,
                    ranked: p1.ranked
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

                const roomState = Battle_Brawlers_Game_State[Battle_Brawlers_Game_State.indexOf(state)]
                StartTwoTimers({ io: io, roomState: roomState, roomId: roomState.roomId })

                const matchedPlayers = [p1, p2]

                matchedPlayers.forEach(p => {
                    io.to(p.socketId).emit('match-found', room.id)
                    const rooms = GetUsersRooms(p.userId)
                    io.to(p.socketId).emit('get-rooms-user-id', rooms)
                })
            }
        }

        // 2️⃣ Fallback bot : seulement si seul en file ET délai écoulé
        const remaining = Array.from(waitingMap.values()).filter((p) => !isBotUserId(p.userId))

        if (remaining.length === 1) {
            const player = remaining[0]
            const waitedMs = Date.now() - player.joinedAt
            const requiredWaitMs = getBotWaitMs(player.userId)

            if (waitedMs >= requiredWaitMs) {
                await matchPlayerWithBot(io, player)
            }
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
