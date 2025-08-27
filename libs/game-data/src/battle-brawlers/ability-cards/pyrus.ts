import { abilityCardsType } from "../../type/game-data-types";

export const MurDeFeu: abilityCardsType = {
    key: "mur-de-feu",
    name: "Mur de Feu",
    attribut: "Pyrus",
    description: "Retire 50 G au bakugan adverse",
    maxInDeck: 3
}

export const JetEnflamme: abilityCardsType = {
    key: 'jet-enflamme',
    name: 'Jet Enflammé',
    attribut: 'Pyrus',
    maxInDeck: 1,
    description: `Permet d'ajouter un bakugan en plus au combat s'il y a déjà au moins un Bakugan Pyrus sur le terrain`
}

export const RetroAction: abilityCardsType = {
    key: 'retro-action',
    maxInDeck: 2,
    attribut: 'Pyrus',
    name: 'Retro Action',
    description: `Calcine la carte portail de l'adversaire si elle est ouverte et en annule tous les effets`
}

export const TourbillonDeFeu: abilityCardsType = {
    key: 'tourbillon-de-feu',
    attribut: 'Pyrus',
    name: 'Tourbillon de Feu',
    maxInDeck: 1,
    description: `Protège l'utilisateur contre les effets de la carte portail et ajoute 50 G à l'utilisateur`
}