import type { bakuganOnSlot, portalSlotsTypeElement, slots_id, stateType } from "../../type/room-types.js"

/** Le bakugan qui active la carte, s'il est bien sur l'emplacement annonce. */
export function getCaster({
    roomState,
    slot,
    bakuganKey,
    userId,
}: {
    roomState: stateType
    slot: slots_id
    bakuganKey: string
    userId: string
}): { slotOfGate: portalSlotsTypeElement; user: bakuganOnSlot } | null {
    const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
    if (!slotOfGate) return null

    const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
    if (!user) return null

    return { slotOfGate, user }
}

/** Tous les bakugans adverses presents sur le terrain. */
export function getOpponentsOnField(roomState: stateType, userId: string): bakuganOnSlot[] {
    return roomState.protalSlots
        .map((s) => s.bakugans)
        .flat()
        .filter((b) => b.userId !== userId)
}

/** Les bakugans adverses presents sur un emplacement donne. */
export function getOpponentsOnSlot(slot: portalSlotsTypeElement, userId: string): bakuganOnSlot[] {
    return slot.bakugans.filter((b) => b.userId !== userId)
}

/** Les bakugans allies presents sur un emplacement donne, hors lanceur. */
export function getAlliesOnSlot(slot: portalSlotsTypeElement, user: bakuganOnSlot): bakuganOnSlot[] {
    return slot.bakugans.filter((b) => b.userId === user.userId && b !== user)
}

/** Le bakugan le plus faible d'une liste (puissance courante). */
export function weakestOf(bakugans: bakuganOnSlot[]): bakuganOnSlot | undefined {
    if (bakugans.length === 0) return undefined
    return bakugans.reduce((weakest, b) => (b.currentPower < weakest.currentPower ? b : weakest))
}

/** Le bakugan le plus puissant d'une liste (puissance courante). */
export function strongestOf(bakugans: bakuganOnSlot[]): bakuganOnSlot | undefined {
    if (bakugans.length === 0) return undefined
    return bakugans.reduce((strongest, b) => (b.currentPower > strongest.currentPower ? b : strongest))
}

/** Le nombre de bakugans elimines dans le deck d'un joueur. */
export function countEliminated(roomState: stateType, userId: string): number {
    const deck = roomState.decksState.find((d) => d.userId === userId)
    if (!deck) return 0
    return deck.bakugans.filter((b) => b?.bakuganData.elimined).length
}

/** Vrai si un combat est en cours et non mis en pause sur l'emplacement du bakugan. */
export function isInActiveBattle(roomState: stateType, bakugan: bakuganOnSlot): boolean {
    const { battleInProcess, paused, slot } = roomState.battleState
    if (!battleInProcess || paused || slot === null) return false
    return bakugan.slot_id === slot
}
