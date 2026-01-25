import { db } from "../lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"

const rooms = schema.rooms

export const CreateRoom = async ({
    player1ID,
    P1Deck,
    Player2ID,
    P2Deck,
}: {
    player1ID: string
    P1Deck: string
    Player2ID: string
    P2Deck: string
}) => {
    const [room] = await db
        .insert(rooms)
        .values({
            player1Id: player1ID,
            p1Deck: P1Deck,
            player2Id: Player2ID,
            p2Deck: P2Deck,
            looser: "",
            winner: "",
            finished: false,
        })
        .returning()

    return room
}