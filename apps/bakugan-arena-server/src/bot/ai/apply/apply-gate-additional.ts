import {
  GateCards,
  type resolutionGateCardDataType,
  type stateType,
} from "@bakugan-arena/game-data"

type ApplyGateAdditionalParams = {
  state: stateType
  userId: string
  cardKey: string
  data: resolutionGateCardDataType
}

/**
 * Résout une gate-card additional request sur une copie d'état
 * (équivalent logique de GateCardAdditionalEffectSocket, sans IO).
 */
export function applyGateAdditional({
  state,
  userId,
  cardKey,
  data,
}: ApplyGateAdditionalParams):
  | { ok: true; shouldAdvanceTurn: boolean }
  | { ok: false; reason: string } {
  const requestIndex = state.gateCardActionRequest.findIndex(
    (req) => req.cardKey === cardKey && req.userId === userId
  )

  if (requestIndex === -1) {
    return { ok: false, reason: "gate_additional_request_not_found" }
  }

  const request = state.gateCardActionRequest[requestIndex]
  const card = GateCards[request.cardKey]

  if (!card?.onAdditionalRequest) {
    state.gateCardActionRequest.splice(requestIndex, 1)
    return { ok: false, reason: "gate_has_no_additional_request" }
  }

  const resolution = {
    roomId: state.roomId,
    userId,
    cardKey,
    slot: request.slot,
    data,
  }

  const result = card.onAdditionalRequest({
    resolution,
    roomState: state,
  })

  state.gateCardActionRequest.splice(requestIndex, 1)
  state.animations = []

  // Certaines gates renvoient une request chainée
  if (result !== null && result.type !== "TURN_ACTION_LAUNCHER") {
    state.gateCardActionRequest.push({
      roomId: state.roomId,
      cardKey: request.cardKey,
      slot: request.slot,
      userId,
      data: result,
    })
    return { ok: true, shouldAdvanceTurn: false }
  }

  const shouldAdvanceTurn = result !== null && result.type === "TURN_ACTION_LAUNCHER"

  return { ok: true, shouldAdvanceTurn }
}
