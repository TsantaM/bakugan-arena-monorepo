import type { stateType } from "@bakugan-arena/game-data";

function MoreSafeUsableSlots ({initialState, newState, userId} : {initialState: stateType, newState: stateType, userId: string}) {

    const safeSlotsInitial = initialState.protalSlots.filter((s) => s.portalCard?.userId === userId).length ?? 0
    const safeSlotsNew = newState.protalSlots.filter((s) => s.portalCard?.userId === userId).length ?? 0

    if(safeSlotsNew > safeSlotsInitial) {
        return 1
    } else if (safeSlotsNew < safeSlotsInitial) {
        return -1
    } else {
        return 0
    }

}

function MoreAbilityThanOpponent ({initialState, newState, userId} : {initialState: stateType, newState: stateType, userId: string}) {

    const userAbilities = newState.players.find((p) => p.userId === userId)?.usable_abilitys ?? 0
    const opponentAbilities = newState.players.find((p) => p.userId !== userId)?.usable_abilitys ?? 0
    
    if(userAbilities > opponentAbilities) {
        return 0.5
    } else if (userAbilities < opponentAbilities) {
        return -0.5
    } else {
        return 0
    }

}

function MoreGateCardThanOppoent({initialState, newState, userId} : {initialState: stateType, newState: stateType, userId: string}) {

    const userGateCards = newState.players.find((p) => p.userId === userId)?.usable_gates ?? 0
    const opponentGateCards = newState.players.find((p) => p.userId !== userId)?.usable_gates ?? 0

    if(userGateCards > opponentGateCards) {
        return 0.5
    } else if (userGateCards < opponentGateCards) {
        return -0.5
    } else {
        return 0
    }

}

export function CheckNeutralAdventage({initialState, newState, userId} : {initialState: stateType, newState: stateType, userId: string}) {
    const safeSlotsScore = MoreSafeUsableSlots({initialState, newState, userId})
    const abilityScore = MoreAbilityThanOpponent({initialState, newState, userId})
    const gateCardScore = MoreGateCardThanOppoent({initialState, newState, userId})

    return safeSlotsScore + abilityScore + gateCardScore

}