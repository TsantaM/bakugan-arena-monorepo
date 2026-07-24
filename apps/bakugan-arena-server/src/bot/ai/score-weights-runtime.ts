import {
  DEFAULT_BOT_SCORE_WEIGHTS,
  mergeBotScoreWeights,
  type BotScoreWeights,
} from "@bakugan-arena/drizzle-orm"
import { eq } from "drizzle-orm"
import { schema } from "@bakugan-arena/drizzle-orm"
import { AsyncLocalStorage } from "node:async_hooks"
import { db } from "../../lib/db"

const REFRESH_MS = 60_000

let cachedWeights: BotScoreWeights = { ...DEFAULT_BOT_SCORE_WEIGHTS }
let lastRefreshAt = 0
let refreshInFlight: Promise<void> | null = null

const weightOverride = new AsyncLocalStorage<BotScoreWeights>()

/** Poids actifs : override d'évaluation (adaptation match) ou cache DB. */
export function getScoreWeights(): BotScoreWeights {
  return weightOverride.getStore() ?? cachedWeights
}

/** Poids de base (DB / défaut), sans adaptation match. */
export function getBaseScoreWeights(): BotScoreWeights {
  return cachedWeights
}

export function runWithScoreWeights<T>(weights: BotScoreWeights, fn: () => T): T {
  return weightOverride.run(weights, fn)
}

export async function refreshScoreWeightsFromDb(force = false): Promise<BotScoreWeights> {
  const now = Date.now()
  if (!force && now - lastRefreshAt < REFRESH_MS) {
    return cachedWeights
  }

  if (refreshInFlight) {
    await refreshInFlight
    return cachedWeights
  }

  refreshInFlight = (async () => {
    try {
      const active = await db.query.botScoreWeights.findFirst({
        where: eq(schema.botScoreWeights.isActive, true),
        orderBy: (row, { desc }) => [desc(row.createdAt)],
      })

      cachedWeights = mergeBotScoreWeights(active?.weights)
      lastRefreshAt = Date.now()
    } catch (error) {
      console.error("[bot-weights] Failed to refresh score weights:", error)
    } finally {
      refreshInFlight = null
    }
  })()

  await refreshInFlight
  return cachedWeights
}

export function startScoreWeightsPolling(): void {
  void refreshScoreWeightsFromDb(true)
  setInterval(() => {
    void refreshScoreWeightsFromDb(true)
  }, REFRESH_MS)
}
