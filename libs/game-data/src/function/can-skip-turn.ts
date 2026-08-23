import type { stateType } from "../type/room-types.js"

/**
 * Un joueur peut terminer le tour seulement s'il est actif,
 * sans action obligatoire restante, et sans additional request en cours.
 */
export function canSkipTurn(state: stateType, userId: string): boolean {
    if (!state || state.status.finished) return false
    if (state.turnState.turn !== userId) return false
    if (
        state.gateCardActionRequest.length > 0 ||
        state.AbilityAditionalRequest.length > 0
    ) {
        return false
    }

    const actions = state.ActivePlayerActionRequest.actions
    return actions.mustDo.length === 0 && actions.mustDoOne.length === 0
}
