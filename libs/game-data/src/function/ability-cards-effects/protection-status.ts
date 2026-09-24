import type { bakuganOnSlot } from "../../type/room-types.js"

export type EffectOrigin = 'ABILITY' | 'GATE'

/** Immune to ability effects (`protected` covers both). */
export function isProtectedAgainstAbility(bakugan: bakuganOnSlot): boolean {
    return !!(bakugan.statut.protected || bakugan.statut.protectedAgainstAbility)
}

/** Immune to gate card effects (`protected` covers both). */
export function isProtectedAgainstGate(bakugan: bakuganOnSlot): boolean {
    return !!(bakugan.statut.protected || bakugan.statut.protectedAgainstGate)
}

export function isProtectedAgainst(
    bakugan: bakuganOnSlot,
    origin: EffectOrigin,
): boolean {
    return origin === 'GATE'
        ? isProtectedAgainstGate(bakugan)
        : isProtectedAgainstAbility(bakugan)
}

/**
 * Bakugan vidé de sa puissance : il reste sur le terrain mais ne peut plus rien faire
 * (aucune action possible) et ne peut plus être protégé d'une élimination.
 */
export function isLifeLess(bakugan: bakuganOnSlot): boolean {
    return !!bakugan.statut.lifeLess
}
