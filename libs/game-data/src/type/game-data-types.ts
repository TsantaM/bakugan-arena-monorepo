import { slots_id, stateType } from "./room-types"

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
    maxInDeck: number,
    onActivate: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, roomId: string, userId: string, bakuganKey: string, slot: slots_id }) => void
}

export type exclusiveAbilitiesType = {
    key: string;
    name: string;
    description: string;
    maxInDeck: number;
    onActivate: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, roomId: string, userId: string, bakuganKey: string, slot: slots_id }) => void
}

export type gateCardType = {
    key: string,
    name: string,
    description: string,
    maxInDeck: number,
    attribut?: attribut,
    onOpen?: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
        bakuganKey?: string;
        userId: string
    }) => void,
    onCanceled?: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
        bakuganKey?: string;
        userId: string
    }) => void,
    onTurnStart?: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
    }) => boolean
    onTurnEnd?: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
    }) => boolean
}