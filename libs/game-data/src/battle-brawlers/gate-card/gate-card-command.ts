import { gateCardType } from "../../type/game-data-types";

export const Rechargement: gateCardType = {
    key: 'rechargement',
    name: 'Rechargement',
    maxInDeck: 1,
    description: `Augmente le niveau de puissance du propriétaire de la carte de 100 G par Bakugan présent sur le domaine ayant le même élément`
}

export const TripleCombat: gateCardType = {
    key: 'triple-combat',
    name: 'Triple Combat',
    description: `Permet d'ajouter un Bakugan en plus sur le terrain`,
    maxInDeck: 1,
}

export const QuatuorDeCombat: gateCardType = {
    key: 'quatuor-de-combat',
    name: 'Quatuor de Combat',
    description: `Oblige chacun des joueur à ajouter un Bakugan en plus sur le terrain jusqu'à ce qu'il y en ai quatre (2v2)`,
    maxInDeck: 1,
}

export const RetourDAssenceur: gateCardType = {
    key: 'retour-d-air',
    name: `Retour d'air`,
    maxInDeck: 1,
    description: `Oblige le dernier Bakugan mis en jeu à revenir immédiatement entre les main du joueur qui l'a lancé`
}

export const BoucEmissaire: gateCardType = {
    key: 'bouc-emissaire',
    name: 'Bouc Emissaire',
    maxInDeck: 1,
    description: `Le propriétaire du premier Bakugan placé sur la carte peut décider de continuer le combat ou d'y mettre fin`
}

export const Armistice: gateCardType = {
    key: 'armistice',
    name: 'Armistice',
    maxInDeck: 1,
    description: `Met fin au combat et tous les Bakugans sur la carte quittent le champs de batail. Toutes les cartes maîtrises utilisées seront perdues`
}