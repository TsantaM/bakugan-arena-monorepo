import { GateCardsList, type slots_id, type stateType } from "@bakugan-arena/game-data"

type ApplyActiveGateParams = {
  state: stateType
  userId: string
  gateId: string
  slot: slots_id
}

/**
 * Ouvre une gate sur une copie d'état (équivalent logique partiel d'ActiveGateCard, sans IO).
 */
export function applyActiveGate({
  state,
  userId,
  gateId,
  slot,
}: ApplyActiveGateParams): { ok: true; shouldAdvanceTurn: boolean } | { ok: false; reason: string } {
  const slotOfGate = state.protalSlots.find((s) => s.id === slot)
  const gateCard = GateCardsList.find((g) => g.key === gateId)

  if (
    !slotOfGate ||
    slotOfGate.portalCard?.key !== gateId ||
    slotOfGate.state.open ||
    slotOfGate.state.blocked ||
    !gateCard
  ) {
    return { ok: false, reason: "cannot_open_gate" }
  }

  const bakuganKey = slotOfGate.bakugans.find((b) => b.userId === userId)?.key
  const key = bakuganKey === undefined || bakuganKey === "" ? undefined : bakuganKey

  const openFunction = gateCard.onOpen?.({
    roomState: state,
    slot,
    bakuganKey: key,
    userId,
  })

  slotOfGate.state.open = true

  if (!openFunction) {
    return { ok: true, shouldAdvanceTurn: false }
  }

  if (openFunction.type === "TURN_ACTION_LAUNCHER") {
    return { ok: true, shouldAdvanceTurn: true }
  }

  state.gateCardActionRequest.push({
    roomId: state.roomId,
    cardKey: gateCard.key,
    slot,
    userId,
    data: openFunction,
  })

  return { ok: true, shouldAdvanceTurn: false }
}
