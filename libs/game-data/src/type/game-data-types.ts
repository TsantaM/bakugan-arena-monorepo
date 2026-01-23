import type { AbilityCardsActions, resolutionType } from "./actions-serveur-requests.js"
import type { portalSlotsTypeElement, slots_id, stateType } from "./room-types.js"

export type attribut = 'Pyrus' | 'Subterra' | 'Haos' | 'Darkus' | 'Aquos' | 'Ventus'

export type bakuganToMoveType = { slot: slots_id, bakuganKey: string, userId: string }

export type ExtraInputsTypes =
    // Déplacer le Bakugan adverse qui est sur la même carte portail que l'utilisateur vers une autre card (Dégage ! Va ailleurs)
    'move-opponent' |
    // Attire un Bakugan depuis une autre carte portail sur la carte où se trouve l'utilisateur (Viens ici)
    'drag-bakugan' |
    // L'utilisateur se déplace vers une autre carte portail (J'me tire d'ici)
    'move-self' |
    // Ajoute un nouveau bakugan alié sur la carte où se situe l'utilisateur (Joins toi à la fête)
    'add-bakugan' |
    // Déplace un bakugan se situant sur une autre carte portail vers n'importe quel slot du domaine (Toi va là bas)
    'move-bakugan'

export type bakuganType = {
    name: string,
    attribut: attribut,
    canChangeAttribut: boolean,
    seconaryAttribut?: attribut
    powerLevel: number,
    image: string,
    key: string,
    family: string,
    exclusiveAbilities: string[]
    // List of bakugans tha you can use with this one
    banList: string[]
}

export type abilityCardsType = {
    name: string,
    attribut?: attribut,
    key: string,
    description: string,
    maxInDeck: number,
    extraInputs?: ExtraInputsTypes[],
    usable_in_neutral: boolean,
    slotLimits?: boolean,
    image?: string,
    onActivate: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, roomId: string, userId: string, bakuganKey: string, slot: slots_id }) => null | AbilityCardsActions,
    onAdditionalEffect?: (({ resolution, roomData }: { resolution: resolutionType, roomData: stateType }) => void) | (({ resolution, roomData }: { resolution: resolutionType, roomData: stateType }) => { turnActionLaucher: boolean }),
    onCanceled?: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, userId: string, bakuganKey: string, slot: slots_id }) => void
    onWin?: ({ roomState, userId, slot }: { roomState: stateType, userId: string, slot: portalSlotsTypeElement }) => void
}

export type exclusiveAbilitiesType = {
    key: string;
    name: string;
    description: string;
    maxInDeck: number;
    extraInputs?: ExtraInputsTypes[],
    usable_in_neutral: boolean,
    slotLimits?: boolean,
    usable_if_user_not_on_domain: boolean,
    image?: string,
    onActivate: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, roomId: string, userId: string, bakuganKey: string, slot: slots_id }) => null | AbilityCardsActions,
    onAdditionalEffect?: (({ resolution, roomData }: { resolution: resolutionType, roomData: stateType }) => void) | (({ resolution, roomData }: { resolution: resolutionType, roomData: stateType }) => { turnActionLaucher: boolean }), onCanceled?: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, userId: string, bakuganKey: string, slot: slots_id }) => void
    onWin?: ({ roomState, userId, slot }: { roomState: stateType, userId: string, slot: portalSlotsTypeElement }) => void
}

export type turnActionLauncher = {
    turnAction: boolean
}

export type gateCardType = {
    key: string,
    name: string,
    description: string,
    maxInDeck: number,
    attribut?: attribut,
    family?: string,
    image: string,
    onOpen: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
        bakuganKey?: string;
        userId?: string;
    }) => null | turnActionLauncher,
    onCanceled?: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
        bakuganKey?: string;
        userId: string;
    }) => void,
    autoActivationCheck?: ({ roomState, portalSlot }: { roomState: stateType, portalSlot: portalSlotsTypeElement }) => boolean
}