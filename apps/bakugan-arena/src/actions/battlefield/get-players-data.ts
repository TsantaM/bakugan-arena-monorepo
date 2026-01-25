'use server'

import { db } from "@/src/lib/db"

export const RoomDataAction = async (roomId: string) => {
  // 1️⃣ Récupérer la room
  const roomData = await db.query.rooms.findFirst({
    where: (r, { eq }) => eq(r.id, roomId),
    columns: {
      player1Id: true,
      p1Deck: true,
      player2Id: true,
      p2Deck: true,
    },
  })

  if (!roomData) return undefined

  const { player1Id, player2Id, p1Deck, p2Deck } = roomData

  // 2️⃣ Récupérer les joueurs
  const [player1, player2] = await Promise.all([
    db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, player1Id),
      columns: {
        id: true,
        image: true,
        displayUsername: true,
      },
    }),
    db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, player2Id),
      columns: {
        id: true,
        image: true,
        displayUsername: true,
      },
    }),
  ])

  if (!player1 || !player2) return undefined

  // 3️⃣ Récupérer les decks
  const [deckP1, deckP2] = await Promise.all([
    db.query.deck.findFirst({
      where: (d, { eq }) => eq(d.id, p1Deck),
      columns: {
        bakugans: true,
        ability: true,
        exclusiveAbilities: true,
        gateCards: true,
      },
    }),
    db.query.deck.findFirst({
      where: (d, { eq }) => eq(d.id, p2Deck),
      columns: {
        bakugans: true,
        ability: true,
        exclusiveAbilities: true,
        gateCards: true,
      },
    }),
  ])

  if (!deckP1 || !deckP2) return undefined

  // 4️⃣ Construire la structure finale
  return [
    { player: player1, deck: deckP1 },
    { player: player2, deck: deckP2 },
  ]
}

export type RoomDataActionType = Exclude<
  Awaited<ReturnType<typeof RoomDataAction>>,
  undefined
>
