import { abilityCardsType } from "../../type/game-data-types";

export const CombatAerien: abilityCardsType = {
    key: 'combat-aerien',
    name: 'Combat Aérien',
    attribut: 'Ventus',
    description: `Permet à l'utilisateur de se déplacé vers une autre carte portail et l'empêche de s'ouvrir`,
    maxInDeck: 1
}

export const TornadeChaosTotal: abilityCardsType = {
    key: 'tornade-chaos-total',
    name: 'Tornade Chaos Total',
    maxInDeck: 1,
    attribut: 'Ventus',
    description: `Annule toutes les effets de la carte portail si elle est ouverte avant l'activation de cette capacité`
}

export const SouffleTout: abilityCardsType = {
    key: 'souffle-tout',
    name: 'Souffle Tout',
    attribut: 'Ventus',
    description: `Permet d'envoyer le Bakugan adverse sur une autre carte portail`,
    maxInDeck: 3
}

export const RetourDair: abilityCardsType = {
    key: 'retour-d-air',
    name: `Retour d'Air`,
    attribut: 'Ventus',
    maxInDeck: 1,
    description: `Permet à l'utilisateur de se retirer du combat`
}

export const TornadeExtreme: abilityCardsType = {
    key: 'tornade-extreme',
    name: 'Tornade Extreme',
    attribut: 'Ventus',
    description: `Permet à l'utilisateur d'attirer un Bakugan sur la carte portail où il se trouve`,
    maxInDeck: 1
}