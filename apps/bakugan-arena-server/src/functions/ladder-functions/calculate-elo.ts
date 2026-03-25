import { schema } from "@bakugan-arena/drizzle-orm"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../lib/db"
import { stateType } from "@bakugan-arena/game-data"

function getK(elo: number) : number {

    if(elo < 1400) return 32
    if(elo < 1800) return 24

    return 16
}

export async function CalculateAndUpdateElo( {winner, loser, roomData} :{winner: string, loser: string, roomData: stateType}) {

    if(!roomData) return
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

    const expectedA = 1 / (1 + Math.pow(10, (winnerElo.elo - winnerElo.elo) / 400))
    const expectedB = 1 - expectedA

    let newWinnerElo = winnerElo.elo + winnerK * (1 - expectedA)
    let newLoserElo = loserElo.elo + loserK * (0 - expectedB)

    // floor à 1000
    newWinnerElo = Math.max(1000, Math.round(newWinnerElo))
    newLoserElo = Math.max(1000, Math.round(newLoserElo))

    const winnerDiffElo = newWinnerElo - winnerElo.elo
    const loserDiffElo = loserElo.elo - newLoserElo

    await db.update(userSchema).set({elo: newWinnerElo}).where(eq(userSchema.id, winner))
    await db.update(userSchema).set({elo: newLoserElo}).where(eq(userSchema.id, loser))

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

    return { newWinnerElo, winnerDiffElo, newLoserElo, loserDiffElo }
}