import {
  BakuganList,
  GateCardsList,
  boardFromRoomState,
  getPlayerDecksAndBakugans,
  prefWeightKey,
  resolveBotTrainingPhase,
  scoreLearnableSignals,
  simulateActionToPrefType,
  type bakuganOnSlot,
  type blockedCardSlotType,
  type portalSlotsTypeElement,
  type stateType,
} from "@bakugan-arena/game-data"
import type { personalities } from "../../functions/bot-data"
import { applyTurnAdvance } from "./apply/apply-turn-advance"
import { cloneRoomState } from "./clone-room-state"
import {
  expandAbilityAdditional,
  expandGateAdditional,
  isAdditionalRequestForUser,
} from "./expand-legal-moves"
import { simulateAction } from "./simulate-action"
import type { SimulateAction } from "./types"
import { getScoreWeights } from "./score-weights-runtime"

export type ScoreActionParams = {
  before: stateType
  after: stateType
  action: SimulateAction
  userId: string
  /** Personnalités du bot (multiplicateurs ×1.5) */
  personalities?: personalities[]
}

type ResolvedScorer = (
  rootBefore: stateType,
  resolvedAfter: stateType,
  action: SimulateAction,
  userId: string
) => number

const SUPER_PYRUS_KEY = "super-pyrus"
const TRADE_OFF_KEY = "echange"
const MAX_ADDITIONAL_DEPTH = 6

/** Bataille active : en cours et non en pause */
export const isActiveBattle = (state: stateType): boolean => {
  const { battleInProcess, paused } = state.battleState
  return battleInProcess === true && paused !== true
}

export const isNeutralSituation = (state: stateType): boolean => !isActiveBattle(state)

export const battleJustStarted = (before: stateType, after: stateType): boolean =>
  !isActiveBattle(before) && isActiveBattle(after)

const sumCurrentPower = (arr: bakuganOnSlot[]): number =>
  arr.reduce((acc, b) => acc + (b?.currentPower ?? 0), 0)

const isGateBlocked = (blocked: blockedCardSlotType): boolean =>
  typeof blocked === "object" && blocked.blocked === true

const getOpponentId = (state: stateType, userId: string): string | undefined =>
  state.players.find((p) => p.userId !== userId)?.userId

const getBattleSlot = (state: stateType): portalSlotsTypeElement | undefined => {
  const slotId = state.battleState.slot
  if (!slotId) return undefined
  return state.protalSlots.find((s) => s.id === slotId)
}

const hasPendingAdditional = (state: stateType): boolean =>
  state.AbilityAditionalRequest.length > 0 || state.gateCardActionRequest.length > 0

const isReactorGate = (gateKey: string): boolean => gateKey.startsWith("reacteur-")

const isCharacterGate = (gateKey: string): boolean => {
  const gate = GateCardsList.find((g) => g.key === gateKey)
  return Boolean(gate?.family)
}

const getAlliedBakugansOnDomain = (state: stateType, userId: string): bakuganOnSlot[] =>
  state.protalSlots.flatMap((s) => s.bakugans.filter((b) => b.userId === userId))

const getSlotPowerTotals = (
  slot: portalSlotsTypeElement,
  userId: string
): { botPower: number; opponentPower: number } => ({
  botPower: sumCurrentPower(slot.bakugans.filter((b) => b.userId === userId)),
  opponentPower: sumCurrentPower(slot.bakugans.filter((b) => b.userId !== userId)),
})

/**
 * Totaux de puissance sur le slot de bataille (même logique que on-battle-end).
 */
export function getBattlePowerTotals(
  state: stateType,
  userId: string
): { botPower: number; opponentPower: number } | null {
  const slot = getBattleSlot(state)
  if (!slot) return null

  const opponentId = getOpponentId(state, userId)
  if (!opponentId) return null

  const { player1Bakugans, player2Bakugans } = getPlayerDecksAndBakugans({
    slot,
    decksState: state.decksState,
    players: state.players,
  })

  const botIsP1 = state.players[0]?.userId === userId

  return {
    botPower: sumCurrentPower(botIsP1 ? player1Bakugans : player2Bakugans),
    opponentPower: sumCurrentPower(botIsP1 ? player2Bakugans : player1Bakugans),
  }
}

const countTurnActions = (state: stateType, whoseTurn: string): number => {
  const request =
    state.turnState.turn === whoseTurn
      ? state.ActivePlayerActionRequest
      : state.InactivePlayerActionRequest

  return [
    ...request.actions.mustDo,
    ...request.actions.mustDoOne,
    ...request.actions.optional,
  ].length
}

const requestHasAbilityAction = (state: stateType, whoseTurn: string): boolean => {
  const request =
    state.turnState.turn === whoseTurn
      ? state.ActivePlayerActionRequest
      : state.InactivePlayerActionRequest

  return [...request.actions.mustDo, ...request.actions.mustDoOne, ...request.actions.optional].some(
    (a) => a.type === "USE_ABILITY_CARD"
  )
}

/** Projette jusqu'au tour de l'adversaire (ou échec). */
function projectToOpponentTurn(after: stateType, userId: string): stateType | null {
  if (hasPendingAdditional(after)) return null

  const opponentId = getOpponentId(after, userId)
  if (!opponentId) return null

  const projected = cloneRoomState(after)

  for (let i = 0; i < 4; i++) {
    if (projected.status.finished) return null
    if (hasPendingAdditional(projected)) return null

    if (projected.turnState.turn === opponentId) {
      return projected
    }

    applyTurnAdvance(projected, projected.turnState.turn)
  }

  return null
}

function scoresPowerLead(after: stateType, userId: string): boolean {
  const totals = getBattlePowerTotals(after, userId)
  if (!totals) return false
  return totals.botPower > totals.opponentPower
}

function scoresOpponentGateNeutralized(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  const opponentId = getOpponentId(before, userId)
  if (!opponentId) return false

  const beforeSlot = getBattleSlot(before)
  const afterSlot = getBattleSlot(after)
  if (!beforeSlot?.portalCard || !afterSlot) return false
  if (beforeSlot.portalCard.userId !== opponentId) return false

  const wasOpen = beforeSlot.state.open === true
  const becameCanceled =
    beforeSlot.state.canceled !== true && afterSlot.state.canceled === true
  const becameBlocked =
    !isGateBlocked(beforeSlot.state.blocked) && isGateBlocked(afterSlot.state.blocked)

  if (wasOpen && becameCanceled) return true
  if (!wasOpen && becameBlocked) return true
  return false
}

function scoresOpponentBlockedNextTurn(after: stateType, userId: string): boolean {
  if (!isActiveBattle(after)) return false
  return opponentHasNoActionsNextTurn(after, userId)
}

/** Adversaire sans aucune action au tour suivant (bataille ou neutral) */
function opponentHasNoActionsNextTurn(after: stateType, userId: string): boolean {
  if (hasPendingAdditional(after)) return false
  const projected = projectToOpponentTurn(after, userId)
  if (!projected) return false
  const opponentId = getOpponentId(projected, userId)
  if (!opponentId) return false
  return countTurnActions(projected, opponentId) === 0
}

/** Gate adverse annulée / bloquée (slot de bataille ou n'importe quel slot) */
function scoresAnyOpponentGateNeutralized(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  if (scoresOpponentGateNeutralized(before, after, userId)) return true

  const opponentId = getOpponentId(before, userId)
  if (!opponentId) return false

  for (const afterSlot of after.protalSlots) {
    if (afterSlot.portalCard?.userId !== opponentId) continue
    const beforeSlot = before.protalSlots.find((s) => s.id === afterSlot.id)
    if (!beforeSlot?.portalCard) continue

    const becameCanceled =
      beforeSlot.state.canceled !== true && afterSlot.state.canceled === true
    const becameBlocked =
      !isGateBlocked(beforeSlot.state.blocked) && isGateBlocked(afterSlot.state.blocked)

    if (becameCanceled || becameBlocked) return true
  }

  return false
}

function scoresAbilityBlockNewlySet(before: stateType, after: stateType): boolean {
  return (
    before.turnState.ability_card_block.blocked !== true &&
    after.turnState.ability_card_block.blocked === true
  )
}

/** Adversaire incapable d'utiliser des abilities au tour suivant */
function scoresOpponentCannotUseAbilitiesNextTurn(
  after: stateType,
  userId: string
): boolean {
  const projected = projectToOpponentTurn(after, userId)
  if (!projected) return false

  const opponentId = getOpponentId(projected, userId)
  if (!opponentId) return false

  if (projected.turnState.ability_card_block.blocked) return true

  const usable =
    projected.players.find((p) => p.userId === opponentId)?.usable_abilitys ?? 0
  if (usable <= 0) return true

  return !requestHasAbilityAction(projected, opponentId)
}

/** Tous les bakugans alliés déjà sur le domaine ont augmenté de puissance */
function scoresAllAlliedPowerIncreased(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  const beforeAllied = getAlliedBakugansOnDomain(before, userId)
  if (beforeAllied.length === 0) return false

  return beforeAllied.every((b) => {
    const next = getAlliedBakugansOnDomain(after, userId).find(
      (a) => a.key === b.key && a.slot_id === b.slot_id
    )
    return Boolean(next && next.currentPower > b.currentPower)
  })
}

/** Élimination gratuite d'au moins un bakugan adverse */
function scoresFreeOpponentElimination(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  const opponentId = getOpponentId(before, userId)
  if (!opponentId) return false

  const beforeDeck = before.decksState.find((d) => d.userId === opponentId)?.bakugans ?? []
  const afterDeck = after.decksState.find((d) => d.userId === opponentId)?.bakugans ?? []

  return beforeDeck.some((b) => {
    if (b.bakuganData.elimined) return false
    const afterBakugan = afterDeck.find((a) => a.bakuganData.key === b.bakuganData.key)
    return afterBakugan?.bakuganData.elimined === true
  })
}

/** TURN_SKIP +2 si aucune gate / ability n'est obligatoire ni en option gate */
function scoresTurnSkipSavesResources(
  before: stateType,
  action: SimulateAction,
  userId: string
): boolean {
  if (action.type !== "TURN_SKIP") return false

  const request =
    before.turnState.turn === userId
      ? before.ActivePlayerActionRequest
      : before.InactivePlayerActionRequest

  const mandatory = [...request.actions.mustDo, ...request.actions.mustDoOne]
  const optional = request.actions.optional

  const forcesSpend = mandatory.some(
    (a) =>
      a.type === "SET_GATE_CARD_ACTION" ||
      a.type === "SELECT_GATE_CARD" ||
      a.type === "USE_ABILITY_CARD"
  )
  if (forcesSpend) return false

  // Ne pas préférer le skip quand une pose de gate est encore possible
  const hasOptionalGate = optional.some(
    (a) => a.type === "SET_GATE_CARD_ACTION" || a.type === "SELECT_GATE_CARD"
  )
  if (hasOptionalGate) return false

  return true
}

/**
 * Effets génériques (ability / gate / attribut / skip) hors lancement de bataille.
 */
function scoreNeutralEffectActions(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): number {
  const isEffectAction =
    action.type === "USE_ABILITY" ||
    action.type === "ACTIVE_GATE" ||
    action.type === "CHANGE_ATTRIBUTE" ||
    action.type === "TURN_SKIP" ||
    action.type === "ABILITY_ADDITIONAL" ||
    action.type === "GATE_ADDITIONAL"

  if (!isEffectAction) return 0

  let score = 0

  if (scoresOpponentCannotUseAbilitiesNextTurn(after, userId)) {
    score += getScoreWeights().opponentNoAbilityPoints
  }

  if (scoresAllAlliedPowerIncreased(before, after, userId)) {
    score += getScoreWeights().alliedPowerUpPoints
  }

  if (scoresFreeOpponentElimination(before, after, userId)) {
    score += getScoreWeights().freeElimPoints
  }

  if (scoresTurnSkipSavesResources(before, action, userId)) {
    score += getScoreWeights().turnSkipSavePoints
  }

  return score
}

function scoreCharacterGateSetPenalty(
  action: SimulateAction,
  state: stateType,
  userId: string
): number {
  if (action.type !== "SET_GATE") return 0

  const gate = GateCardsList.find((g) => g.key === action.gateId)
  if (!gate?.family) return 0

  const deck = state.decksState.find((d) => d.userId === userId)
  const affiliated =
    deck?.bakugans.filter((b) => b.bakuganData.family === gate.family) ?? []

  const hasAvailable = affiliated.some(
    (b) => !b.bakuganData.elimined && !b.bakuganData.onDomain
  )

  return hasAvailable ? 0 : getScoreWeights().characterGateMismatchPenalty
}

/** +2 character gate bien posée (bakugan affilié encore disponible) */
function scoreCharacterGateSetBonus(
  action: SimulateAction,
  state: stateType,
  userId: string
): number {
  if (action.type !== "SET_GATE") return 0

  const gate = GateCardsList.find((g) => g.key === action.gateId)
  if (!gate?.family) return 0

  const deck = state.decksState.find((d) => d.userId === userId)
  const hasAvailable = (deck?.bakugans ?? []).some(
    (b) =>
      b.bakuganData.family === gate.family &&
      !b.bakuganData.elimined &&
      !b.bakuganData.onDomain
  )

  return hasAvailable ? getScoreWeights().characterGateSetBonus : 0
}

function resolveSetBakuganPlacement(
  action: SimulateAction,
  state: stateType
): { bakuganKey: string; slotId: string } | null {
  if (action.type === "SET_BAKUGAN") {
    return { bakuganKey: action.bakuganKey, slotId: action.slot }
  }

  if (
    (action.type === "ABILITY_ADDITIONAL" || action.type === "GATE_ADDITIONAL") &&
    action.data.type === "SELECT_BAKUGAN_TO_SET"
  ) {
    const bakuganKey = action.data.bakugan.bakuganData.key
    const placed = state.protalSlots
      .flatMap((s) => s.bakugans.map((b) => ({ slot: s, bakugan: b })))
      .find((entry) => entry.bakugan.key === bakuganKey)
    if (!placed) return null
    return { bakuganKey, slotId: placed.slot.id }
  }

  return null
}

function scoreCharacterGateBakuganMismatch(
  action: SimulateAction,
  state: stateType
): number {
  const placement = resolveSetBakuganPlacement(action, state)
  if (!placement) return 0

  const slot = state.protalSlots.find((s) => s.id === placement.slotId)
  const gateKey = slot?.portalCard?.key
  if (!gateKey || !isCharacterGate(gateKey)) return 0

  const gate = GateCardsList.find((g) => g.key === gateKey)
  const bakugan =
    BakuganList.find((b) => b.key === placement.bakuganKey) ??
    state.protalSlots.flatMap((s) => s.bakugans).find((b) => b.key === placement.bakuganKey)

  if (!gate?.family || !bakugan?.family) return 0
  if (bakugan.family === gate.family) return 0

  return getScoreWeights().characterGateMismatchPenalty
}

/**
 * +2 bakugan sur sa character gate, +1 bakugan sur reactor de son attribut.
 * Gates attribut / command / trap hors reactor : score neutre (0).
 */
function scoreBakuganPlacementBonuses(
  action: SimulateAction,
  state: stateType
): number {
  const placement = resolveSetBakuganPlacement(action, state)
  if (!placement) return 0

  const slot = state.protalSlots.find((s) => s.id === placement.slotId)
  const gateKey = slot?.portalCard?.key
  if (!gateKey) return 0

  const gate = GateCardsList.find((g) => g.key === gateKey)
  if (!gate) return 0

  const bakugan =
    BakuganList.find((b) => b.key === placement.bakuganKey) ??
    state.protalSlots.flatMap((s) => s.bakugans).find((b) => b.key === placement.bakuganKey)

  if (!bakugan) return 0

  if (gate.family && bakugan.family === gate.family) {
    return getScoreWeights().characterBakuganMatchBonus
  }

  if (isReactorGate(gateKey) && gate.attribut && bakugan.attribut === gate.attribut) {
    return getScoreWeights().reactorBakuganMatchBonus
  }

  return 0
}

/** Économie abilities en bataille quand on mène déjà */
function scoreBattleAbilityEconomy(
  before: stateType,
  action: SimulateAction,
  userId: string
): number {
  if (action.type !== "USE_ABILITY") return 0
  if (!isActiveBattle(before)) return 0

  const totals = getBattlePowerTotals(before, userId)
  if (!totals || totals.botPower <= totals.opponentPower) return 0

  // turns === 1 → second tour de bataille (après le premier advance)
  if (before.battleState.turns === 1) {
    return getScoreWeights().abilityWasteTurnTwoLeading
  }

  return getScoreWeights().abilityWasteWhileLeading
}

/**
 * Trade-Off alliée : ne pas monter la puissance alliée ≥ 400
 * (sauf gate bloquée). S'applique à toutes les situations.
 */
function scoreTradeOffPowerCap(
  before: stateType,
  after: stateType,
  userId: string
): number {
  const slots = after.protalSlots.filter(
    (s) =>
      s.portalCard?.key === TRADE_OFF_KEY &&
      s.portalCard.userId === userId &&
      !isGateBlocked(s.state.blocked)
  )

  for (const afterSlot of slots) {
    const beforeSlot = before.protalSlots.find((s) => s.id === afterSlot.id)
    const beforeTotal = beforeSlot
      ? sumCurrentPower(beforeSlot.bakugans.filter((b) => b.userId === userId))
      : 0
    const afterTotal = sumCurrentPower(
      afterSlot.bakugans.filter((b) => b.userId === userId)
    )

    if (afterTotal >= getScoreWeights().tradeOffPowerCap && afterTotal > beforeTotal) {
      return getScoreWeights().tradeOffOverCapPenalty
    }
  }

  return 0
}

/**
 * Super Pyrus : si puissance adverse > alliée, ne pas ouvrir
 * (attendre l'auto-open de fin) sauf gate bloquée.
 */
function scoreSuperPyrusOpen(
  after: stateType,
  action: SimulateAction,
  userId: string
): number {
  if (action.type !== "ACTIVE_GATE" || action.gateId !== SUPER_PYRUS_KEY) return 0

  const slot = after.protalSlots.find((s) => s.id === action.slot)
  if (!slot?.portalCard || slot.portalCard.key !== SUPER_PYRUS_KEY) return 0
  if (slot.portalCard.userId !== userId) return 0
  if (isGateBlocked(slot.state.blocked)) return 0

  const { botPower, opponentPower } = getSlotPowerTotals(slot, userId)
  if (opponentPower > botPower) {
    return getScoreWeights().superPyrusBadOpenPenalty
  }

  return 0
}

/** Règles globales Super Pyrus + Trade-Off */
function scoreGlobalSpecialGates(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): number {
  return (
    scoreTradeOffPowerCap(before, after, userId) +
    scoreSuperPyrusOpen(after, action, userId)
  )
}

/** Critères de scoring bataille une fois l'état pleinement résolu. */
function scoreBattleResolved(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): number {
  let score = 0

  if (scoresPowerLead(after, userId)) {
    score += getScoreWeights().powerLeadPoints
  }

  if (scoresOpponentGateNeutralized(before, after, userId)) {
    score += getScoreWeights().gateNeutralizePoints
  }

  if (scoresOpponentBlockedNextTurn(after, userId)) {
    score += getScoreWeights().opponentBlockedPoints
  }

  // Effet immédiat de l'ouverture de gate / ability en bataille
  if (
    action.type === "ACTIVE_GATE" ||
    action.type === "USE_ABILITY" ||
    action.type === "CHANGE_ATTRIBUTE" ||
    action.type === "ABILITY_ADDITIONAL" ||
    action.type === "GATE_ADDITIONAL"
  ) {
    if (scoresAllAlliedPowerIncreased(before, after, userId)) {
      score += getScoreWeights().alliedPowerUpPoints
    }
    if (scoresFreeOpponentElimination(before, after, userId)) {
      score += getScoreWeights().freeElimPoints
    }
    if (scoresOpponentCannotUseAbilitiesNextTurn(after, userId)) {
      score += getScoreWeights().opponentNoAbilityPoints
    }
  }

  score += scoreBattleAbilityEconomy(before, action, userId)
  score += scoreGlobalSpecialGates(before, after, action, userId)
  score += scoreDynamicLearnedSignals(before, after, userId)
  score += scorePhaseActionPreference(before, action)

  return score
}

function projectBattleStartState(after: stateType): stateType | null {
  if (isActiveBattle(after)) return after
  if (hasPendingAdditional(after)) return null

  const projected = cloneRoomState(after)
  applyTurnAdvance(projected, projected.turnState.turn)

  if (!isActiveBattle(projected)) return null
  return projected
}

export function battleStartsNowOrNextTurn(after: stateType): boolean {
  return projectBattleStartState(after) !== null
}

/** +1 de base pour tout placement de gate (après tour 0 notamment) */
function scoreSetGatePlacementBonus(action: SimulateAction): number {
  return action.type === "SET_GATE" ? getScoreWeights().setGatePlacementBonus : 0
}

/**
 * Applique les poids `dyn:` découverts à l'entraînement pour des situations
 * non câblées explicitement dans les heuristiques historiques.
 */
function scoreDynamicLearnedSignals(
  before: stateType,
  after: stateType,
  userId: string
): number {
  // Facteur pour ne pas noyer les heuristiques historiques avec la somme des dyn:
  const DYNAMIC_SCORE_SCALE = 0.35
  return (
    scoreLearnableSignals(
      boardFromRoomState(before),
      boardFromRoomState(after),
      userId,
      getScoreWeights()
    ) * DYNAMIC_SCORE_SCALE
  )
}

/** Bonus d'imitation : types de coups préférés par phase (clés pref:). */
function scorePhaseActionPreference(
  before: stateType,
  action: SimulateAction
): number {
  const inBattle =
    before.battleState.battleInProcess === true && before.battleState.paused !== true
  const phase = resolveBotTrainingPhase(inBattle, before.battleState.turns ?? 0)
  const prefType = simulateActionToPrefType(action.type)
  if (!prefType) return 0

  const weight = getScoreWeights()[prefWeightKey(phase, prefType)]
  if (typeof weight !== "number") return 0
  return weight * 0.45
}

/** Scoring setup neutral (pas de bataille immédiate ni au tour suivant). */
function scoreNeutralSetupResolved(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): number {
  let score = 0

  score += scoreSetGatePlacementBonus(action)
  score += scoreCharacterGateSetPenalty(action, after, userId)
  score += scoreCharacterGateSetBonus(action, after, userId)
  score += scoreCharacterGateBakuganMismatch(action, after)
  score += scoreBakuganPlacementBonuses(action, after)
  score += scoreNeutralEffectActions(before, after, action, userId)
  score += scoreGlobalSpecialGates(before, after, action, userId)
  score += scoreDynamicLearnedSignals(before, after, userId)
  score += scorePhaseActionPreference(before, action)

  return score
}

function scoreNeutralResolved(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): number {
  const battleState = projectBattleStartState(after)
  if (battleState) {
    return scoreBattleResolved(before, battleState, action, userId)
  }

  return scoreNeutralSetupResolved(before, after, action, userId)
}

function scoreViaPendingAdditional(
  rootBefore: stateType,
  pendingState: stateType,
  userId: string,
  depth: number,
  scoreResolved: ResolvedScorer,
  personalities: personalities[] | undefined
): number | null {
  if (depth > MAX_ADDITIONAL_DEPTH) return 0

  const pendingAbility = pendingState.AbilityAditionalRequest[0]
  if (pendingAbility && isAdditionalRequestForUser(pendingAbility, userId)) {
    const options = expandAbilityAdditional(pendingAbility)
    let best = Number.NEGATIVE_INFINITY

    for (const option of options) {
      const result = simulateAction(pendingState, option)
      if (result.rejected) continue

      const nested = scoreViaPendingAdditional(
        rootBefore,
        result.state,
        userId,
        depth + 1,
        scoreResolved,
        personalities
      )
      const base =
        nested !== null
          ? nested
          : scoreResolved(rootBefore, result.state, option, userId)
      const score =
        nested !== null
          ? base
          : applyPersonalityMultiplier(base, {
              before: rootBefore,
              after: result.state,
              action: option,
              userId,
              personalities,
            })

      if (score > best) best = score
    }

    return best === Number.NEGATIVE_INFINITY ? 0 : best
  }

  const pendingGate = pendingState.gateCardActionRequest[0]
  if (
    pendingGate &&
    isAdditionalRequestForUser(pendingGate, userId) &&
    pendingGate.data.type !== "TURN_ACTION_LAUNCHER"
  ) {
    const options = expandGateAdditional(pendingGate)
    let best = Number.NEGATIVE_INFINITY

    for (const option of options) {
      const result = simulateAction(pendingState, option)
      if (result.rejected) continue

      const nested = scoreViaPendingAdditional(
        rootBefore,
        result.state,
        userId,
        depth + 1,
        scoreResolved,
        personalities
      )
      const base =
        nested !== null
          ? nested
          : scoreResolved(rootBefore, result.state, option, userId)
      const score =
        nested !== null
          ? base
          : applyPersonalityMultiplier(base, {
              before: rootBefore,
              after: result.state,
              action: option,
              userId,
              personalities,
            })

      if (score > best) best = score
    }

    return best === Number.NEGATIVE_INFINITY ? 0 : best
  }

  return null
}

function scoreNeutral(params: ScoreActionParams): number {
  const { before, after, action, userId, personalities } = params

  const viaAdditional = scoreViaPendingAdditional(
    before,
    after,
    userId,
    0,
    scoreNeutralResolved,
    personalities
  )
  if (viaAdditional !== null) {
    return viaAdditional
  }

  return applyPersonalityMultiplier(scoreNeutralResolved(before, after, action, userId), params)
}

function scoreInBattle(params: ScoreActionParams): number {
  const { before, after, action, userId, personalities } = params

  const viaAdditional = scoreViaPendingAdditional(
    before,
    after,
    userId,
    0,
    scoreBattleResolved,
    personalities
  )
  if (viaAdditional !== null) {
    return viaAdditional
  }

  return applyPersonalityMultiplier(scoreBattleResolved(before, after, action, userId), params)
}

function isBakuganPlacementAction(action: SimulateAction): boolean {
  if (action.type === "SET_BAKUGAN") return true
  if (
    (action.type === "ABILITY_ADDITIONAL" || action.type === "GATE_ADDITIONAL") &&
    action.data.type === "SELECT_BAKUGAN_TO_SET"
  ) {
    return true
  }
  return false
}

function isRelocationAction(action: SimulateAction): boolean {
  if (action.type !== "ABILITY_ADDITIONAL" && action.type !== "GATE_ADDITIONAL") {
    return false
  }
  const t = action.data.type
  return (
    t === "MOVE_BAKUGAN_TO_ANOTHER_SLOT" ||
    t === "ATTRACT_BAKUGAN" ||
    t === "SELECT_BAKUGAN_ON_DOMAIN" ||
    t === "SELECT_SLOT"
  )
}

/** rush_down : engage bataille / boost puissance alliée / dépasse l'adversaire */
function matchesRushDown(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  const engagesBattle =
    (!isActiveBattle(before) && isActiveBattle(after)) ||
    (!isActiveBattle(before) && battleStartsNowOrNextTurn(after))

  const powerUp = scoresAllAlliedPowerIncreased(before, after, userId)

  let surpass = false
  const powerState = isActiveBattle(after)
    ? after
    : projectBattleStartState(after)

  if (powerState) {
    const afterTotals = getBattlePowerTotals(powerState, userId)
    if (afterTotals && afterTotals.botPower > afterTotals.opponentPower) {
      const beforeTotals = isActiveBattle(before)
        ? getBattlePowerTotals(before, userId)
        : null
      surpass =
        !beforeTotals || beforeTotals.botPower <= beforeTotals.opponentPower
    }
  }

  return engagesBattle || powerUp || surpass
}

/**
 * zoner : pose bakugan sans combat, fuite de combat,
 * ou déplacement adverse mettant fin au combat.
 */
function matchesZoner(
  before: stateType,
  after: stateType,
  action: SimulateAction
): boolean {
  if (isBakuganPlacementAction(action)) {
    if (!isActiveBattle(after) && !battleStartsNowOrNextTurn(after)) {
      return true
    }
  }

  const fledBattle = isActiveBattle(before) && !isActiveBattle(after)
  if (fledBattle) return true

  if (isActiveBattle(before) && isRelocationAction(action) && !isActiveBattle(after)) {
    return true
  }

  return false
}

/**
 * blocker : aucune action adverse au tour suivant,
 * block/cancel gate, ou block abilities.
 */
function matchesBlocker(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  if (opponentHasNoActionsNextTurn(after, userId)) return true
  if (scoresAnyOpponentGateNeutralized(before, after, userId)) return true
  if (scoresAbilityBlockNewlySet(before, after)) return true
  if (scoresOpponentCannotUseAbilitiesNextTurn(after, userId)) return true
  return false
}

/**
 * setup : synergie character gate / reactor / pose de gate utile.
 */
function matchesSetup(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): boolean {
  if (action.type === "SET_GATE") {
    const gate = GateCardsList.find((g) => g.key === action.gateId)
    if (gate?.family) {
      const deck = after.decksState.find((d) => d.userId === userId)
      const hasAvailable = (deck?.bakugans ?? []).some(
        (b) =>
          b.bakuganData.family === gate.family &&
          !b.bakuganData.elimined &&
          !b.bakuganData.onDomain
      )
      if (hasAvailable) return true
    }
    // Pose de gate générique (hors tour 0) — setup board
    if (before.turnState.turnCount > 0) return true
  }

  if (scoreBakuganPlacementBonuses(action, after) > 0) return true

  return false
}

/**
 * finisher : élimination gratuite ou prise / maintien d'avantage de puissance en bataille.
 */
function matchesFinisher(
  before: stateType,
  after: stateType,
  userId: string
): boolean {
  if (scoresFreeOpponentElimination(before, after, userId)) return true

  const powerState = isActiveBattle(after)
    ? after
    : projectBattleStartState(after)
  if (!powerState) return false

  const afterTotals = getBattlePowerTotals(powerState, userId)
  if (!afterTotals || afterTotals.botPower <= afterTotals.opponentPower) return false

  // Priorise surtout le 2ᵉ tour de bataille / fin de combat
  if (isActiveBattle(before) && before.battleState.turns <= 1) return true

  const beforeTotals = isActiveBattle(before)
    ? getBattlePowerTotals(before, userId)
    : null
  // Vient de prendre l'avantage
  if (!beforeTotals || beforeTotals.botPower <= beforeTotals.opponentPower) return true

  return false
}

/**
 * control : denial (abilities / gates) + conservation de ressources (skip utile).
 */
function matchesControl(
  before: stateType,
  after: stateType,
  action: SimulateAction,
  userId: string
): boolean {
  if (scoresAbilityBlockNewlySet(before, after)) return true
  if (scoresOpponentCannotUseAbilitiesNextTurn(after, userId)) return true
  if (scoresAnyOpponentGateNeutralized(before, after, userId)) return true
  if (scoresTurnSkipSavesResources(before, action, userId)) return true
  return false
}

/**
 * Applique les multiplicateurs de personnalité (×1.5 par trait matché).
 * Uniquement sur score > 0 pour ne pas aggraver les pénalités.
 */
export function applyPersonalityMultiplier(
  score: number,
  params: Pick<
    ScoreActionParams,
    "before" | "after" | "action" | "userId" | "personalities"
  >
): number {
  if (score <= 0) return score

  const { before, after, action, userId, personalities } = params
  if (!personalities || personalities.length === 0) return score

  let multiplier = 1

  if (personalities.includes("rush_down") && matchesRushDown(before, after, userId)) {
    multiplier *= getScoreWeights().personalityMultiplier
  }

  if (personalities.includes("zoner") && matchesZoner(before, after, action)) {
    multiplier *= getScoreWeights().personalityMultiplier
  }

  if (personalities.includes("blocker") && matchesBlocker(before, after, userId)) {
    multiplier *= getScoreWeights().personalityMultiplier
  }

  if (personalities.includes("setup") && matchesSetup(before, after, action, userId)) {
    multiplier *= getScoreWeights().personalityMultiplier
  }

  if (personalities.includes("finisher") && matchesFinisher(before, after, userId)) {
    multiplier *= getScoreWeights().personalityMultiplier
  }

  if (personalities.includes("control") && matchesControl(before, after, action, userId)) {
    multiplier *= getScoreWeights().personalityMultiplier
  }

  return score * multiplier
}

export function scoreAction(params: ScoreActionParams): number {
  const { before } = params

  if (isNeutralSituation(before)) {
    return scoreNeutral(params)
  }

  return scoreInBattle(params)
}
