import { db } from "../lib/db"
import { schema } from "@bakugan-arena/drizzle-orm"
import { eq } from "drizzle-orm"
import { connectedUsers, Battle_Brawlers_Game_State } from "../game-state/battle-brawlers-game-state"
import {
  BOT_ACCOUNTS,
  getBotDeckByUserId,
  getBotDeckDefinitions,
  isBotUserId as isBotUserIdFromData,
  pickRandomBotDeck,
  type BotAccount,
} from "./bot-data"
import { decodeDeckCode } from "./share-deck-decode"

const users = schema.user
const decks = schema.deck

/** Bot matchable + deck choisi pour la partie */
export type AvailableBot = BotAccount & {
  deckId: string
  deckName: string
}

export const getBotDeckId = (userId: string) => {
  return getBotDeckByUserId(userId)?.id
}

export const isBotUserId = (userId: string) => isBotUserIdFromData(userId)

export const initializeBots = async () => {
  for (const bot of BOT_ACCOUNTS) {
    const existingBot = await db.query.user.findFirst({
      where: (u) => eq(u.id, bot.userId),
      columns: { id: true },
    })

    if (!existingBot) {
      await db.insert(users).values({
        id: bot.userId,
        name: bot.name,
        email: bot.email,
        username: bot.userId,
        displayUsername: bot.displayUsername,
        elo: 1000,
      })
    } else {
      // Met à jour le display humanisé si le bot existait déjà
      await db
        .update(users)
        .set({
          name: bot.name,
          email: bot.email,
          displayUsername: bot.displayUsername,
        })
        .where(eq(users.id, bot.userId))
    }

    for (const deckDef of getBotDeckDefinitions(bot)) {
      const existingDeck = await db.query.deck.findFirst({
        where: (d) => eq(d.id, deckDef.id),
        columns: { id: true },
      })

      const decodedDeck = decodeDeckCode(deckDef.code)
      if (!decodedDeck) {
        console.warn(
          `[BOT] Invalid deck code for ${bot.userId} / ${deckDef.name}, skipped`
        )
        continue
      }

      if (!existingDeck) {
        await db.insert(decks).values({
          id: deckDef.id,
          name: deckDef.name,
          userId: bot.userId,
          bakugans: decodedDeck.bakugans,
          ability: decodedDeck.ability,
          exclusiveAbilities: decodedDeck.exclusiveAbilities,
          gateCards: decodedDeck.gateCards,
        })
      } else {
        await db
          .update(decks)
          .set({
            name: deckDef.name,
            bakugans: decodedDeck.bakugans,
            ability: decodedDeck.ability,
            exclusiveAbilities: decodedDeck.exclusiveAbilities,
            gateCards: decodedDeck.gateCards,
          })
          .where(eq(decks.id, deckDef.id))
      }
    }
  }
}

const isBotBusy = (userId: string) => {
  return Battle_Brawlers_Game_State.some(
    (room) =>
      room &&
      !room.status.finished &&
      room.players.some((player) => player.userId === userId)
  )
}

export const getAvailableBot = async ({
  ranked,
}: {
  ranked: boolean
}): Promise<AvailableBot | undefined> => {
  void ranked

  const botCandidates = BOT_ACCOUNTS.filter((bot) => {
    if (isBotBusy(bot.userId)) return false
    if (connectedUsers.find((c) => c.userId === bot.userId) === undefined) return false
    if (getBotDeckDefinitions(bot).length === 0) return false
    return true
  })

  if (botCandidates.length === 0) return undefined

  const bot = botCandidates[Math.floor(Math.random() * botCandidates.length)]!
  const deck = pickRandomBotDeck(bot)
  if (!deck) return undefined

  console.log(
    `[BOT] matchmaking pick ${bot.userId} deck="${deck.name}" (${getBotDeckDefinitions(bot).length} deck(s) available)`
  )

  return {
    ...bot,
    deckId: deck.id,
    deckName: deck.name,
  }
}

export const getBotSocketId = (userId: string) => {
  const connected = connectedUsers.find((user) => user.userId === userId)
  return connected?.socketId
}
