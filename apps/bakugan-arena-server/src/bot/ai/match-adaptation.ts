import { clampBotScoreWeights, type BotScoreWeights } from "@bakugan-arena/drizzle-orm"
import type { stateType } from "@bakugan-arena/game-data"
import type { personalities } from "../../functions/bot-data"

export type MatchPressure = "ahead" | "even" | "behind"

export type MatchAdaptation = {
  /** Multiplicateurs appliqués aux poids de base (clé → facteur). */
  weightScales: Record<string, number>
  /** Traits de personnalité injectés pour ce coup. */
  extraPersonalities: personalities[]
  /** Température softmax (plus bas = plus déterministe). */
  temperature: number
  /** Debug résumé. */
  reason: string[]
  pressure: MatchPressure
}

export type MatchMemory = {
  roomId: string
  userId: string
  oppAbilitiesUsed: number
  oppGatesOpened: number
  oppAbilityBlocksSeen: number
  oppPowerSpikes: number
  decisions: number
}

const memories = new Map<string, MatchMemory>()

const memoryKey = (roomId: string, userId: string) => `${roomId}:${userId}`

function countEliminated(state: stateType, userId: string): number {
  const deck = state.decksState.find((d) => d.userId === userId)
  return (deck?.bakugans ?? []).filter((b) => b.bakuganData.elimined).length
}

function countAlive(state: stateType, userId: string): number {
  const deck = state.decksState.find((d) => d.userId === userId)
  return (deck?.bakugans ?? []).filter((b) => !b.bakuganData.elimined).length
}

function getOpponentId(state: stateType, userId: string): string | undefined {
  return state.players.find((p) => p.userId !== userId)?.userId
}

function countUsedAbilities(state: stateType, userId: string): number {
  const deck = state.decksState.find((d) => d.userId === userId)
  if (!deck) return 0
  const normal = deck.abilities.filter((a) => a.used).length
  const exclu = deck.bakugans.reduce(
    (acc, b) => acc + b.excluAbilitiesState.filter((e) => e.used).length,
    0
  )
  return normal + exclu
}

function countOpenedGates(state: stateType, userId: string): number {
  return state.protalSlots.filter(
    (s) => s.portalCard?.userId === userId && s.state.open === true
  ).length
}

function countActiveAbilityBlocks(state: stateType): number {
  return state.turnState.ability_card_block?.blocked ? 1 : 0
}

function maxDomainPower(state: stateType, userId: string): number {
  let max = 0
  for (const slot of state.protalSlots) {
    for (const b of slot.bakugans) {
      if (b.userId !== userId) continue
      max = Math.max(max, b.currentPower ?? 0)
    }
  }
  return max
}

export function getMatchMemory(roomId: string, userId: string): MatchMemory {
  const key = memoryKey(roomId, userId)
  let mem = memories.get(key)
  if (!mem) {
    mem = {
      roomId,
      userId,
      oppAbilitiesUsed: 0,
      oppGatesOpened: 0,
      oppAbilityBlocksSeen: 0,
      oppPowerSpikes: 0,
      decisions: 0,
    }
    memories.set(key, mem)
  }
  return mem
}

export function clearMatchMemory(roomId: string, userId?: string): void {
  if (userId) {
    memories.delete(memoryKey(roomId, userId))
    return
  }
  for (const key of memories.keys()) {
    if (key.startsWith(`${roomId}:`)) memories.delete(key)
  }
}

/**
 * Met à jour la mémoire de match à partir de l'état courant (révélations adverses).
 */
export function updateMatchMemory(state: stateType, userId: string): MatchMemory {
  const mem = getMatchMemory(state.roomId, userId)
  const opponentId = getOpponentId(state, userId)
  if (!opponentId) return mem

  mem.oppAbilitiesUsed = Math.max(mem.oppAbilitiesUsed, countUsedAbilities(state, opponentId))
  mem.oppGatesOpened = Math.max(mem.oppGatesOpened, countOpenedGates(state, opponentId))
  mem.oppAbilityBlocksSeen = Math.max(
    mem.oppAbilityBlocksSeen,
    countActiveAbilityBlocks(state) +
      state.protalSlots.filter(
        (s) =>
          typeof s.state.blocked === "object" &&
          s.state.blocked.blocked &&
          s.portalCard?.userId === userId
      ).length
  )

  const oppPower = maxDomainPower(state, opponentId)
  if (oppPower >= 500) {
    mem.oppPowerSpikes = Math.max(mem.oppPowerSpikes, 1)
  }
  if (oppPower >= 700) {
    mem.oppPowerSpikes = Math.max(mem.oppPowerSpikes, 2)
  }

  mem.decisions += 1
  return mem
}

function scale(target: Record<string, number>, key: string, factor: number) {
  target[key] = (target[key] ?? 1) * factor
}

/**
 * Construit un profil d'adaptation pour la décision courante.
 */
export function buildMatchAdaptation(
  state: stateType,
  userId: string,
  memory?: MatchMemory
): MatchAdaptation {
  const mem = memory ?? updateMatchMemory(state, userId)
  const opponentId = getOpponentId(state, userId)
  const reason: string[] = []
  const weightScales: Record<string, number> = {}
  const extraPersonalities: personalities[] = []

  const ownAlive = countAlive(state, userId)
  const oppAlive = opponentId ? countAlive(state, opponentId) : ownAlive
  const ownElim = countEliminated(state, userId)
  const oppElim = opponentId ? countEliminated(state, opponentId) : 0
  const lifeDelta = ownAlive - oppAlive

  let pressure: MatchPressure = "even"
  if (lifeDelta <= -1 || ownElim > oppElim + 1) {
    pressure = "behind"
  } else if (lifeDelta >= 1 || oppElim > ownElim + 1) {
    pressure = "ahead"
  }

  const ownUsableAbilities =
    state.players.find((p) => p.userId === userId)?.usable_abilitys ?? 0
  const inBattle =
    state.battleState.battleInProcess === true && state.battleState.paused !== true
  const battleTurns = state.battleState.turns ?? 0
  const turnCount = state.turnState.turnCount ?? 0

  // --- Pression score ---
  if (pressure === "behind") {
    reason.push("behind")
    scale(weightScales, "freeElimPoints", 1.35)
    scale(weightScales, "powerLeadPoints", 1.3)
    scale(weightScales, "alliedPowerUpPoints", 1.25)
    scale(weightScales, "turnSkipSavePoints", 0.7)
    scale(weightScales, "abilityWasteWhileLeading", 0.85)
    extraPersonalities.push("finisher", "rush_down")
  } else if (pressure === "ahead") {
    reason.push("ahead")
    scale(weightScales, "turnSkipSavePoints", 1.35)
    scale(weightScales, "opponentBlockedPoints", 1.25)
    scale(weightScales, "opponentNoAbilityPoints", 1.25)
    scale(weightScales, "gateNeutralizePoints", 1.2)
    scale(weightScales, "freeElimPoints", 0.9)
    extraPersonalities.push("control", "blocker")
  }

  // --- Menaces adverses observées ---
  if (mem.oppAbilitiesUsed >= 2) {
    reason.push("opp-ability-heavy")
    scale(weightScales, "opponentNoAbilityPoints", 1.3)
    scale(weightScales, "gateNeutralizePoints", 1.2)
    scale(weightScales, "abilityWasteWhileLeading", 1.15)
    extraPersonalities.push("blocker", "control")
  }

  if (mem.oppAbilityBlocksSeen >= 1) {
    reason.push("opp-deny")
    scale(weightScales, "opponentNoAbilityPoints", 1.2)
    scale(weightScales, "turnSkipSavePoints", 1.15)
    extraPersonalities.push("control")
  }

  if (mem.oppPowerSpikes >= 1) {
    reason.push("opp-power-spike")
    scale(weightScales, "powerLeadPoints", 1.25)
    scale(weightScales, "superPyrusBadOpenPenalty", 1.2)
    scale(weightScales, "tradeOffOverCapPenalty", 1.15)
    extraPersonalities.push("finisher")
  }

  // --- Ressources propres ---
  if (ownUsableAbilities <= 1) {
    reason.push("low-abilities")
    scale(weightScales, "turnSkipSavePoints", 1.3)
    scale(weightScales, "abilityWasteWhileLeading", 1.35)
    scale(weightScales, "abilityWasteTurnTwoLeading", 1.35)
  }

  // --- Phase bataille ---
  if (inBattle) {
    reason.push(`battle-t${battleTurns}`)
    scale(weightScales, "powerLeadPoints", 1.15)
    scale(weightScales, "freeElimPoints", 1.15)
    if (battleTurns >= 1) {
      scale(weightScales, "abilityWasteTurnTwoLeading", 1.25)
      extraPersonalities.push("finisher")
    }
  } else if (turnCount <= 1) {
    reason.push("early-setup")
    scale(weightScales, "characterGateSetBonus", 1.25)
    scale(weightScales, "characterBakuganMatchBonus", 1.25)
    scale(weightScales, "setGatePlacementBonus", 1.2)
    scale(weightScales, "reactorBakuganMatchBonus", 1.15)
    extraPersonalities.push("setup")
  } else {
    reason.push("neutral-mid")
    scale(weightScales, "setGatePlacementBonus", 1.1)
    extraPersonalities.push("zoner")
  }

  // Température : plus exploratoire en début / quand even, plus cold quand behind late
  let temperature = 0.4
  if (pressure === "behind") temperature = 0.28
  if (pressure === "ahead" && turnCount >= 3) temperature = 0.32
  if (turnCount === 0) temperature = 0.55

  // Dédupliquer les traits
  const uniqueTraits = [...new Set(extraPersonalities)]

  return {
    weightScales,
    extraPersonalities: uniqueTraits,
    temperature,
    reason,
    pressure,
  }
}

/**
 * Applique les multiplicateurs d'adaptation sur une copie des poids.
 * Les clés `dyn:` reçoivent un facteur plus doux pour rester stables.
 */
export function applyMatchAdaptation(
  baseWeights: BotScoreWeights,
  adaptation: MatchAdaptation
): BotScoreWeights {
  const next: BotScoreWeights = { ...baseWeights }

  for (const [key, value] of Object.entries(next)) {
    if (typeof value !== "number") continue

    let factor = 1
    const direct = adaptation.weightScales[key]
    if (typeof direct === "number") {
      factor = direct
    } else if (key.startsWith("dyn:")) {
      // Biais léger selon la pression sur les signaux appris
      if (adaptation.pressure === "behind") factor = 1.08
      else if (adaptation.pressure === "ahead") factor = 0.95
    }

    if (factor === 1) continue
    next[key] = value * factor
  }

  // Si on injecte des traits, légèrement monter le multiplicateur de personnalité
  if (adaptation.extraPersonalities.length > 0) {
    const current = next.personalityMultiplier ?? 1.5
    next.personalityMultiplier = current * (1 + Math.min(0.2, adaptation.extraPersonalities.length * 0.04))
  }

  return clampBotScoreWeights(next)
}

export function mergePersonalities(
  base: personalities[],
  extra: personalities[]
): personalities[] {
  return [...new Set([...base, ...extra])]
}
