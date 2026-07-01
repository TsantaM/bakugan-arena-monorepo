
import { schema } from "@bakugan-arena/drizzle-orm"
import { and, eq, inArray } from "drizzle-orm"
import { db } from "../lib/db"
import { getBotDeckByUserId, getBotPlayerByUserId, isBotUserId } from "./bot-data"

const rooms = schema.rooms

export const getDecksData = async ({ roomId }: { roomId: string }) => {
  const roomData = await db.query.rooms.findFirst({
    where: (r) => eq(r.id, roomId),
    columns: {
      player1Id: true,
      player2Id: true,
      p1Deck: true,
      p2Deck: true,
    },
  })

  if (!roomData) return undefined

  const players = [roomData.player1Id, roomData.player2Id]
  const decksIds = [roomData.p1Deck, roomData.p2Deck]

  const botDecks = players
    .filter(isBotUserId)
    .map(getBotDeckByUserId)
    .filter((deck): deck is NonNullable<ReturnType<typeof getBotDeckByUserId>> => deck !== undefined)

  const humanPlayerIds = players.filter((id) => !isBotUserId(id))

  const humanDecks = humanPlayerIds.length
    ? await db.query.deck.findMany({
        where: (d) => and(inArray(d.id, decksIds), inArray(d.userId, humanPlayerIds)),
        columns: {
          id: true,
          userId: true,
          bakugans: true,
          ability: true,
          exclusiveAbilities: true,
          gateCards: true,
        },
      })
    : []

  return [...humanDecks, ...botDecks]
}

export type GetDecksDataType = Exclude<
  Awaited<ReturnType<typeof getDecksData>>,
  undefined
>

export const getRoomPlayers = async ({ roomId }: { roomId: string }) => {
  const room = await db.query.rooms.findFirst({
    where: (r) => eq(r.id, roomId),
    columns: {
      player1Id: true,
      player2Id: true,
    },
  })

  if (!room) return undefined

  const player1 = isBotUserId(room.player1Id)
    ? getBotPlayerByUserId(room.player1Id)
    : await db.query.user.findFirst({
        where: (u) => eq(u.id, room.player1Id),
        columns: {
          id: true,
          displayUsername: true,
        },
      })

  const player2 = isBotUserId(room.player2Id)
    ? getBotPlayerByUserId(room.player2Id)
    : await db.query.user.findFirst({
        where: (u) => eq(u.id, room.player2Id),
        columns: {
          id: true,
          displayUsername: true,
        },
      })

  return {
    player1,
    player2,
  }
}

export type GetRoomPlayersType = Exclude<
  Awaited<ReturnType<typeof getRoomPlayers>>,
  undefined
>