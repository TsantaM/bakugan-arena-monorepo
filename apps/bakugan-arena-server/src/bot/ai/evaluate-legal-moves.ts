import type {
  ActionType,
  ActivePlayerActionRequestType,
  InactivePlayerActionRequestType,
  stateType,
} from "@bakugan-arena/game-data"
import { getBotByUserId, type personalities } from "../../functions/bot-data"
import { simulateAction } from "./simulate-action"
import { scoreAction } from "./score-action"
import {
  expandAbilityAdditional,
  expandGateAdditional,
  expandTurnAction,
  isAdditionalRequestForUser,
} from "./expand-legal-moves"
import type { SimulateAction } from "./types"
import {
  applyMatchAdaptation,
  buildMatchAdaptation,
  mergePersonalities,
  updateMatchMemory,
  type MatchAdaptation,
} from "./match-adaptation"
import {
  getBaseScoreWeights,
  runWithScoreWeights,
} from "./score-weights-runtime"
import {
  applyPhaseWeightOverlay,
} from "@bakugan-arena/drizzle-orm"
import {
  resolveBotTrainingPhase,
} from "@bakugan-arena/game-data"

export type ScoredMove = {
  /** Action à jouer (prête pour simulateAction / emit socket) */
  action: SimulateAction
  /** Score du coup */
  score: number
  /** État résultant après simulation (copie) */
  resultingState: stateType
  rejected: boolean
  reason?: string
  /** Description courte pour debug / logs */
  label: string
}

type TurnRequest = ActivePlayerActionRequestType | InactivePlayerActionRequestType

type EvaluateLegalMovesParams = {
  state: stateType
  userId: string
  /**
   * Request de tour courante. Si absente, on ne génère que TURN_SKIP
   * (sauf s'il y a des additional requests pending dans l'état).
   */
  request?: TurnRequest
  /** Override personnalités (sinon lues depuis bot-data via `persolaty`) */
  personalities?: personalities[]
  /** Si false, ignore l'adaptation de match (tests / debug). Défaut true. */
  adaptToMatch?: boolean
}

export type EvaluateLegalMovesResult = {
  moves: ScoredMove[]
  adaptation: MatchAdaptation | null
}

const flattenTurnActions = (request: TurnRequest): ActionType[] => {
  return [
    ...request.actions.mustDo,
    ...request.actions.mustDoOne,
    ...request.actions.optional,
  ]
}

const labelForAction = (action: SimulateAction): string => {
  switch (action.type) {
    case "SET_GATE":
      return `SET_GATE ${action.gateId} → ${action.slot ?? "auto"}`
    case "SET_BAKUGAN":
      return `SET_BAKUGAN ${action.bakuganKey} → ${action.slot}`
    case "USE_ABILITY":
      return `USE_ABILITY ${action.abilityId} (${action.bakuganKey} @ ${action.slot})`
    case "ACTIVE_GATE":
      return `ACTIVE_GATE ${action.gateId} @ ${action.slot}`
    case "CHANGE_ATTRIBUTE":
      return `CHANGE_ATTRIBUTE ${action.bakugan.key} → ${action.attribut}`
    case "TURN_SKIP":
      return "TURN_SKIP"
    case "ABILITY_ADDITIONAL":
      return `ABILITY_ADDITIONAL ${action.cardKey} → ${action.data.type}`
    case "GATE_ADDITIONAL":
      return `GATE_ADDITIONAL ${action.cardKey} → ${action.data.type}`
    default:
      return "UNKNOWN"
  }
}

const toScoredMove = (
  before: stateType,
  action: SimulateAction,
  userId: string,
  personalities: personalities[]
): ScoredMove => {
  const result = simulateAction(before, action)
  const score = result.rejected
    ? Number.NEGATIVE_INFINITY
    : scoreAction({
        before,
        after: result.state,
        action,
        userId,
        personalities,
      })

  return {
    action,
    score,
    resultingState: result.state,
    rejected: result.rejected,
    reason: result.reason,
    label: labelForAction(action),
  }
}

function scoreAllMoves(
  state: stateType,
  userId: string,
  traits: personalities[],
  request: TurnRequest | undefined
): ScoredMove[] {
  const finalize = (moves: ScoredMove[]): ScoredMove[] =>
    moves
      .filter((move) => !move.rejected)
      .sort((a, b) => b.score - a.score)

  const pendingAbility = state.AbilityAditionalRequest[0]
  if (pendingAbility && isAdditionalRequestForUser(pendingAbility, userId)) {
    return finalize(
      expandAbilityAdditional(pendingAbility).map((action) =>
        toScoredMove(state, action, userId, traits)
      )
    )
  }

  const pendingGate = state.gateCardActionRequest[0]
  if (
    pendingGate &&
    isAdditionalRequestForUser(pendingGate, userId) &&
    pendingGate.data.type !== "TURN_ACTION_LAUNCHER"
  ) {
    return finalize(
      expandGateAdditional(pendingGate).map((action) =>
        toScoredMove(state, action, userId, traits)
      )
    )
  }

  const moves: SimulateAction[] = []

  if (request) {
    for (const action of flattenTurnActions(request)) {
      moves.push(...expandTurnAction(action, userId))
    }

    const hasMustDo =
      request.actions.mustDo.length > 0 || request.actions.mustDoOne.length > 0
    if (!hasMustDo) {
      moves.push({ type: "TURN_SKIP", userId })
    }
  } else {
    moves.push({ type: "TURN_SKIP", userId })
  }

  return finalize(moves.map((action) => toScoredMove(state, action, userId, traits)))
}

/**
 * Énumère toutes les combinaisons légales, simule chaque coup,
 * et renvoie la liste scorée (meilleur score = meilleur coup).
 *
 * Applique l'adaptation de match (poids + personnalités) par défaut.
 */
export function evaluateLegalMoves({
  state,
  userId,
  request,
  personalities,
  adaptToMatch = true,
}: EvaluateLegalMovesParams): ScoredMove[] {
  return evaluateLegalMovesDetailed({
    state,
    userId,
    request,
    personalities,
    adaptToMatch,
  }).moves
}

export function evaluateLegalMovesDetailed({
  state,
  userId,
  request,
  personalities,
  adaptToMatch = true,
}: EvaluateLegalMovesParams): EvaluateLegalMovesResult {
  const baseTraits = personalities ?? getBotByUserId(userId)?.persolaty ?? []

  if (!adaptToMatch) {
    return {
      moves: scoreAllMoves(state, userId, baseTraits, request),
      adaptation: null,
    }
  }

  const memory = updateMatchMemory(state, userId)
  const adaptation = buildMatchAdaptation(state, userId, memory)
  const traits = mergePersonalities(baseTraits, adaptation.extraPersonalities)

  const inBattle =
    state.battleState.battleInProcess === true && state.battleState.paused !== true
  const phase = resolveBotTrainingPhase(inBattle, state.battleState.turns ?? 0)

  const adaptedWeights = applyPhaseWeightOverlay(
    applyMatchAdaptation(getBaseScoreWeights(), adaptation),
    phase
  )

  const moves = runWithScoreWeights(adaptedWeights, () =>
    scoreAllMoves(state, userId, traits, request)
  )

  return { moves, adaptation }
}

/**
 * Retourne le meilleur coup selon le score (ou undefined si aucun coup valide).
 */
export function pickBestMove(moves: ScoredMove[]): ScoredMove | undefined {
  if (moves.length === 0) return undefined
  return moves.reduce((best, move) => (move.score > best.score ? move : best))
}

/**
 * Sélection softmax : favorise le meilleur coup tout en gardant une exploration légère.
 * `temperature` bas → quasi déterministe ; haut → plus varié.
 */
export function pickMoveSoftmax(
  moves: ScoredMove[],
  temperature = 0.4
): ScoredMove | undefined {
  const valid = moves.filter((m) => Number.isFinite(m.score))
  if (valid.length === 0) return undefined
  if (valid.length === 1) return valid[0]

  const temp = Math.max(0.05, temperature)
  const maxScore = Math.max(...valid.map((m) => m.score))
  const weights = valid.map((m) => Math.exp((m.score - maxScore) / temp))
  const sum = weights.reduce((acc, w) => acc + w, 0)
  if (!(sum > 0)) return pickBestMove(valid)

  let cursor = Math.random() * sum
  for (let i = 0; i < valid.length; i++) {
    cursor -= weights[i]!
    if (cursor <= 0) return valid[i]
  }
  return valid[valid.length - 1]
}
