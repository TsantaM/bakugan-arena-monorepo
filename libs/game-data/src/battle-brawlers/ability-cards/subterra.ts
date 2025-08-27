import { abilityCardsType } from "../../type/game-data-types";

export const MagmaSupreme: abilityCardsType = {
    key: 'magma-supreme',
    name: 'Magma Supreme',
    description: `Transforme l'élément de la carte portail par celui de la terre (Subterra)`,
    attribut: 'Subterra',
    maxInDeck: 1
}

export const ChuteColossale: abilityCardsType = {
    key: 'chute-colossale',
    attribut: 'Subterra',
    name: 'Chute Colossale',
    maxInDeck: 2,
    description: `Permet à l'utilisateur de déplacer la carte portail où il se trouve vers une autre place sur le domaine`
}


export const CopieConforme: abilityCardsType = {
    key: 'copie-conforme',
    name: 'Copie Conforme',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `Permet de copier une des carte maîtrise déjà utilisée par l'adversaire`
}


export const Obstruction: abilityCardsType = {
    key: 'obstruction',
    name: 'Obstruction',
    attribut: 'Subterra',
    maxInDeck: 1,
    description: `L'utilisateur s'empare du niveau de puissance de l'adversaire avant l'utilisation de la maîtrise`
}


export const ForceDattraction: abilityCardsType = {
    key: `force-d'attraction`,
    name: `Force d'Attraction`,
    maxInDeck: 2,
    attribut: 'Subterra',
    description: `Permet d'attirer un bakugan alier sur la carte portail où se trouve l'utilisateur`
}