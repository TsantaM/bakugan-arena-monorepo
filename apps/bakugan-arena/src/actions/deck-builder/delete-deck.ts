'use server'

import { db } from "@/src/lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq, and } from "drizzle-orm"
import { getUser } from "../getUserSession"

const deck = schema.deck

export const DeleteDeck = async (id: string) => {
  const currentUser = await getUser()
  if (!currentUser) return

  await db
    .delete(deck)
    .where(
      and(
        eq(deck.id, id),
        eq(deck.userId, currentUser.id)
      )
    )
}
