import type { battleState, portalSlotsTypeElement } from "../../type/type-index.js";

export function CheckTwoBakugansAndBattle({ portalSlot, battleState }: { portalSlot: portalSlotsTypeElement, battleState: battleState }): boolean {

    const { battleInProcess, paused, slot } = battleState
    const bakugansOnSlot = portalSlot.bakugans.length

    if (bakugansOnSlot < 2) {
        return false
    }

    if (!battleInProcess && paused) {
        return false
    }

    if (portalSlot.id !== slot) {
        return false
    }

    return true

}