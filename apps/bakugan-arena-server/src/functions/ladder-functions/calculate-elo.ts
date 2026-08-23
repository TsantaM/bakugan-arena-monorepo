import { schema } from "@bakugan-arena/drizzle-orm"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../lib/db"
import { Message, stateType } from "@bakugan-arena/game-data"
import { Server } from "socket.io"
import { emitFinalRoomState } from "../replay/final-room-state"

function getK(elo: number): number {

    if (elo < 1400) return 32
    if (elo < 1800) return 24

    return 16
}

export async function CalculateAndUpdateElo({ winner, loser, roomData, io, roomId, forfeit = false }: { winner: string, loser: string, roomData: stateType, io: Server, roomId: string, forfeit?: boolean }) {

    if (!roomData) return

    const winnerName = roomData.players.find((p) => p.userId === roomData.status.winner)?.username ? roomData.players.find((p) => p.userId === roomData.status.winner)?.username : ''
    const loserName = roomData.players.find((p) => p.userId !== roomData.status.winner)?.username ? roomData.players.find((p) => p.userId !== roomData.status.winner)?.username : ''
    
    if (!roomData.ranked) {

        const message: Message = forfeit
            ? {
                key: 'forfeit_winner',
                params: {
                    loserName: loserName ?? '',
                    winnerName: winnerName ?? '',
                },
                turn: roomData.turnState.turnCount
            }
            : {
                key: 'game_over_winner',
                params: { winner: winnerName ?? '' },
                turn: roomData.turnState.turnCount
            }


        io.to(roomId).emit('game-finished', message)

        emitFinalRoomState(roomData, io)

        const sockets = roomData.connectedsUsers
        sockets.forEach((s) => {
            io.to(s.nextjsSocket).emit('game-messages', [message])
        })
        roomData.messages.push(message)
    }
    if (!roomData.ranked) return

    const userSchema = schema.user

    const winnerElo = await db.query.user.findFirst({
        where: (u) => eq(u.id, winner),
        columns: {
            elo: true
        }
    })

    const loserElo = await db.query.user.findFirst({
        where: (u) => eq(u.id, loser),
        columns: {
            elo: true
        }
    })

    if (!winnerElo || !loserElo) return

    let winnerK: number = getK(winnerElo.elo)
    let loserK: number = getK(loserElo.elo)

    const expectedA = 1 / (1 + Math.pow(10, (loserElo.elo - winnerElo.elo) / 400))
    const expectedB = 1 - expectedA

    let newWinnerElo = winnerElo.elo + winnerK * (1 - expectedA)
    let newLoserElo = loserElo.elo + loserK * (0 - expectedB)

    // floor à 1000
    newWinnerElo = Math.max(1000, Math.round(newWinnerElo))
    newLoserElo = Math.max(1000, Math.round(newLoserElo))

    const winnerDiffElo = newWinnerElo - winnerElo.elo
    const loserDiffElo = loserElo.elo - newLoserElo

    roomData.status.elo = {
        winner: {
            newElo: newWinnerElo,
            bonus: winnerDiffElo
        },
        loser: {
            newElo: newLoserElo,
            malus: loserDiffElo
        }
    }

    await db.update(userSchema).set({ elo: newWinnerElo }).where(eq(userSchema.id, winner))
    await db.update(userSchema).set({ elo: newLoserElo }).where(eq(userSchema.id, loser))

    const message: Message = forfeit
        ? {
            key: 'forfeit_winner_ranked',
            params: {
                loserName: loserName ?? '',
                winnerName: winnerName ?? '',
                winnerElo: newWinnerElo,
                winnerBonus: winnerDiffElo,
                loserElo: newLoserElo,
                loserMalus: loserDiffElo,
            },
            turn: roomData.turnState.turnCount
        }
        : {
            key: 'game_over_winner_ranked',
            params: {
                winnerName: winnerName ?? '',
                loserName: loserName ?? '',
                winnerElo: newWinnerElo,
                winnerBonus: winnerDiffElo,
                loserElo: newLoserElo,
                loserMalus: loserDiffElo,
            },
            turn: roomData.turnState.turnCount
        }

    io.to(roomId).emit('game-finished', message)

    emitFinalRoomState(roomData, io)

    const sockets = roomData.connectedsUsers
    sockets.forEach((s) => {
        io.to(s.nextjsSocket).emit('game-messages', [message])
    })
    roomData.messages.push(message)

    return { newWinnerElo, winnerDiffElo, newLoserElo, loserDiffElo }
}