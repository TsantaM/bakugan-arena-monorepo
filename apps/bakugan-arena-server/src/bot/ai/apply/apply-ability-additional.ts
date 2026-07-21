import {
  AbilityCardsList,
  ExclusiveAbilitiesList,
  type resolutionDataType,
  type stateType,
} from "@bakugan-arena/game-data"

type ApplyAbilityAdditionalParams = {
  state: stateType
  userId: string
  cardKey: string
  bakuganKey: string
  /** Résolution joueur (même forme que le client) */
  data: resolutionDataType
}

/**
 * Résout une ability/exclusive additional request sur une copie d'état
 * (équivalent logique d'AbilitiesAdditionalEffectsSocket, sans IO).
 */
export function applyAbilityAdditional({
  state,
  userId,
  cardKey,
  bakuganKey,
  data,
}: ApplyAbilityAdditionalParams):
  | { ok: true; shouldAdvanceTurn: boolean }
  | { ok: false; reason: string } {
  const requestIndex = state.AbilityAditionalRequest.findIndex(
    (req) =>
      req.bakuganKey === bakuganKey &&
      req.cardKey === cardKey &&
      req.userId === userId
  )

  if (requestIndex === -1) {
    return { ok: false, reason: "ability_additional_request_not_found" }
  }

  const request = state.AbilityAditionalRequest[requestIndex]
  const ability = [...AbilityCardsList, ...ExclusiveAbilitiesList].find(
    (a) => a.key === request.cardKey
  )

  if (!ability?.onAdditionalEffect) {
    state.AbilityAditionalRequest.splice(requestIndex, 1)
    return { ok: false, reason: "ability_has_no_additional_effect" }
  }

  const resolution = {
    roomId: state.roomId,
    userId,
    cardKey,
    bakuganKey,
    slot: request.slot,
    data,
  }

  const result = ability.onAdditionalEffect({
    resolution,
    roomData: state,
  })

  state.AbilityAditionalRequest.splice(requestIndex, 1)
  state.animations = []

  // Si onAdditionalEffect renvoie une nouvelle request (rare), on la laisse dans l'état
  // via mutation éventuelle de AbilityAditionalRequest par l'effet.

  const shouldAdvanceTurn = Boolean(result?.turnActionLaucher)

  return { ok: true, shouldAdvanceTurn }
}
