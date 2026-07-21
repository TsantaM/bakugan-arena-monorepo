/** Poids numériques du scorer bot (heuristiques de `score-action`). */
export type BotScoreWeights = {
  powerLeadPoints: number
  gateNeutralizePoints: number
  opponentBlockedPoints: number
  opponentNoAbilityPoints: number
  alliedPowerUpPoints: number
  freeElimPoints: number
  turnSkipSavePoints: number
  characterGateSetBonus: number
  characterBakuganMatchBonus: number
  reactorBakuganMatchBonus: number
  characterGateMismatchPenalty: number
  setGatePlacementBonus: number
  abilityWasteWhileLeading: number
  abilityWasteTurnTwoLeading: number
  tradeOffOverCapPenalty: number
  superPyrusBadOpenPenalty: number
  tradeOffPowerCap: number
  personalityMultiplier: number
}

export type BotScoreWeightKey = keyof BotScoreWeights

export type BotTrainingMetrics = {
  replaysUsed: number
  decisionsAnalyzed: number
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

const CLAMP: Partial<Record<BotScoreWeightKey, { min: number; max: number }>> = {
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

export function mergeBotScoreWeights(
  partial?: Partial<BotScoreWeights> | null
): BotScoreWeights {
  return { ...DEFAULT_BOT_SCORE_WEIGHTS, ...(partial ?? {}) }
}

export function clampBotScoreWeights(weights: BotScoreWeights): BotScoreWeights {
  const next = { ...weights }
  for (const key of Object.keys(CLAMP) as BotScoreWeightKey[]) {
    const bounds = CLAMP[key]
    if (!bounds) continue
    next[key] = Math.min(bounds.max, Math.max(bounds.min, next[key]))
  }
  return next
}

export function lerpBotScoreWeights(
  from: BotScoreWeights,
  to: BotScoreWeights,
  t: number
): BotScoreWeights {
  const alpha = Math.min(1, Math.max(0, t))
  const keys = Object.keys(DEFAULT_BOT_SCORE_WEIGHTS) as BotScoreWeightKey[]
  const out = { ...from }
  for (const key of keys) {
    out[key] = from[key] + (to[key] - from[key]) * alpha
  }
  return clampBotScoreWeights(out)
}
