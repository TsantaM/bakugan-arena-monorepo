
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq, inArray } from "drizzle-orm"
import { db } from "../lib/db"

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

  return db.query.deck.findMany({
    where: (d) =>
      inArray(d.id, decksIds) &&
      inArray(d.userId, players),
    columns: {
      id: true,
      userId: true,
      bakugans: true,
      ability: true,
      exclusiveAbilities: true,
      gateCards: true,
    },
  })
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

  const player1 = await db.query.user.findFirst({
    where: (u) => eq(u.id, room.player1Id),
    columns: {
      id: true,
      displayUsername: true,
    },
  })

  const player2 = await db.query.user.findFirst({
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