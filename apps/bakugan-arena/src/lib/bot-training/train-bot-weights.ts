import {
  BakuganList,
  GateCardsList,
  type AnimationDirectivesTypes,
  type bakuganOnSlot,
  type replayDataType,
  type replayEntryType,
  type replaySnapshotType,
} from "@bakugan-arena/game-data"
import {
  DEFAULT_BOT_SCORE_WEIGHTS,
  clampBotScoreWeights,
  lerpBotScoreWeights,
  mergeBotScoreWeights,
  type BotScoreWeightKey,
  type BotScoreWeights,
  type BotTrainingMetrics,
} from "@bakugan-arena/drizzle-orm"

const DECISION_ANIMATION_TYPES = new Set([
  "SET_GATE_CARD",
  "SET_BAKUGAN",
  "SET_BAKUGAN_AND_ADD_RENFORT",
  "OPEN_GATE_CARD",
  "ACTIVE_ABILITY_CARD",
  "CHANGE_ATTRIBUT",
])

type FeatureStats = Record<BotScoreWeightKey, { hits: number; trials: number }>

function emptyStats(): FeatureStats {
  const keys = Object.keys(DEFAULT_BOT_SCORE_WEIGHTS) as BotScoreWeightKey[]
  return Object.fromEntries(keys.map((k) => [k, { hits: 0, trials: 0 }])) as FeatureStats
}

function observe(stats: FeatureStats, key: BotScoreWeightKey, hit: boolean) {
  stats[key].trials += 1
  if (hit) stats[key].hits += 1
}

function sumPower(bakugans: bakuganOnSlot[], userId: string): number {
  return bakugans
    .filter((b) => b.userId === userId)
    .reduce((acc, b) => acc + (b.currentPower ?? 0), 0)
}

function getOpponentId(snapshot: replaySnapshotType, userId: string): string | undefined {
  const ids = new Set<string>()
  for (const deck of snapshot.decksState) {
    if (deck.userId) ids.add(deck.userId)
  }
  for (const slot of snapshot.portalSlots) {
    for (const b of slot.bakugans) ids.add(b.userId)
    if (slot.portalCard?.userId) ids.add(slot.portalCard.userId)
  }
  return [...ids].find((id) => id !== userId)
}

function isReactorGate(gateKey: string): boolean {
  return gateKey.startsWith("reacteur-")
}

function findBakuganFamily(key: string): string | undefined {
  return BakuganList.find((b) => b.key === key)?.family
}

function actorFromEntry(entry: replayEntryType): string | undefined {
  return entry.stateBefore.turnState.turn || undefined
}

function isBattle(snapshot: replaySnapshotType): boolean {
  return snapshot.battleState.battleInProcess === true && snapshot.battleState.paused !== true
}

function battleSlot(snapshot: replaySnapshotType) {
  const slotId = snapshot.battleState.slot
  if (!slotId) return undefined
  return snapshot.portalSlots.find((s) => s.id === slotId)
}

function analyzeDecision(
  stats: FeatureStats,
  entry: replayEntryType,
  userId: string,
  animation: AnimationDirectivesTypes
) {
  const before = entry.stateBefore
  const after = entry.stateAfter
  const opponentId = getOpponentId(after, userId)

  if (animation.type === "SET_GATE_CARD") {
    observe(stats, "setGatePlacementBonus", true)
    const gateKey = animation.data.slot.portalCard?.key
    if (gateKey) {
      const gate = GateCardsList.find((g) => g.key === gateKey)
      if (gate?.family) {
        const deck = before.decksState.find((d) => d.userId === userId)
        const hasAvailable = (deck?.bakugans ?? []).some(
          (b) =>
            b.bakuganData.family === gate.family &&
            !b.bakuganData.elimined &&
            !b.bakuganData.onDomain
        )
        observe(stats, "characterGateSetBonus", hasAvailable)
        observe(stats, "characterGateMismatchPenalty", !hasAvailable)
      }
    }
  }

  if (
    animation.type === "SET_BAKUGAN" ||
    animation.type === "SET_BAKUGAN_AND_ADD_RENFORT"
  ) {
    const bakugan = animation.data.bakugan
    const slot = after.portalSlots.find((s) => s.id === animation.data.slot.id) ?? animation.data.slot
    const gateKey = slot.portalCard?.key
    if (gateKey && bakugan.userId === userId) {
      const gate = GateCardsList.find((g) => g.key === gateKey)
      const family = findBakuganFamily(bakugan.key)
      if (gate?.family && family) {
        observe(stats, "characterBakuganMatchBonus", gate.family === family)
        observe(stats, "characterGateMismatchPenalty", gate.family !== family)
      }
      if (isReactorGate(gateKey)) {
        const reactorAttr = gateKey.replace("reacteur-", "").toLowerCase()
        observe(
          stats,
          "reactorBakuganMatchBonus",
          bakugan.attribut.toLowerCase() === reactorAttr
        )
      }
    }
  }

  if (animation.type === "OPEN_GATE_CARD" || animation.type === "ACTIVE_ABILITY_CARD") {
    if (isBattle(after) && opponentId) {
      const slot = battleSlot(after)
      if (slot) {
        const botPower = sumPower(slot.bakugans, userId)
        const oppPower = sumPower(slot.bakugans, opponentId)
        observe(stats, "powerLeadPoints", botPower > oppPower)

        const beforeSlot = battleSlot(before) ?? slot
        const beforeBot = sumPower(beforeSlot.bakugans, userId)
        const beforeOpp = sumPower(beforeSlot.bakugans, opponentId)
        const wasLeading = beforeBot > beforeOpp
        if (animation.type === "ACTIVE_ABILITY_CARD" && wasLeading) {
          observe(stats, "abilityWasteWhileLeading", true)
          if ((before.battleState.turns ?? 0) >= 2) {
            observe(stats, "abilityWasteTurnTwoLeading", true)
          }
        }
      }
    }

    if (animation.type === "ACTIVE_ABILITY_CARD") {
      const alliedBefore = before.portalSlots.flatMap((s) =>
        s.bakugans.filter((b) => b.userId === userId)
      )
      const alliedAfter = after.portalSlots.flatMap((s) =>
        s.bakugans.filter((b) => b.userId === userId)
      )
      if (alliedBefore.length > 0 && alliedBefore.length === alliedAfter.length) {
        const allUp = alliedBefore.every((b) => {
          const next = alliedAfter.find((a) => a.key === b.key && a.userId === b.userId)
          return next != null && (next.currentPower ?? 0) >= (b.currentPower ?? 0)
        })
        const anyUp = alliedBefore.some((b) => {
          const next = alliedAfter.find((a) => a.key === b.key && a.userId === b.userId)
          return next != null && (next.currentPower ?? 0) > (b.currentPower ?? 0)
        })
        observe(stats, "alliedPowerUpPoints", allUp && anyUp)
      }
    }

    if (animation.type === "OPEN_GATE_CARD") {
      const gateKey =
        after.portalSlots.find((s) => s.id === animation.data.slotId)?.portalCard?.key ??
        animation.data.slot.portalCard?.key
      if (gateKey === "echange" && opponentId) {
        const slot = battleSlot(after) ?? after.portalSlots.find((s) => s.id === animation.data.slotId)
        if (slot) {
          const total = sumPower(slot.bakugans, userId)
          observe(stats, "tradeOffOverCapPenalty", total >= DEFAULT_BOT_SCORE_WEIGHTS.tradeOffPowerCap)
        }
      }
      if (gateKey === "super-pyrus" && opponentId) {
        const slot =
          battleSlot(after) ?? after.portalSlots.find((s) => s.id === animation.data.slotId)
        if (slot) {
          const botPower = sumPower(slot.bakugans, userId)
          const oppPower = sumPower(slot.bakugans, opponentId)
          observe(stats, "superPyrusBadOpenPenalty", oppPower > botPower)
        }
      }
    }
  }

  if (animation.type === "CHANGE_ATTRIBUT") {
    // Decision tracked for volume metrics only (no dedicated weight signal).
  }
}

export function collectTrainingStats(
  replays: Array<{ replayData: replayDataType; learnFromUserId: string }>
): { stats: FeatureStats; decisionsAnalyzed: number; replaysUsed: number } {
  const stats = emptyStats()
  let decisionsAnalyzed = 0
  let replaysUsed = 0

  for (const item of replays) {
    const { replayData, learnFromUserId } = item
    if (!replayData?.replay?.length || !learnFromUserId) continue
    replaysUsed += 1

    for (const entry of replayData.replay) {
      if (!entry.animation) continue
      if (!DECISION_ANIMATION_TYPES.has(entry.animation.type)) continue
      const actor = actorFromEntry(entry)
      if (!actor || actor !== learnFromUserId) continue
      analyzeDecision(stats, entry, learnFromUserId, entry.animation)
      decisionsAnalyzed += 1
    }
  }

  return { stats, decisionsAnalyzed, replaysUsed }
}

/**
 * Transforme les stats d'observation en nouveaux poids :
 * - bonus : plus souvent observé chez le joueur cible → poids plus élevé
 * - pénalité : plus souvent déclenchée par le joueur cible → pénalité adoucie
 */
export function statsToTargetWeights(stats: FeatureStats): BotScoreWeights {
  const base = mergeBotScoreWeights()
  const target = { ...base }

  for (const key of Object.keys(base) as BotScoreWeightKey[]) {
    const { hits, trials } = stats[key]
    if (trials < 3) continue

    const rate = hits / trials
    const defaultValue = DEFAULT_BOT_SCORE_WEIGHTS[key]

    if (key === "tradeOffPowerCap") {
      // Cap : si souvent au-dessus, remonter légèrement le seuil appris
      target[key] = defaultValue + (rate - 0.5) * 80
      continue
    }

    if (defaultValue < 0) {
      // Pénalité : hits fréquents chez le modèle → assouplir
      const scale = 1.4 - rate
      target[key] = defaultValue * scale
    } else {
      const scale = 0.55 + rate
      target[key] = defaultValue * scale
    }
  }

  return clampBotScoreWeights(target)
}

export function trainBotScoreWeights(params: {
  replays: Array<{ replayData: replayDataType; learnFromUserId: string }>
  baseWeights?: BotScoreWeights | null
  blend?: number
}): { weights: BotScoreWeights; metrics: BotTrainingMetrics } {
  const { stats, decisionsAnalyzed, replaysUsed } = collectTrainingStats(params.replays)
  const target = statsToTargetWeights(stats)
  const base = mergeBotScoreWeights(params.baseWeights)
  const blend = params.blend ?? 0.45
  const weights = lerpBotScoreWeights(base, target, blend)

  const featureRates: BotTrainingMetrics["featureRates"] = {}
  for (const key of Object.keys(stats) as BotScoreWeightKey[]) {
    const { hits, trials } = stats[key]
    if (trials === 0) continue
    featureRates[key] = { hits, trials, rate: hits / trials }
  }

  return {
    weights,
    metrics: {
      replaysUsed,
      decisionsAnalyzed,
      featureRates,
    },
  }
}
