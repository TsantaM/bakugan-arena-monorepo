'use server'

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { computeDecayedElo } from "@bakugan-arena/game-data"
import { getLastRankedGameDatesByUserId } from "./elo-decay"

const user = schema.user

async function GetPlayersLadder() {
    const [players, lastRankedByUserId] = await Promise.all([
        db.query.user.findMany({
            columns: {
                displayUsername: true,
                username: true,
                elo: true,
                image: true,
                id: true
            },
        }),
        getLastRankedGameDatesByUserId(),
    ])

    return players
        .map((player) => ({
            ...player,
            elo: computeDecayedElo(
                player.elo,
                lastRankedByUserId.get(player.id) ?? null
            ),
        }))
        .sort((a, b) => b.elo - a.elo)
        .slice(0, 100)
}

export { GetPlayersLadder }
