import { cloneRoomState } from "./clone-room-state"
import { applySetGate } from "./apply/apply-set-gate"
import { applySetBakugan } from "./apply/apply-set-bakugan"
import { applyUseAbility } from "./apply/apply-use-ability"
import { applyActiveGate } from "./apply/apply-active-gate"
import { applyChangeAttribute } from "./apply/apply-change-attribute"
import { applyTurnAdvance } from "./apply/apply-turn-advance"
import { applyAbilityAdditional } from "./apply/apply-ability-additional"
import { applyGateAdditional } from "./apply/apply-gate-additional"
import type { SimulateAction, SimulateActionOptions, SimulateActionResult } from "./types"
import type { stateType } from "@bakugan-arena/game-data"

const withPendingInfo = (
  state: stateType,
  rejected: boolean,
  reason?: string
): SimulateActionResult => ({
  state,
  rejected,
  reason,
  pendingAbilityRequest: state.AbilityAditionalRequest[0],
  pendingGateRequest: state.gateCardActionRequest[0],
})

/**
 * Simule une action joueur sur une **copie** de l'état de room.
 * L'état passé en entrée n'est jamais muté.
 *
 * Destiné à être enchaîné dans une boucle d'évaluation IA :
 * `const next = simulateAction(state, action).state`
 *
 * Si une aptitude / gate ouvre une additional request, le résultat expose
 * `pendingAbilityRequest` / `pendingGateRequest` — enchaîner alors avec
 * `ABILITY_ADDITIONAL` ou `GATE_ADDITIONAL`.
 */
export function simulateAction(
  state: stateType,
  action: SimulateAction,
  options: SimulateActionOptions = {}
): SimulateActionResult {
  const next = cloneRoomState(state)
  let rejected = false
  let reason: string | undefined
  let forceAdvance = options.advanceTurn === true

  switch (action.type) {
    case "SET_GATE": {
      const result = applySetGate({
        state: next,
        userId: action.userId,
        gateId: action.gateId,
        slot: action.slot,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
        break
      }

      // Tour 0 : les 2 gates posées déclenchent le passage de tour
      if (next.turnState.turnCount === 0) {
        const gatesOnField = next.protalSlots.filter((s) => s.portalCard !== null).length
        if (gatesOnField >= 2) forceAdvance = true
      }
      break
    }
    case "SET_BAKUGAN": {
      const result = applySetBakugan({
        state: next,
        userId: action.userId,
        bakuganKey: action.bakuganKey,
        slot: action.slot,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
      }
      break
    }
    case "USE_ABILITY": {
      const result = applyUseAbility({
        state: next,
        userId: action.userId,
        abilityId: action.abilityId,
        bakuganKey: action.bakuganKey,
        slot: action.slot,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
      }
      // Si additional request créée → ne pas advanceTurn tant qu'elle n'est pas résolue
      break
    }
    case "ACTIVE_GATE": {
      const result = applyActiveGate({
        state: next,
        userId: action.userId,
        gateId: action.gateId,
        slot: action.slot,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
      } else if (result.shouldAdvanceTurn) {
        forceAdvance = true
      }
      break
    }
    case "CHANGE_ATTRIBUTE": {
      const result = applyChangeAttribute({
        state: next,
        userId: action.userId,
        bakugan: action.bakugan,
        attribut: action.attribut,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
      }
      break
    }
    case "ABILITY_ADDITIONAL": {
      const result = applyAbilityAdditional({
        state: next,
        userId: action.userId,
        cardKey: action.cardKey,
        bakuganKey: action.bakuganKey,
        data: action.data,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
      } else if (result.shouldAdvanceTurn) {
        forceAdvance = true
      }
      break
    }
    case "GATE_ADDITIONAL": {
      const result = applyGateAdditional({
        state: next,
        userId: action.userId,
        cardKey: action.cardKey,
        data: action.data,
      })
      if (!result.ok) {
        rejected = true
        reason = result.reason
      } else if (result.shouldAdvanceTurn) {
        forceAdvance = true
      }
      break
    }
    case "TURN_SKIP": {
      // Ne pas skip tant qu'une additional request est ouverte
      if (
        next.AbilityAditionalRequest.length > 0 ||
        next.gateCardActionRequest.length > 0
      ) {
        return withPendingInfo(next, true, "pending_additional_request")
      }
      applyTurnAdvance(next, action.userId)
      return withPendingInfo(next, false)
    }
    default: {
      const _exhaustive: never = action
      void _exhaustive
      rejected = true
      reason = "unknown_action"
    }
  }

  // Ne pas avancer le tour s'il reste une additional request
  const hasPendingAdditional =
    next.AbilityAditionalRequest.length > 0 || next.gateCardActionRequest.length > 0

  if (!rejected && forceAdvance && !hasPendingAdditional) {
    applyTurnAdvance(next, action.userId)
  }

  return withPendingInfo(next, rejected, reason)
}
