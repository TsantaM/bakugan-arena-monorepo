import { CombinationTripleEffect } from "../../function/ability-cards-effects/combination-triple-effect";
import type { abilityCardsType } from "../../type/game-data-types";

export const PyrusAquosHaos: abilityCardsType = {
    key: 'tripple-combination-pyrus-aquos-haos',
    name: 'Corrélation Triple : Pyrus - Aquos - Haos',
    description: `Si au cours de la battail un joueur met en jeu une combinaison de Feu (Pyrus), d'Eau (Aquos) et de Lumière (Haos), cette carte augmentera le niveau de chacun de ses bakugans de 200 G`,
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
    name: 'Corrélation Triple : Ventus - Subterra - Darkus',
    description: `Si au cours de la battail un joueur met en jeu une combinaison de Vent (Ventus), de Terre (Subterra) et de Ténèbre (Darkus), cette carte augmentera le niveau de chacun de ses bakugans de 200 G`,
    maxInDeck: 1,
    usable_in_neutral: true,
    onActivate({ roomState, userId }) {
        const portalSlots = roomState?.protalSlots
        if (!portalSlots) return null
        CombinationTripleEffect({ animations: roomState.animations, attribut_one: 'Ventus', attribut_two: 'Subterra', attribut_tree: 'Darkus', portalSlots: portalSlots, userId: userId })
        return null
    },
}