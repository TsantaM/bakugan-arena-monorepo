import { bakuganInDeck, Message, stateType } from "@bakugan-arena/game-data"
import { db } from "../lib/db"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"
import { CalculateAndUpdateElo } from "./ladder-functions/calculate-elo"
import { Server } from "socket.io/dist"
import { SendUserRooms } from "./send-user-rooms"

const rooms = schema.rooms

type GameResult = {
  finished: boolean
  winner: string | null
  loser: string | null
  reason?: 'NO_BAKUGAN' | 'NO_GATES' | 'DRAW'
}

// export const getGameResult = (roomState: stateType): GameResult => {
//   if (!roomState) return { finished: false, winner: null, loser: null }

//   const [p1, p2] = roomState.players

//   const decksMap = new Map(roomState.decksState.map(d => [d.userId, d]))
//   const playersMap = new Map(roomState.players.map(p => [p.userId, p]))

//   const p1Deck = decksMap.get(p1.userId)
//   const p2Deck = decksMap.get(p2.userId)

//   if (!p1Deck || !p2Deck) {
//     return { finished: false, winner: null, loser: null }
//   }

//   const isAlive = (b: bakuganInDeck) => b.bakuganData.elimined !== true

//   const p1Alive = p1Deck.bakugans.filter(isAlive).length
//   const p2Alive = p2Deck.bakugans.filter(isAlive).length

//   // 🥇 victoire classique
//   if (p1Alive === 0 && p2Alive > 0) {
//     return { finished: true, winner: p2.userId, loser: p1.userId, reason: 'NO_BAKUGAN' }
//   }

//   if (p2Alive === 0 && p1Alive > 0) {
//     return { finished: true, winner: p1.userId, loser: p2.userId, reason: 'NO_BAKUGAN' }
//   }

//   // ⚖️ draw bakugan
//   if (p1Alive === 0 && p2Alive === 0) {
//     return { finished: true, winner: null, loser: null, reason: 'DRAW' }
//   }

//   // ⚖️ draw gates
//   const gatesOnBoard = roomState.protalSlots.some(s => s.portalCard !== null)
//   const p1Gates = playersMap.get(p1.userId)?.usable_gates ?? 0
//   const p2Gates = playersMap.get(p2.userId)?.usable_gates ?? 0

//   if (!gatesOnBoard && p1Gates === 0 && p2Gates === 0) {
//     return { finished: true, winner: null, loser: null, reason: 'NO_GATES' }
//   }

//   return { finished: false, winner: null, loser: null }
// }

export const getGameResult = (roomState: stateType): GameResult => {
  if (!roomState) return { finished: false, winner: null, loser: null }

  if (roomState.battleState.battleInProcess) {
    return { finished: false, winner: null, loser: null }
  }

  const state = structuredClone(roomState)

  const [p1, p2] = state.players

  const getAlive = (userId: string) => {
    const deck = state.decksState.find(d => d.userId === userId)

    const deckAlive = deck?.bakugans.filter(b => b.bakuganData.elimined === false).length ?? 0

    return deckAlive
  }

  const p1Alive = getAlive(p1.userId)
  const p2Alive = getAlive(p2.userId)

  if (p1Alive === 0 && p2Alive > 0) {
    return { finished: true, winner: p2.userId, loser: p1.userId, reason: 'NO_BAKUGAN' }
  }

  if (p2Alive === 0 && p1Alive > 0) {
    return { finished: true, winner: p1.userId, loser: p2.userId, reason: 'NO_BAKUGAN' }
  }

  if (p1Alive === 0 && p2Alive === 0) {
    return { finished: true, winner: null, loser: null, reason: 'DRAW' }
  }

  const gatesOnBoard = state.protalSlots.some(s => s.portalCard !== null)
  const p1Gates = p1.usable_gates
  const p2Gates = p2.usable_gates

  if (!gatesOnBoard && p1Gates === 0 && p2Gates === 0) {
    return { finished: true, winner: null, loser: null, reason: 'NO_GATES' }
  }

  return { finished: false, winner: null, loser: null }
}

const finishingRooms = new Set<string>()


export const CheckGameFinished = async ({
  io,
  roomId,
  roomState,
}: {
  roomId: string
  roomState: stateType
  io: Server
}) => {
  // 🚫 déjà fini
  if (!roomState || roomState.status.finished) return

  // 🔒 LOCK
  if (finishingRooms.has(roomId)) return
  finishingRooms.add(roomId)

  try {
    const result = getGameResult(roomState)

    if (!result.finished) return

    const [p1, p2] = roomState.players

    // 🧠 update mémoire FIRST (source de vérité)
    roomState.status.finished = true
    roomState.status.winner = result.winner

    // 💾 DB

    if (result.winner && result.loser) {
      await db
        .update(rooms)
        .set({
          winner: result.winner,
          looser: result.loser,
          finished: true,
        })
        .where(eq(rooms.id, roomId))
    } else {
      await db
        .update(rooms)
        .set({
          finished: true,
        })
        .where(eq(rooms.id, roomId))
    }

    if (result.reason === 'DRAW' || result.reason === 'NO_GATES') {
      const message: Message = {
        text: 'Game is over ! Equality !',
        turn: roomState.turnState.turnCount
      }

      io.to(roomId).emit('game-finished', message)
      for (const user of roomState.connectedsUsers.values()) {
        io.to(user.nextjsSocket).emit('game-messages', [message])
      }

      roomState.messages.push(message)

    }

    // ⚡ ELO
    if (result.winner) {
      const loser = result.winner === p1.userId ? p2.userId : p1.userId

      await CalculateAndUpdateElo({
        loser,
        winner: result.winner,
        roomData: roomState,
        io,
        roomId,
      })
    }

    // 🔄 refresh rooms

    roomState.players.forEach((user) => {
      SendUserRooms({ userId: user.userId, io })
    })


  } catch (err) {
    console.error("CheckGameFinished error", err)
  } finally {
    // 🔓 UNLOCK
    finishingRooms.delete(roomId)
  }
}