import {
  LEARNABLE_SIGNAL_PREFIX,
  isHarmfulLearnableEffect,
  isPhaseWeightKey,
  isPrefWeightKey,
  PHASE_WEIGHT_PREFIX,
} from "@bakugan-arena/game-data"

export { LEARNABLE_SIGNAL_PREFIX }

/** Poids numériques du scorer bot (heuristiques + signaux appris dyn:/ph:/pref:). */
export type BotScoreWeights = Record<string, number>

export type BotScoreWeightKey = string

export type BotTrainingMetrics = {
  replaysUsed: number
  decisionsAnalyzed: number
  winsUsed: number
  lossesUsed: number
  featureRates: Partial<
    Record<BotScoreWeightKey, { hits: number; trials: number; rate: number }>
  >
}

export const DEFAULT_BOT_SCORE_WEIGHTS: BotScoreWeights = {
  powerLeadPoints: 1,
  gateNeutralizePoints: 1,
  opponentBlockedPoints: 1.5,
  opponentNoAbilityPoints: 1,
  alliedPowerUpPoints: 1,
  freeElimPoints: 1.5,
  turnSkipSavePoints: 2,
  characterGateSetBonus: 2,
  characterBakuganMatchBonus: 2,
  reactorBakuganMatchBonus: 1,
  characterGateMismatchPenalty: -1,
  setGatePlacementBonus: 1,
  abilityWasteWhileLeading: -1.5,
  abilityWasteTurnTwoLeading: -2,
  tradeOffOverCapPenalty: -2,
  superPyrusBadOpenPenalty: -2,
  tradeOffPowerCap: 400,
  personalityMultiplier: 1.5,
}

/** Valeur de base pour un signal `dyn:` nouvellement découvert à l'entraînement. */
export const DEFAULT_DYNAMIC_WEIGHT = 0.75
export const DEFAULT_DYNAMIC_PENALTY = -0.75
export const DEFAULT_PREF_WEIGHT = 0.55

const CLAMP: Record<string, { min: number; max: number }> = {
  powerLeadPoints: { min: 0.25, max: 3 },
  gateNeutralizePoints: { min: 0.25, max: 3 },
  opponentBlockedPoints: { min: 0.25, max: 3 },
  opponentNoAbilityPoints: { min: 0.25, max: 3 },
  alliedPowerUpPoints: { min: 0.25, max: 3 },
  freeElimPoints: { min: 0.25, max: 3 },
  turnSkipSavePoints: { min: 0.5, max: 4 },
  characterGateSetBonus: { min: 0.5, max: 4 },
  characterBakuganMatchBonus: { min: 0.5, max: 4 },
  reactorBakuganMatchBonus: { min: 0.25, max: 3 },
  characterGateMismatchPenalty: { min: -3, max: -0.25 },
  setGatePlacementBonus: { min: 0.25, max: 3 },
  abilityWasteWhileLeading: { min: -4, max: -0.25 },
  abilityWasteTurnTwoLeading: { min: -4, max: -0.25 },
  tradeOffOverCapPenalty: { min: -4, max: -0.25 },
  superPyrusBadOpenPenalty: { min: -4, max: -0.25 },
  tradeOffPowerCap: { min: 200, max: 600 },
  personalityMultiplier: { min: 1.1, max: 2.2 },
}

const LEARNED_CLAMP = { min: -2.5, max: 3 }
const PREF_CLAMP = { min: 0.15, max: 2.2 }

export function isDynamicWeightKey(key: string): boolean {
  return key.startsWith(LEARNABLE_SIGNAL_PREFIX)
}

export function isLearnedWeightKey(key: string): boolean {
  return isDynamicWeightKey(key) || isPhaseWeightKey(key) || isPrefWeightKey(key)
}

export function defaultWeightForKey(key: string): number {
  if (key in DEFAULT_BOT_SCORE_WEIGHTS) {
    return DEFAULT_BOT_SCORE_WEIGHTS[key]!
  }
  if (isPhaseWeightKey(key)) {
    const baseKey = key.slice(PHASE_WEIGHT_PREFIX.length).split("|").slice(1).join("|")
    if (baseKey in DEFAULT_BOT_SCORE_WEIGHTS) {
      return DEFAULT_BOT_SCORE_WEIGHTS[baseKey]!
    }
  }
  if (isPrefWeightKey(key)) {
    return DEFAULT_PREF_WEIGHT
  }
  if (isDynamicWeightKey(key) && isHarmfulLearnableEffect(key)) {
    return DEFAULT_DYNAMIC_PENALTY
  }
  if (isDynamicWeightKey(key)) {
    return DEFAULT_DYNAMIC_WEIGHT
  }
  return DEFAULT_DYNAMIC_WEIGHT
}

export function mergeBotScoreWeights(
  partial?: Partial<BotScoreWeights> | null
): BotScoreWeights {
  const merged: BotScoreWeights = { ...DEFAULT_BOT_SCORE_WEIGHTS }
  if (!partial) return merged
  for (const [key, value] of Object.entries(partial)) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      merged[key] = value
    }
  }
  return merged
}

export function clampBotScoreWeights(weights: BotScoreWeights): BotScoreWeights {
  const next: BotScoreWeights = { ...weights }
  for (const key of Object.keys(next)) {
    const value = next[key]
    if (typeof value !== "number" || Number.isNaN(value)) {
      delete next[key]
      continue
    }
    let bounds = CLAMP[key] ?? null
    if (!bounds && isPrefWeightKey(key)) bounds = PREF_CLAMP
    if (!bounds && isLearnedWeightKey(key)) bounds = LEARNED_CLAMP
    if (!bounds) continue
    next[key] = Math.min(bounds.max, Math.max(bounds.min, value))
  }
  return next
}

export function lerpBotScoreWeights(
  from: BotScoreWeights,
  to: BotScoreWeights,
  t: number
): BotScoreWeights {
  const alpha = Math.min(1, Math.max(0, t))
  const keys = new Set([...Object.keys(from), ...Object.keys(to), ...Object.keys(DEFAULT_BOT_SCORE_WEIGHTS)])
  const out: BotScoreWeights = { ...from }
  for (const key of keys) {
    const a = from[key] ?? defaultWeightForKey(key)
    const b = to[key] ?? defaultWeightForKey(key)
    out[key] = a + (b - a) * alpha
  }
  return clampBotScoreWeights(out)
}

/**
 * Fusionne les poids `ph:phase|feature` dans les clés de feature courantes.
 * Le scorer historique lit toujours `powerLeadPoints`, etc.
 */
export function applyPhaseWeightOverlay(
  weights: BotScoreWeights,
  phase: string
): BotScoreWeights {
  const next: BotScoreWeights = { ...weights }
  const prefix = `${PHASE_WEIGHT_PREFIX}${phase}|`
  for (const [key, value] of Object.entries(weights)) {
    if (!key.startsWith(prefix) || typeof value !== "number") continue
    const baseKey = key.slice(prefix.length)
    const base = next[baseKey]
    if (typeof base === "number") {
      next[baseKey] = value * 0.65 + base * 0.35
    } else {
      next[baseKey] = value
    }
  }
  return clampBotScoreWeights(next)
}
