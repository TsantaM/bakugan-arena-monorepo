import type { bakuganOnSlot, portalSlotsTypeElement } from "../../type/room-types.js"
import { isProtectedAgainst, type EffectOrigin } from "./protection-status.js"

export type MoveRefusalReason =
    | 'trapped'
    | 'not_retreat'
    | 'protected'
    | 'same_slot'
    | 'no_gate_on_target'

/**
 * Garde unique de mobilité.
 *
 * À appeler AUX DEUX ENDROITS : quand une capacité construit la liste des cibles
 * proposables (`onActivate`) et quand elle applique réellement le déplacement
 * (`onAdditionalEffect`). L'état peut changer entre l'offre et la réponse du
 * joueur, et un client modifié peut renvoyer une cible absente de l'offre.
 */
export function canMoveBakugan(
    bakugan: bakuganOnSlot,
    origin: EffectOrigin = 'ABILITY',
): boolean {
    return moveRefusalReason(bakugan, origin) === null
}

export function moveRefusalReason(
    bakugan: bakuganOnSlot,
    origin: EffectOrigin = 'ABILITY',
): MoveRefusalReason | null {
    if (bakugan.statut.trapped) return 'trapped'
    if (bakugan.statut.notRetreat) return 'not_retreat'
    if (isProtectedAgainst(bakugan, origin)) return 'protected'
    return null
}

/** Le slot d'arrivée est-il une destination valide pour un déplacement ? */
export function isValidMoveTarget(
    fromSlot: portalSlotsTypeElement,
    toSlot: portalSlotsTypeElement,
): MoveRefusalReason | null {
    if (fromSlot.id === toSlot.id) return 'same_slot'
    if (toSlot.portalCard === null) return 'no_gate_on_target'
    return null
}

/** Prochain `id` libre sur un slot — les `id` doivent rester uniques par slot. */
export function nextBakuganIdOnSlot(slot: portalSlotsTypeElement): number {
    return slot.bakugans.reduce((max, b) => (b.id > max ? b.id : max), 0) + 1
}
