import { type portalSlotsTypeElement } from "../type/type-index.js";

export function ResetSlot(slot: portalSlotsTypeElement) {
    slot.bakugans = []
    slot.portalCard = null
    slot.can_set = true
    slot.state.open = false
    slot.state.canceled = false
    slot.state.blocked = false
    slot.activateAbilities = []
}