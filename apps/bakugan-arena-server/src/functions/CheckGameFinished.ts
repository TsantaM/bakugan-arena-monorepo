import { Message, stateType } from "@bakugan-arena/game-data"
import { db } from "../lib/db"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"
import { CalculateAndUpdateElo } from "./ladder-functions/calculate-elo"
import { Server } from "socket.io/dist"

const rooms = schema.rooms

export const CheckGameFinished = async ({
  io,
  roomId,
  roomState,
}: {
  roomId: string
  roomState: stateType
  
  io: Server
}) => {
  if (!roomState || roomState.status.finished) return

  const player1 = roomState.players[0].userId
  const player2 = roomState.players[1].userId

  const p1Decks = roomState.decksState.find((d) => d.userId === player1)
  const p2Decks = roomState.decksState.find((d) => d.userId === player2)

  const gateOnDomain = roomState.protalSlots.filter((s) => s.portalCard !== null)
  const p1Gates = roomState.players.find((p) => p.userId === player1)?.usable_gates
  const p2Gates = roomState.players.find((p) => p.userId === player2)?.usable_gates

  if (!p1Decks || !p2Decks) return

  const p1State = p1Decks.bakugans.reduce((count, b) => {
    return b?.bakuganData?.elimined === false ? count + 1 : count
  }, 0)

  const p2State = p2Decks.bakugans.reduce((count, b) => {
    return b?.bakuganData?.elimined === false ? count + 1 : count
  }, 0)

  const EqualityMessage: Message = {
    text: `Game is over ! Equality !`,
    turn: roomState.turnState.turnCount
  }

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

    await CalculateAndUpdateElo({ loser: player1, winner: player2, roomData: roomState, io: io, roomId: roomId })

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

    await CalculateAndUpdateElo({ loser: player2, winner: player1, roomData: roomState, io: io, roomId: roomId })

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

    io.to(roomId).emit('game-finished', EqualityMessage)
    const sockets = roomState.connectedsUsers
    sockets.forEach((s) => {
      console.log('parent-socket', s.nextjsSocket)
      io.to(s.nextjsSocket).emit('game-messages', [EqualityMessage])
    })
    roomState.messages.push(EqualityMessage)

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

    io.to(roomId).emit('game-finished', EqualityMessage)
    const sockets = roomState.connectedsUsers
    sockets.forEach((s) => {
      console.log('parent-socket', s.nextjsSocket)
      io.to(s.nextjsSocket).emit('game-messages', [EqualityMessage])
    })
    roomState.messages.push(EqualityMessage)

    return

  }

  // Game continues
  return
}
