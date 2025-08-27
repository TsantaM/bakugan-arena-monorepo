export type attribut = 'Pyrus' | 'Subterra' | 'Haos' | 'Darkus' | 'Aquos' | 'Ventus'


export type bakuganType = {
    name: string,
    attribut: attribut,
    powerLevel: number,
    image: string,
    key: string,
    family: string,
    exclusiveAbilities: string[]
}


export type abilityCardsType = {
    name: string,
    attribut: attribut,
    key: string,
    description: string,
    maxInDeck: number
}

export type exclusiveAbilitiesType = {    
    key: string;
    name: string;
    description: string;
    maxInDeck: number
}

export type gateCardType = {
    key: string,
    name: string,
    description: string,
    maxInDeck: number,
    attribut?: attribut,
}