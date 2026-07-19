import { db } from "../lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq } from "drizzle-orm"
import { connectedUsers, Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import { BOT_ACCOUNTS, getBotDeckByUserId, isBotUserId as isBotUserIdFromData } from "./bot-data"
import { decodeDeckCode } from "./share-deck-decode"

const users = schema.user
const decks = schema.deck

export const getBotDeckId = (userId: string) => {
  return getBotDeckByUserId(userId)?.id
}

export const isBotUserId = (userId: string) => isBotUserIdFromData(userId)

export const initializeBots = async () => {
  for (const bot of BOT_ACCOUNTS) {
    const existingBot = await db.query.user.findFirst({
      where: (u) => eq(u.id, bot.userId),
      columns: { id: true }
    })

    if (!existingBot) {
      await db.insert(users).values({
        id: bot.userId,
        name: bot.name,
        email: bot.email,
        username: bot.userId,
        displayUsername: bot.displayUsername,
        elo: 1000
      })
    }

    const existingDeck = await db.query.deck.findFirst({
      where: (d) => eq(d.id, bot.deckId),
      columns: { id: true }
    })

    if (!existingDeck) {
      const decodedDeck = decodeDeckCode(bot.deckCode)
      if (!decodedDeck) continue

      await db.insert(decks).values({
        id: bot.deckId,
        name: bot.deckName,
        userId: bot.userId,
        bakugans: decodedDeck.bakugans,
        ability: decodedDeck.ability,
        exclusiveAbilities: decodedDeck.exclusiveAbilities,
        gateCards: decodedDeck.gateCards
      })
    }
  }
}

const isBotBusy = (userId: string) => {
  return Battle_Brawlers_Game_State.some(
    (room) => room && !room.status.finished && room.players.some((player) => player.userId === userId)
  )
}

export const getAvailableBot = async ({ ranked }: { ranked: boolean }) => {
  void ranked

  const botCandidates = BOT_ACCOUNTS.filter((bot) => {
    if (isBotBusy(bot.userId)) return false
    if (connectedUsers.find((connected) => connected.userId === bot.userId) === undefined) return false
    return true
  })

  if (botCandidates.length === 0) return undefined

  return botCandidates[Math.floor(Math.random() * botCandidates.length)]
}

export const getBotSocketId = (userId: string) => {
  const connected = connectedUsers.find((user) => user.userId === userId)
  return connected?.socketId
}
