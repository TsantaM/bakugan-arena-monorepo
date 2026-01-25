import { stateType } from "@bakugan-arena/game-data"
import { db } from "../lib/db"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"

const rooms = schema.rooms

export const CheckGameFinished = async ({
  roomId,
  roomState,
}: {
  roomId: string
  roomState: stateType
}) => {
  if (!roomState || roomState.status.finished) return

  const player1 = roomState.players[0].userId
  const player2 = roomState.players[1].userId

  const p1Decks = roomState.decksState.find((d) => d.userId === player1)
  const p2Decks = roomState.decksState.find((d) => d.userId === player2)

  const gateOnDomain = roomState.protalSlots.filter((s) => s.portalCard !== null)
  const p1Gates = roomState.players.find((p) => p.userId === player1)?.usable_gates
  const p2Gates = roomState.players.find((p) => p.userId === player2)?.usable_gates

  console.log("gate on domain", gateOnDomain.length)
  console.log("p1Gates", p1Gates)
  console.log("p2Gates", p2Gates)

  if (!p1Decks || !p2Decks) return

  const p1State = p1Decks.bakugans.reduce((count, b) => {
    return b?.bakuganData?.elimined === false ? count + 1 : count
  }, 0)

  const p2State = p2Decks.bakugans.reduce((count, b) => {
    return b?.bakuganData?.elimined === false ? count + 1 : count
  }, 0)

  console.log(`Player 1 : ${p1State} && Player 2 : ${p2State}`)

  // 🥇 Player 2 wins
  if (p1State === 0 && p2State > 0) {
    roomState.status.finished = true
    roomState.status.winner = player2

    await db
      .update(rooms)
      .set({
        winner: player2,
        looser: player1,
        finished: true,
      })
      .where(eq(rooms.id, roomId))

    return
  }

  // 🥇 Player 1 wins
  if (p1State > 0 && p2State === 0) {
    roomState.status.finished = true
    roomState.status.winner = player1

    await db
      .update(rooms)
      .set({
        winner: player1,
        looser: player2,
        finished: true,
      })
      .where(eq(rooms.id, roomId))

    return
  }

  // ⚖️ Draw (no bakugans)
  if (p1State === 0 && p2State === 0) {
    roomState.status.finished = true
    roomState.status.winner = null

    await db
      .update(rooms)
      .set({
        finished: true,
      })
      .where(eq(rooms.id, roomId))

    return
  }

  // ⚖️ Draw (no gates)
  if (gateOnDomain.length === 0 && p1Gates === 0 && p2Gates === 0) {
    roomState.status.finished = true
    roomState.status.winner = null

    await db
      .update(rooms)
      .set({
        finished: true,
      })
      .where(eq(rooms.id, roomId))

    return
  }

  // Game continues
  return
}
