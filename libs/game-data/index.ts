import { BakuganList, Bakugans } from './src/battle-brawlers/bakugans'
import { AbilityCards, AbilityCardsList } from './src/battle-brawlers/ability-cards'
import { ExclusiveAbilities, ExclusiveAbilitiesList } from './src/battle-brawlers/exclusive-abilities'
import { GateCards, GateCardsList } from './src/battle-brawlers/gate-gards'
import { attribut, bakuganType, abilityCardsType, exclusiveAbilitiesType, gateCardType, bakuganToMoveType } from './src/type/game-data-types'
import { slots_id, stateType, portalSlotsType, portalSlotsTypeElement, deckType, bakuganOnSlot } from './src/type/room-types'
import { CheckGameFinished } from './src/function/check-game-finished'
import { CheckBattle } from './src/function/check-battle-in-process'
import { ResetSlot } from "./src/function/reset-slot";
import { activeGateCardProps, setBakuganProps, setGateCardProps, useAbilityCardProps, useAbilityCardPropsFront } from './src/type/sockets-props-types'
import { applyWinAbilitiesEffects } from './src/function/apply-win-abilities-effects'
import { determineWinner } from './src/function/determine-battle-winner'
import { finalizeBattle } from './src/function/finalize-battle'
import { getPlayerDecksAndBakugans } from './src/function/get-players-data'
import { updateDeckBakugans } from './src/function/update-decks-bakugans'
import { addBakuganToSlot } from './src/function/add-bakugan-to-slot'
import { updateDeckGates, updateSlot } from './src/function/update-deck-data-gates'
import { updateTurnState } from './src/function/update-turn-state'
import { handleBattle } from './src/function/handle-battle'
import { handleGateCards } from './src/function/gate-card-auto-activation'

export {
    Bakugans,
    BakuganList,
    AbilityCards,
    AbilityCardsList,
    ExclusiveAbilities,
    ExclusiveAbilitiesList,
    GateCards,
    GateCardsList,

    CheckGameFinished,
    CheckBattle,
    ResetSlot,

    applyWinAbilitiesEffects,
    determineWinner,
    finalizeBattle,
    getPlayerDecksAndBakugans,
    updateDeckBakugans,

    updateTurnState,
    handleBattle,
    handleGateCards,
    addBakuganToSlot,
    updateDeckGates,
    updateSlot

}

export type {
    attribut,
    bakuganType,
    abilityCardsType,
    exclusiveAbilitiesType,
    gateCardType,
    slots_id,
    stateType,
    portalSlotsType,
    portalSlotsTypeElement,
    deckType,
    bakuganOnSlot,
    bakuganToMoveType,
    useAbilityCardPropsFront,

    activeGateCardProps,
    setBakuganProps,
    setGateCardProps,
    useAbilityCardProps
}

