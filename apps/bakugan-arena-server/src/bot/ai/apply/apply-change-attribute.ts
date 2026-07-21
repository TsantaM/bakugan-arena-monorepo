import { GateCards, Slots, type attribut, type bakuganOnSlot, type stateType } from "@bakugan-arena/game-data"

type ApplyChangeAttributeParams = {
  state: stateType
  userId: string
  bakugan: bakuganOnSlot
  attribut: attribut
}

/**
 * Change l'attribut d'un bakugan sur une copie d'état (équivalent logique de change-attribut, sans IO).
 */
export function applyChangeAttribute({
  state,
  bakugan,
  attribut,
}: ApplyChangeAttributeParams): { ok: true } | { ok: false; reason: string } {
  const slot = state.protalSlots[Slots.indexOf(bakugan.slot_id)]
  if (!slot) return { ok: false, reason: "slot_not_found" }

  const target = slot.bakugans.find((b) => b.userId === bakugan.userId && b.key === bakugan.key)
  if (!target) return { ok: false, reason: "bakugan_not_found" }
  if (target.alreadyChangeAttribut === true) {
    return { ok: false, reason: "already_changed_attribut" }
  }

  target.attribut = attribut
  target.alreadyChangeAttribut = true

  if (slot.portalCard !== null && slot.state.open && !slot.state.canceled) {
    const card = GateCards[slot.portalCard.key]
    if (card?.onAttributChange) {
      card.onAttributChange({
        attribut,
        bakugan: target,
        roomState: state,
        slot,
      })
    }
  }

  return { ok: true }
}
