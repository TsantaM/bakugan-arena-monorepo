import {
  SetBakuganActionRequest,
  type slots_id,
  type stateType,
  updateDeckGates,
  updateSlot,
} from "@bakugan-arena/game-data"

type ApplySetGateParams = {
  state: stateType
  userId: string
  gateId: string
  slot?: slots_id | null
}

/**
 * Pose une gate sur une copie d'état (équivalent logique de UpdateGate, sans état global).
 */
export function applySetGate({
  state,
  userId,
  gateId,
  slot,
}: ApplySetGateParams): { ok: true } | { ok: false; reason: string } {
  const resolvedSlot: slots_id =
    slot ??
    (state.turnState.turn === userId ? "slot-2" : "slot-5")

  const slotToUpdate = state.protalSlots.find((s) => s.id === resolvedSlot)
  const deckToUpdate = state.decksState.find((s) => s.userId === userId)
  const player = state.players.find((p) => p.userId === userId)

  if (!slotToUpdate || !deckToUpdate || !player) {
    return { ok: false, reason: "missing_slot_deck_or_player" }
  }

  if (slotToUpdate.portalCard !== null) {
    return { ok: false, reason: "slot_already_has_gate" }
  }

  if (player.usable_gates <= 0) {
    return { ok: false, reason: "no_usable_gates" }
  }

  const gateInDeck = deckToUpdate.gates.find((g) => g.key === gateId && !g.set && g.usable)
  if (!gateInDeck && !deckToUpdate.gates.some((g) => g.key === gateId)) {
    return { ok: false, reason: "gate_not_in_deck" }
  }

  const newSlotState = {
    ...slotToUpdate,
    can_set: false,
    portalCard: { key: gateId, userId },
  }

  const newDeckGates = updateDeckGates(deckToUpdate, gateId)

  state.players = state.players.map((p) =>
    p.userId === userId ? { ...p, usable_gates: p.usable_gates - 1 } : p
  )
  state.protalSlots = updateSlot(state.protalSlots, slotToUpdate.id, newSlotState)
  state.decksState = state.decksState.map((d) =>
    d.userId === userId ? { ...d, gates: newDeckGates } : d
  )

  const actionRequest =
    state.turnState.turn === userId
      ? state.ActivePlayerActionRequest
      : state.InactivePlayerActionRequest

  const merged = [
    ...actionRequest.actions.mustDo,
    ...actionRequest.actions.mustDoOne,
    ...actionRequest.actions.optional,
  ]

  if (!merged.some((a) => a.type === "SET_BAKUGAN")) {
    SetBakuganActionRequest({ roomState: state })
  }

  return { ok: true }
}
