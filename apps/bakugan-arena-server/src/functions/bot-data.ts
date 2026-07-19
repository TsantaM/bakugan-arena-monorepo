import { decodeDeckCode } from "./share-deck-decode"

export type BotAccount = {
  userId: string
  email: string
  name: string
  displayUsername: string
  deckId: string
  deckName: string
  deckCode: string
}

export const BOT_ACCOUNTS: BotAccount[] = [
  {
    userId: "bot-alpha",
    email: "bot-alpha@bot.bakugan",
    name: "Bot Alpha",
    displayUsername: "Bot Alpha",
    deckId: "00000000-0000-0000-0000-000000000001",
    deckName: "Alpha Strike",
    deckCode: "NrBsEYBoBYE5IMwHYC6lgCZJQZJlRIAGNYORHcUjIyADmy0NRSA"
  },
  {
    userId: "bot-omega",
    email: "bot-omega@bot.bakugan",
    name: "Bot Omega",
    displayUsername: "Bot Omega",
    deckId: "00000000-0000-0000-0000-000000000002",
    deckName: "Omega Assault",
    deckCode: "NrBsEYBoBYE5IMwHYC6lgCZJQZJlRIAGNYORHcUjIyADmy0NRSA"
  },
  {
    userId: "bot-sigma",
    email: "bot-sigma@bot.bakugan",
    name: "Bot Sigma",
    displayUsername: "Bot Sigma",
    deckId: "00000000-0000-0000-0000-000000000003",
    deckName: "Sigma Tempest",
    deckCode: "NrBsEYBoBYE5IMwHYC6lgCZJQZJlRIAGNYORHcUjIyADmy0NRSA"
  }
]

export const getBotByUserId = (userId: string) => {
  return BOT_ACCOUNTS.find((bot) => bot.userId === userId)
}

export const isBotUserId = (userId: string) => {
  return BOT_ACCOUNTS.some((bot) => bot.userId === userId)
}

export const getBotDeckByUserId = (userId: string) => {
  const bot = getBotByUserId(userId)
  if (!bot) return undefined

  const decodedDeck = decodeDeckCode(bot.deckCode)
  if (!decodedDeck) return undefined

  return {
    id: bot.deckId,
    userId: bot.userId,
    ...decodedDeck
  }
}

export const getBotPlayerByUserId = (userId: string) => {
  const bot = getBotByUserId(userId)
  if (!bot) return undefined

  return {
    id: bot.userId,
    displayUsername: bot.displayUsername
  }
}
