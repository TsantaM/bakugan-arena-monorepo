import type { bakuganOnSlot, portalSlotsTypeElement, stateType } from "../../type/room-types.js"
import type { replaySnapshotType } from "../../type/replay-snapshot-types.js"

/** Préfixe des poids découverts à l'entraînement (situations non câblées à la main). */
export const LEARNABLE_SIGNAL_PREFIX = "dyn:" as const

/**
 * Vue minimale du plateau pour extraire des signaux d'apprentissage génériques.
 * Compatible replay snapshot et state runtime.
 */
export type LearnableSignalBoard = {
  battleInProcess: boolean
  battleSlotId?: string | null
  battleTurns: number
  abilityBlocked: boolean
  slots: Array<{
    id: string
    bakugans: Array<{ key: string; userId: string; currentPower: number }>
    portalCardKey?: string | null
    portalCardUserId?: string | null
    canceled: boolean
    blocked: boolean
  }>
  decks: Array<{
    userId: string
    bakugans: Array<{ key: string; elimined: boolean }>
  }>
}

const POWER_BUCKETS = ["neg2", "neg1", "0", "pos1", "pos2"] as const
const ALIVE_BUCKETS = ["neg", "0", "pos"] as const
const STANDINGS = ["lead", "trail", "even"] as const

type PowerBucket = (typeof POWER_BUCKETS)[number]
type AliveBucket = (typeof ALIVE_BUCKETS)[number]
type Standing = (typeof STANDINGS)[number]
type Phase = "battle" | "neutral"

function isGateBlocked(blocked: unknown): boolean {
  return typeof blocked === "object" && blocked !== null && (blocked as { blocked?: boolean }).blocked === true
}

function sumPower(
  bakugans: Array<{ userId: string; currentPower: number }>,
  userId: string
): number {
  return bakugans
    .filter((b) => b.userId === userId)
    .reduce((acc, b) => acc + (b.currentPower ?? 0), 0)
}

function findOpponentId(board: LearnableSignalBoard, userId: string): string | undefined {
  const ids = new Set<string>()
  for (const deck of board.decks) {
    if (deck.userId) ids.add(deck.userId)
  }
  for (const slot of board.slots) {
    for (const b of slot.bakugans) ids.add(b.userId)
    if (slot.portalCardUserId) ids.add(slot.portalCardUserId)
  }
  return [...ids].find((id) => id !== userId)
}

function powerBucket(delta: number): PowerBucket {
  if (delta <= -200) return "neg2"
  if (delta < 0) return "neg1"
  if (delta === 0) return "0"
  if (delta < 200) return "pos1"
  return "pos2"
}

function aliveBucket(delta: number): AliveBucket {
  if (delta < 0) return "neg"
  if (delta > 0) return "pos"
  return "0"
}

function standing(botPower: number, oppPower: number): Standing {
  if (botPower > oppPower) return "lead"
  if (botPower < oppPower) return "trail"
  return "even"
}

function battleSlot(board: LearnableSignalBoard) {
  if (!board.battleSlotId) return undefined
  return board.slots.find((s) => s.id === board.battleSlotId)
}

function countAlive(deck: LearnableSignalBoard["decks"][number] | undefined): number {
  return (deck?.bakugans ?? []).filter((b) => !b.elimined).length
}

function slotFromPortal(slot: portalSlotsTypeElement): LearnableSignalBoard["slots"][number] {
  return {
    id: slot.id,
    bakugans: slot.bakugans.map((b: bakuganOnSlot) => ({
      key: b.key,
      userId: b.userId,
      currentPower: b.currentPower ?? 0,
    })),
    portalCardKey: slot.portalCard?.key ?? null,
    portalCardUserId: slot.portalCard?.userId ?? null,
    canceled: slot.state.canceled === true,
    blocked: isGateBlocked(slot.state.blocked),
  }
}

export function boardFromReplaySnapshot(snapshot: replaySnapshotType): LearnableSignalBoard {
  return {
    battleInProcess:
      snapshot.battleState.battleInProcess === true && snapshot.battleState.paused !== true,
    battleSlotId: snapshot.battleState.slot,
    battleTurns: snapshot.battleState.turns ?? 0,
    abilityBlocked: snapshot.turnState.ability_card_block?.blocked === true,
    slots: snapshot.portalSlots.map(slotFromPortal),
    decks: snapshot.decksState.map((d) => ({
      userId: d.userId,
      bakugans: d.bakugans.map((b) => ({
        key: b.bakuganData.key,
        elimined: b.bakuganData.elimined === true,
      })),
    })),
  }
}

export function boardFromRoomState(state: stateType): LearnableSignalBoard {
  return {
    battleInProcess:
      state.battleState.battleInProcess === true && state.battleState.paused !== true,
    battleSlotId: state.battleState.slot,
    battleTurns: state.battleState.turns ?? 0,
    abilityBlocked: state.turnState.ability_card_block?.blocked === true,
    slots: state.protalSlots.map(slotFromPortal),
    decks: state.decksState.map((d) => ({
      userId: d.userId,
      bakugans: d.bakugans.map((b) => ({
        key: b.bakuganData.key,
        elimined: b.bakuganData.elimined === true,
      })),
    })),
  }
}

function gateNeutralized(
  before: LearnableSignalBoard,
  after: LearnableSignalBoard,
  opponentId: string
): boolean {
  for (const afterSlot of after.slots) {
    if (afterSlot.portalCardUserId !== opponentId) continue
    const beforeSlot = before.slots.find((s) => s.id === afterSlot.id)
    if (!beforeSlot?.portalCardKey) continue
    if (!beforeSlot.canceled && afterSlot.canceled) return true
    if (!beforeSlot.blocked && afterSlot.blocked) return true
  }
  return false
}

/**
 * Ensemble fini de probes d'effets génériques.
 * De nouveaux contextes (`phase:standing`) × effets créent de nouvelles clés `dyn:` à l'entraînement.
 */
function buildEffectProbes(
  before: LearnableSignalBoard,
  after: LearnableSignalBoard,
  userId: string
): Array<{ effect: string; hit: boolean }> {
  const opponentId = findOpponentId(after, userId) ?? findOpponentId(before, userId)
  const probes: Array<{ effect: string; hit: boolean }> = []

  const beforeSlot = battleSlot(before)
  const afterSlot = battleSlot(after) ?? beforeSlot

  const beforeBot = beforeSlot && opponentId ? sumPower(beforeSlot.bakugans, userId) : 0
  const beforeOpp = beforeSlot && opponentId ? sumPower(beforeSlot.bakugans, opponentId) : 0
  const afterBot = afterSlot && opponentId ? sumPower(afterSlot.bakugans, userId) : beforeBot
  const afterOpp = afterSlot && opponentId ? sumPower(afterSlot.bakugans, opponentId) : beforeOpp

  const ownPd = powerBucket(afterBot - beforeBot)
  const oppPd = powerBucket(afterOpp - beforeOpp)

  for (const b of POWER_BUCKETS) {
    probes.push({ effect: `own_pd:${b}`, hit: ownPd === b })
    probes.push({ effect: `opp_pd:${b}`, hit: oppPd === b })
  }

  const beforeStanding = standing(beforeBot, beforeOpp)
  const afterStanding = standing(afterBot, afterOpp)

  for (const s of STANDINGS) {
    probes.push({ effect: `standing:${s}`, hit: afterStanding === s })
  }

  probes.push({
    effect: "gain_lead",
    hit: beforeStanding !== "lead" && afterStanding === "lead",
  })
  probes.push({
    effect: "lose_lead",
    hit: beforeStanding === "lead" && afterStanding !== "lead",
  })

  const beforeOwnDeck = before.decks.find((d) => d.userId === userId)
  const afterOwnDeck = after.decks.find((d) => d.userId === userId)
  const beforeOppDeck = opponentId ? before.decks.find((d) => d.userId === opponentId) : undefined
  const afterOppDeck = opponentId ? after.decks.find((d) => d.userId === opponentId) : undefined

  const ownAliveDelta = countAlive(afterOwnDeck) - countAlive(beforeOwnDeck)
  const oppAliveDelta = countAlive(afterOppDeck) - countAlive(beforeOppDeck)
  const ownAlive = aliveBucket(ownAliveDelta)
  const oppAlive = aliveBucket(oppAliveDelta)

  for (const b of ALIVE_BUCKETS) {
    probes.push({ effect: `own_alive:${b}`, hit: ownAlive === b })
    probes.push({ effect: `opp_alive:${b}`, hit: oppAlive === b })
  }

  probes.push({ effect: "opp_elim", hit: oppAliveDelta < 0 })
  probes.push({ effect: "own_elim", hit: ownAliveDelta < 0 })

  const battleStart = !before.battleInProcess && after.battleInProcess
  const battleEnd = before.battleInProcess && !after.battleInProcess
  probes.push({ effect: "battle_start", hit: battleStart })
  probes.push({ effect: "battle_end", hit: battleEnd })

  const allyBefore = before.slots.flatMap((s) => s.bakugans.filter((b) => b.userId === userId))
  const allyAfter = after.slots.flatMap((s) => s.bakugans.filter((b) => b.userId === userId))
  const allyPowerUp =
    allyBefore.length > 0 &&
    allyBefore.length === allyAfter.length &&
    allyBefore.every((b) => {
      const next = allyAfter.find((a) => a.key === b.key && a.userId === b.userId)
      return next != null && next.currentPower >= b.currentPower
    }) &&
    allyBefore.some((b) => {
      const next = allyAfter.find((a) => a.key === b.key && a.userId === b.userId)
      return next != null && next.currentPower > b.currentPower
    })
  probes.push({ effect: "ally_power_up", hit: allyPowerUp })

  probes.push({
    effect: "gate_neutralize",
    hit: opponentId ? gateNeutralized(before, after, opponentId) : false,
  })

  probes.push({
    effect: "ability_block_set",
    hit: !before.abilityBlocked && after.abilityBlocked,
  })

  return probes
}

function contextKey(before: LearnableSignalBoard, userId: string): string {
  const phase: Phase = before.battleInProcess ? "battle" : "neutral"
  const opponentId = findOpponentId(before, userId)
  const slot = battleSlot(before)
  if (!slot || !opponentId) {
    return `${phase}:even`
  }
  const botPower = sumPower(slot.bakugans, userId)
  const oppPower = sumPower(slot.bakugans, opponentId)
  return `${phase}:${standing(botPower, oppPower)}`
}

/**
 * Produit les observations (clé → hit) pour l'algo d'entraînement existant.
 * Les clés `dyn:ctx|effect` n'existant pas encore sont créées à la volée.
 */
export function collectLearnableSignalObservations(
  before: LearnableSignalBoard,
  after: LearnableSignalBoard,
  userId: string,
  _moveKind?: string
): Array<{ key: string; hit: boolean }> {
  const ctx = contextKey(before, userId)
  const probes = buildEffectProbes(before, after, userId)
  const observations: Array<{ key: string; hit: boolean }> = []

  for (const { effect, hit } of probes) {
    observations.push({ key: `${LEARNABLE_SIGNAL_PREFIX}${effect}`, hit })
    observations.push({ key: `${LEARNABLE_SIGNAL_PREFIX}${ctx}|${effect}`, hit })
  }

  return observations
}

/** Effets dont le défaut doit rester une pénalité (le joueur modèle les évite). */
export function isHarmfulLearnableEffect(key: string): boolean {
  return (
    key.includes("own_elim") ||
    key.includes("lose_lead") ||
    key.includes("own_alive:neg") ||
    key.includes("own_pd:neg")
  )
}

/** Score runtime : somme des poids `dyn:` contextuels (évite le bruit des clés globales). */
export function scoreLearnableSignals(
  before: LearnableSignalBoard,
  after: LearnableSignalBoard,
  userId: string,
  weights: Record<string, number>,
  moveKind?: string
): number {
  const observations = collectLearnableSignalObservations(before, after, userId, moveKind)
  let score = 0
  for (const { key, hit } of observations) {
    if (!hit) continue
    // Préférer les clés contextuelles (situations), pas les agrégats globaux.
    if (!key.includes("|")) continue
    const weight = weights[key]
    if (typeof weight !== "number") continue
    score += weight
  }
  return score
}
