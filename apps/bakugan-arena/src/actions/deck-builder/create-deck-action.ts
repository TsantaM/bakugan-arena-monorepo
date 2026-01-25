'use server'

import { db } from "@/src/lib/db"
import { deck } from "@bakugan-arena/drizzle-orm"
import { getUser } from "../getUserSession"

export const CreateDeckAction = async () => {
  const currentUser = await getUser()

  if (!currentUser) return undefined

  const result = await db
    .insert(deck)
    .values({
      name: "New Deck",
      userId: currentUser.id,
      bakugans: [],
      ability: [],
      exclusiveAbilities: [],
      gateCards: [],
    })
    .returning({ id: deck.id }) // ✅ récupérer l'id généré

  return result[0]?.id
}
