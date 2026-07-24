import {
  BakuganList,
  GateCardsList,
  boardFromReplaySnapshot,
  collectLearnableSignalObservations,
  isPhaseWeightKey,
  isPrefWeightKey,
  phaseWeightKey,
  prefWeightKey,
  resolveBotTrainingPhase,
  type AnimationDirectivesTypes,
  type bakuganOnSlot,
  type BotTrainingPhase,
  type replayDataType,
  type replayEntryType,
  type replaySnapshotType,
} from "@bakugan-arena/game-data"
import {
  DEFAULT_BOT_SCORE_WEIGHTS,
  clampBotScoreWeights,
  defaultWeightForKey,
  isDynamicWeightKey,
  isLearnedWeightKey,
  lerpBotScoreWeights,
  mergeBotScoreWeights,
  type BotScoreWeightKey,
  type BotScoreWeights,
  type BotTrainingMetrics,
} from "@bakugan-arena/drizzle-orm"

const DECISION_ANIMATION_TYPES = [
  "SET_GATE_CARD",
  "SET_BAKUGAN",
  "SET_BAKUGAN_AND_ADD_RENFORT",
  "OPEN_GATE_CARD",
  "ACTIVE_ABILITY_CARD",
  "CHANGE_ATTRIBUT",
] as const

const DECISION_ANIMATION_TYPE_SET = new Set<string>(DECISION_ANIMATION_TYPES)

type FeatureStats = Record<string, { hits: number; trials: number }>

type ReplayOutcome = "win" | "loss" | "unknown"

function emptyStats(): FeatureStats {
  const keys = Object.keys(DEFAULT_BOT_SCORE_WEIGHTS)
  return Object.fromEntries(keys.map((k) => [k, { hits: 0, trials: 0 }]))
}

/** Observation pondérée (victoire → plus de poids, défaite → moins). */
function observe(
  stats: FeatureStats,
  key: BotScoreWeightKey,
  hit: boolean,
  weight = 1
) {
  if (!stats[key]) stats[key] = { hits: 0, trials: 0 }
  stats[key].trials += weight
  if (hit) stats[key].hits += weight
}

/** Observe une feature + sa variante contextualisée par phase. */
function observeCore(
  stats: FeatureStats,
  key: BotScoreWeightKey,
  hit: boolean,
  phase: BotTrainingPhase,
  weight: number
) {
  observe(stats, key, hit, weight)
  observe(stats, phaseWeightKey(phase, key), hit, weight)
}

function sumPower(bakugans: bakuganOnSlot[], userId: string): number {
  return bakugans
    .filter((b) => b.userId === userId)
    .reduce((acc, b) => acc + (b.currentPower ?? 0), 0)
}

function countAlive(snapshot: replaySnapshotType, userId: string): number {
  const deck = snapshot.decksState.find((d) => d.userId === userId)
  return (deck?.bakugans ?? []).filter((b) => !b.bakuganData.elimined).length
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

function trainingPhaseOf(snapshot: replaySnapshotType): BotTrainingPhase {
  return resolveBotTrainingPhase(isBattle(snapshot), snapshot.battleState.turns ?? 0)
}

/**
 * Infère win/loss depuis le dernier snapshot (bakugans restants).
 */
export function inferReplayOutcome(
  replayData: replayDataType,
  learnFromUserId: string
): ReplayOutcome {
  const last =
    replayData.replay.length > 0
      ? replayData.replay[replayData.replay.length - 1]!.stateAfter
      : replayData.initialSnapshot

  if (!last) return "unknown"

  const opponentId = getOpponentId(last, learnFromUserId)
  if (!opponentId) return "unknown"

  const ownAlive = countAlive(last, learnFromUserId)
  const oppAlive = countAlive(last, opponentId)

  if (oppAlive === 0 && ownAlive > 0) return "win"
  if (ownAlive === 0 && oppAlive > 0) return "loss"

  // Fallback élims relatives
  if (ownAlive > oppAlive + 1) return "win"
  if (oppAlive > ownAlive + 1) return "loss"

  return "unknown"
}

function outcomeWeight(outcome: ReplayOutcome): number {
  if (outcome === "win") return 1.3
  if (outcome === "loss") return 0.7
  return 1
}

function prefTypeOf(animation: AnimationDirectivesTypes): string {
  if (animation.type === "SET_BAKUGAN_AND_ADD_RENFORT") return "SET_BAKUGAN"
  return animation.type
}

function observeActionPreferences(
  stats: FeatureStats,
  phase: BotTrainingPhase,
  chosenType: string,
  weight: number
) {
  for (const moveType of DECISION_ANIMATION_TYPES) {
    const normalized = moveType === "SET_BAKUGAN_AND_ADD_RENFORT" ? "SET_BAKUGAN" : moveType
    // Une seule entrée SET_BAKUGAN pour les deux variants
    if (moveType === "SET_BAKUGAN_AND_ADD_RENFORT") continue
    observe(stats, prefWeightKey(phase, normalized), normalized === chosenType, weight)
  }
}

function analyzeDecision(
  stats: FeatureStats,
  entry: replayEntryType,
  userId: string,
  animation: AnimationDirectivesTypes,
  weight: number
) {
  const before = entry.stateBefore
  const after = entry.stateAfter
  const opponentId = getOpponentId(after, userId)
  const phase = trainingPhaseOf(before)

  // Préférences de type de coup par phase (imitation multinomial)
  observeActionPreferences(stats, phase, prefTypeOf(animation), weight)

  if (animation.type === "SET_GATE_CARD") {
    observeCore(stats, "setGatePlacementBonus", true, phase, weight)
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
        observeCore(stats, "characterGateSetBonus", hasAvailable, phase, weight)
        observeCore(stats, "characterGateMismatchPenalty", !hasAvailable, phase, weight)
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
        observeCore(stats, "characterBakuganMatchBonus", gate.family === family, phase, weight)
        observeCore(stats, "characterGateMismatchPenalty", gate.family !== family, phase, weight)
      }
      if (isReactorGate(gateKey)) {
        const reactorAttr = gateKey.replace("reacteur-", "").toLowerCase()
        observeCore(
          stats,
          "reactorBakuganMatchBonus",
          bakugan.attribut.toLowerCase() === reactorAttr,
          phase,
          weight
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
        observeCore(stats, "powerLeadPoints", botPower > oppPower, phase, weight)

        const beforeSlot = battleSlot(before) ?? slot
        const beforeBot = sumPower(beforeSlot.bakugans, userId)
        const beforeOpp = sumPower(beforeSlot.bakugans, opponentId)
        const wasLeading = beforeBot > beforeOpp
        if (animation.type === "ACTIVE_ABILITY_CARD" && wasLeading) {
          observeCore(stats, "abilityWasteWhileLeading", true, phase, weight)
          if ((before.battleState.turns ?? 0) >= 1) {
            observeCore(stats, "abilityWasteTurnTwoLeading", true, phase, weight)
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
        observeCore(stats, "alliedPowerUpPoints", allUp && anyUp, phase, weight)
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
          observeCore(
            stats,
            "tradeOffOverCapPenalty",
            total >= DEFAULT_BOT_SCORE_WEIGHTS.tradeOffPowerCap!,
            phase,
            weight
          )
        }
      }
      if (gateKey === "super-pyrus" && opponentId) {
        const slot =
          battleSlot(after) ?? after.portalSlots.find((s) => s.id === animation.data.slotId)
        if (slot) {
          const botPower = sumPower(slot.bakugans, userId)
          const oppPower = sumPower(slot.bakugans, opponentId)
          observeCore(stats, "superPyrusBadOpenPenalty", oppPower > botPower, phase, weight)
        }
      }
    }
  }

  // Signaux génériques dyn: (pondérés par outcome)
  const beforeBoard = boardFromReplaySnapshot(before)
  const afterBoard = boardFromReplaySnapshot(after)
  for (const { key, hit } of collectLearnableSignalObservations(
    beforeBoard,
    afterBoard,
    userId
  )) {
    observe(stats, key, hit, weight)
  }
}

export function collectTrainingStats(
  replays: Array<{ replayData: replayDataType; learnFromUserId: string }>
): {
  stats: FeatureStats
  decisionsAnalyzed: number
  replaysUsed: number
  winsUsed: number
  lossesUsed: number
} {
  const stats = emptyStats()
  let decisionsAnalyzed = 0
  let replaysUsed = 0
  let winsUsed = 0
  let lossesUsed = 0

  for (const item of replays) {
    const { replayData, learnFromUserId } = item
    if (!replayData?.replay?.length || !learnFromUserId) continue
    replaysUsed += 1

    const outcome = inferReplayOutcome(replayData, learnFromUserId)
    if (outcome === "win") winsUsed += 1
    if (outcome === "loss") lossesUsed += 1
    const weight = outcomeWeight(outcome)

    for (const entry of replayData.replay) {
      if (!entry.animation) continue
      if (!DECISION_ANIMATION_TYPE_SET.has(entry.animation.type)) continue
      const actor = actorFromEntry(entry)
      if (!actor || actor !== learnFromUserId) continue
      analyzeDecision(stats, entry, learnFromUserId, entry.animation, weight)
      decisionsAnalyzed += 1
    }
  }

  return { stats, decisionsAnalyzed, replaysUsed, winsUsed, lossesUsed }
}

/**
 * Transforme les stats d'observation en nouveaux poids :
 * - bonus : plus souvent observé chez le joueur cible → poids plus élevé
 * - pénalité : plus souvent déclenchée par le joueur cible → pénalité adoucie
 * - ph: / pref: : mêmes règles, pour un scoring contextualisé
 */
export function statsToTargetWeights(stats: FeatureStats): BotScoreWeights {
  const base = mergeBotScoreWeights()
  const target = { ...base }
  const keys = new Set([...Object.keys(base), ...Object.keys(stats)])

  for (const key of keys) {
    const entry = stats[key]
    if (!entry) continue
    const { hits, trials } = entry
    if (trials < 3) continue

    // Agrégats globaux dyn:effect → métriques seulement
    if (isDynamicWeightKey(key) && !key.includes("|")) continue

    const rate = hits / trials
    const defaultValue = defaultWeightForKey(key)

    if (key === "tradeOffPowerCap" || key.endsWith("|tradeOffPowerCap")) {
      target[key] = defaultValue + (rate - 0.5) * 80
      continue
    }

    if (defaultValue < 0) {
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
  const { stats, decisionsAnalyzed, replaysUsed, winsUsed, lossesUsed } =
    collectTrainingStats(params.replays)
  const target = statsToTargetWeights(stats)
  const base = mergeBotScoreWeights(params.baseWeights)
  const blend = params.blend ?? 0.45
  const weights = lerpBotScoreWeights(base, target, blend)

  const featureRates: BotTrainingMetrics["featureRates"] = {}
  for (const key of Object.keys(stats)) {
    const { hits, trials } = stats[key]!
    if (trials === 0) continue
    // Métriques : garder ph:/pref:/dyn: contextuels + core
    if (isDynamicWeightKey(key) && !key.includes("|")) continue
    featureRates[key] = { hits, trials, rate: hits / trials }
  }

  return {
    weights,
    metrics: {
      replaysUsed,
      decisionsAnalyzed,
      winsUsed,
      lossesUsed,
      featureRates,
    },
  }
}

/** Helpers exportés pour tests / UI */
export function isTrainingLearnedKey(key: string): boolean {
  return isLearnedWeightKey(key) || isPhaseWeightKey(key) || isPrefWeightKey(key)
}
