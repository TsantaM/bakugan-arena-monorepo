'use server'

import { DecodedDeckType } from "@/src/types/share-deck-types";
import { getUser } from "../getUserSession";
import { CreateDeckAction } from "./create-deck-action";
import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq } from "drizzle-orm"

const deck = schema.deck

export default async function CopyDeck({ deckData }: { deckData: DecodedDeckType }) {
    const currentUser = await getUser()

    if (!currentUser) return undefined

    const deckId = await CreateDeckAction()

    if (!deckId) return undefined

    try {

        await db
            .update(deck)
            .set({
                bakugans: deckData.bakugans,
                ability: deckData.ability,
                exclusiveAbilities: deckData.exclusiveAbilities,
                gateCards: deckData.gateCards,
            })
            .where(eq(deck.id, deckId))

        return deckId

    } catch (err) {
        return undefined
    }
}