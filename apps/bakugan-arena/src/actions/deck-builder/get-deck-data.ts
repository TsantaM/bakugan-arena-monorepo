'use server'

import { db } from "@/src/lib/db"
import { eq } from "drizzle-orm"
import { getUser } from "../getUserSession"

export const GetDeckData = async (id: string) => {
  const currentUser = await getUser()
  if (!currentUser) return undefined

  return db.query.deck.findFirst({
    where: (d) => eq(d.id, id) && eq(d.userId, currentUser.id),
    columns: {
      id: true,
      name: true,
      bakugans: true,
      exclusiveAbilities: true,
      ability: true,
      gateCards: true,
    },
  })
}

export type GetDeckDataType = Exclude<Awaited<ReturnType<typeof GetDeckData>>, undefined>

export const GetUserDecks = async () => {
  const currentUser = await getUser()
  if (!currentUser) return undefined

  return db.query.deck.findMany({
    where: (d) => eq(d.userId, currentUser.id),
    columns: {
      id: true,
      name: true,
      bakugans: true,
      exclusiveAbilities: true,
      ability: true,
      gateCards: true,
    },
  })
}

export type GetUserDecksType = Exclude<Awaited<ReturnType<typeof GetUserDecks>>, undefined>
export type GetUserDeckType = GetUserDecksType[number]
