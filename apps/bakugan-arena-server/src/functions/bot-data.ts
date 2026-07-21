import { decodeDeckCode, type DecodedDeckType } from "./share-deck-decode"

/**
 * Personnalités IA — chaque trait applique ×1.5 sur les coups qui matchent.
 * Un bot peut cumuler plusieurs traits.
 */
export type personalities =
  | "rush_down"
  | "zoner"
  | "blocker"
  | "setup"
  | "finisher"
  | "control"

export type BotAccount = {
  userId: string
  email: string
  name: string
  displayUsername: string
  /**
   * Un ou plusieurs deck codes (coller autant de strings que voulu).
   * Chaque code devient un deck en base au boot.
   */
  deckCode: string[]
  /** Traits de personnalité (typo historique conservée) */
  persolaty: personalities[]
}

export type BotDeckDefinition = {
  id: string
  name: string
  code: string
  userId: string
}

/** Deck résolu (décodé) prêt pour createGameState / getDecksData */
export type BotResolvedDeck = {
  id: string
  userId: string
} & DecodedDeckType


const makeDeckId = (botIndex: number, deckIndex: number): string => {
  const n = botIndex * 100 + deckIndex + 1
  return `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`
}

export const BOT_ACCOUNTS: BotAccount[] = [
  {
    userId: "bot-alpha",
    email: "lucas.martin@bot.bakugan",
    name: "Lucas Martin",
    displayUsername: "BlazeCore",
    deckCode: ["NrBsEYBoBYE5IMwHYC6lgCZJQZJlRIAGNYORHcUjIyADmy0NRSA"],
    persolaty: ["rush_down"],
  },
  {
    userId: "bot-omega",
    email: "emma.durand@bot.bakugan",
    name: "Emma Durand",
    displayUsername: "VoidKite",
    deckCode: ["NrBsBoBYIZgVgLrmATnARgAzgBwcvhjEmODNgEygnoHroYVlroDsCCQA"],
    persolaty: ["zoner"],
  },
  {
    userId: "bot-sigma",
    email: "noah.bernard@bot.bakugan",
    name: "Noah Bernard",
    displayUsername: "IronNull",
    deckCode: ["NrBsBoBYIZgVgLrmATnARgAzgBwcvhjEmODNgEygnoHroYVlroDsCCQA"],
    persolaty: ["blocker"],
  },
  {
    userId: "bot-delta",
    email: "lea.petit@bot.bakugan",
    name: "Léa Petit",
    displayUsername: "GateWeaver",
    deckCode: ["NrDsBoBYE5wJgAwF1zAeAjPcBmFwN0ctj8A2cCDLDCOSJJIA", "NrCMBoGYCZwVkgXXMSAWKdNQOzjQAxRIoZqwzLABs4oRAnHbGqIokA"],
    persolaty: ["setup"],
  },
  {
    userId: "bot-nova",
    email: "hugo.moreau@bot.bakugan",
    name: "Hugo Moreau",
    displayUsername: "KillShot",
    deckCode: ["NrCsHYBoCZsg2ALAXUsaAOGBOSBmARnwAYSYNVhFFJQ5Q9L5ICa8pdRlkg", "NrDMBoFYA5wFgIwF1zAZcCCcmBsmB2cAJgRIAYVgM59joqEzj8E5MMskkg"],
    persolaty: ["finisher"],
  },
  {
    userId: "bot-phantom",
    email: "chloe.roux@bot.bakugan",
    name: "Chloé Roux",
    displayUsername: "SilentHex",
    deckCode: ["NrCsCYBpwZkgWAupY4q2vadwDZqjLAwCckAjKNEfFeeRVlLookA", "NrDMBoFYA5wFgIwF1zAZcCCcmBsmB2cAJgRIAYVgM59joqEzj8E5MMskkg"],
    persolaty: ["control"],
  },
  {
    userId: "bot-titan",
    email: "maxime.garcia@bot.bakugan",
    name: "Maxime Garcia",
    displayUsername: "StormForge",
    deckCode: ["NrBsCYBoFYA4YCwF1LAIzUm0lwAYsB2XNSBAZhWArJ2mivBzVLQUgE4sGkg"],
    persolaty: ["rush_down", "setup"],
  },
  {
    userId: "bot-shade",
    email: "ines.laurent@bot.bakugan",
    name: "Inès Laurent",
    displayUsername: "Lockshade",
    deckCode: ["NrBsBoBYIZgVgLrmATnARgAzgBwcvhjEmODNgEygnoHroYVlroDsCCQA"],
    persolaty: ["blocker", "control"],
  },
  {
    userId: "bot-drift",
    email: "jules.simon@bot.bakugan",
    name: "Jules Simon",
    displayUsername: "DriftFang",
    deckCode: ['NrDMCYBoFZUg2A7AXUmALJU0uMugBizlHlWHSkJnXPkgEYiBOfBxh5ZIA', "NrCMBoGYCZwVkgXXMSAWKdNQOzjQAxRIoZqwzLABs4oRAnHbGqIokA"],
    persolaty: ["zoner", "finisher"],
  },
]

export const getBotByUserId = (userId: string) => {
  return BOT_ACCOUNTS.find((bot) => bot.userId === userId)
}

export const isBotUserId = (userId: string) => {
  return BOT_ACCOUNTS.some((bot) => bot.userId === userId)
}

/** Liste des decks d'un bot (id stables dérivés de l'index). */
export const getBotDeckDefinitions = (bot: BotAccount): BotDeckDefinition[] => {
  const botIndex = BOT_ACCOUNTS.findIndex((b) => b.userId === bot.userId)
  if (botIndex === -1) return []

  return bot.deckCode
    .map((code, deckIndex) => {
      const trimmed = code.trim()
      if (!trimmed) return null
      return {
        id: makeDeckId(botIndex, deckIndex),
        name: `${bot.displayUsername} — Deck ${deckIndex + 1}`,
        code: trimmed,
        userId: bot.userId,
      }
    })
    .filter((d): d is BotDeckDefinition => d !== null)
}

const resolveDeckDefinition = (
  def: BotDeckDefinition
): BotResolvedDeck | undefined => {
  const decoded = decodeDeckCode(def.code)
  if (!decoded) return undefined
  return {
    id: def.id,
    userId: def.userId,
    ...decoded,
  }
}

/** Tous les decks résolus d'un bot. */
export const getBotDecksByUserId = (userId: string): BotResolvedDeck[] => {
  const bot = getBotByUserId(userId)
  if (!bot) return []
  return getBotDeckDefinitions(bot)
    .map(resolveDeckDefinition)
    .filter((d): d is BotResolvedDeck => d !== undefined)
}

/** Un deck précis par id (parmi tous les bots). */
export const getBotDeckById = (deckId: string): BotResolvedDeck | undefined => {
  for (const bot of BOT_ACCOUNTS) {
    const def = getBotDeckDefinitions(bot).find((d) => d.id === deckId)
    if (def) return resolveDeckDefinition(def)
  }
  return undefined
}

/**
 * Deck d'un bot : `deckId` si fourni, sinon un deck au hasard.
 */
export const getBotDeckByUserId = (
  userId: string,
  deckId?: string
): BotResolvedDeck | undefined => {
  if (deckId) {
    const byId = getBotDeckById(deckId)
    if (byId && byId.userId === userId) return byId
  }

  const decks = getBotDecksByUserId(userId)
  if (decks.length === 0) return undefined
  return decks[Math.floor(Math.random() * decks.length)]
}

/** Tirage aléatoire d'un deck (définition) pour le matchmaking. */
export const pickRandomBotDeck = (
  bot: BotAccount
): BotDeckDefinition | undefined => {
  const defs = getBotDeckDefinitions(bot)
  if (defs.length === 0) return undefined
  return defs[Math.floor(Math.random() * defs.length)]
}

export const getBotPlayerByUserId = (userId: string) => {
  const bot = getBotByUserId(userId)
  if (!bot) return undefined

  return {
    id: bot.userId,
    displayUsername: bot.displayUsername,
  }
}
