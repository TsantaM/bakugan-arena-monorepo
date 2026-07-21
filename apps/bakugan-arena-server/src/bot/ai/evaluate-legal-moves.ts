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

/**
 * Énumère toutes les combinaisons légales, simule chaque coup,
 * et renvoie la liste scorée (meilleur score = meilleur coup).
 *
 * Priorité :
 * 1. Additional ability / gate en attente dans l'état
 * 2. Sinon actions du turn-action-request (+ TURN_SKIP si aucune mustDo)
 */
export function evaluateLegalMoves({
  state,
  userId,
  request,
  personalities,
}: EvaluateLegalMovesParams): ScoredMove[] {
  const traits = personalities ?? getBotByUserId(userId)?.persolaty ?? []

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
 * Retourne le meilleur coup selon le score (ou undefined si aucun coup valide).
 */
export function pickBestMove(moves: ScoredMove[]): ScoredMove | undefined {
  if (moves.length === 0) return undefined
  return moves.reduce((best, move) => (move.score > best.score ? move : best))
}
