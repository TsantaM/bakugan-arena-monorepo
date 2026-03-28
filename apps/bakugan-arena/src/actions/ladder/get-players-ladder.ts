'use server'

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"

const user = schema.user

async function GetPlayersLadder() {

    const players = await db.query.user.findMany({
        columns: {
            displayUsername: true,
            username: true,
            elo: true,
            image: true,
            id: true
        },
        orderBy: (user, { desc }) => [desc(user.elo)]
    })

    return players

}

export { GetPlayersLadder }