import { CombinationTripleEffect } from "../../function/ability-cards-effects/combination-triple-effect";
import type { abilityCardsType } from "../../type/game-data-types";

export const PyrusAquosHaos: abilityCardsType = {
    key: 'tripple-combination-pyrus-aquos-haos',
    name: 'Triple Correlation : Pyrus - Aquos - Haos',
    description: `If during the battle a player plays a combination of Fire (Pyrus), Water (Aquos) and Light (Haos), this card increases the G-Power of each of their Bakugans by 200 Gs`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return null
        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Pyrus', attribut_two: 'Aquos', attribut_tree: 'Haos', portalSlots: portalSlots, userId: userId })
        return null
    },
}

export const VentusSubterraDarkus: abilityCardsType = {
    key: 'tripple-combination-ventus-subterra-darkus',
    name: 'Triple Correlation : Ventus - Subterra - Darkus',
    description: `If during the battle a player plays a combination of Wind (Ventus), Earth (Subterra) and Darkness (Darkus), this card increases the G-Power of each of their Bakugans by 200 Gs`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return null
        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Ventus', attribut_two: 'Subterra', attribut_tree: 'Darkus', portalSlots: portalSlots, userId: userId })
        return null
    },
}