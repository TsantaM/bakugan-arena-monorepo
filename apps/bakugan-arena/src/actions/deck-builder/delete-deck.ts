'use server'

import { db } from "@/src/lib/db"
import { deck } from "@bakugan-arena/drizzle-orm"
import { eq, and } from "drizzle-orm"
import { getUser } from "../getUserSession"

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
