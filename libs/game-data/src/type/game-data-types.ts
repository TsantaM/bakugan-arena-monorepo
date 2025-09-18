import { portalSlotsTypeElement, slots_id, stateType } from "./room-types"

export type attribut = 'Pyrus' | 'Subterra' | 'Haos' | 'Darkus' | 'Aquos' | 'Ventus'

export type ExtraInputsTypes = 'target' | 'targets-slot' | 'slot'


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
    extraInputs?: ExtraInputsTypes[];
    onActivate: ({ roomState, userId, bakuganKey, slot, target_slot, slot_to_move, target }: { roomState: stateType, roomId: string, userId: string, bakuganKey: string, slot: slots_id, target_slot: slots_id | '', slot_to_move: slots_id | '', target?: string | '' }) => void
    onCanceled?: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, userId: string, bakuganKey: string, slot: slots_id }) => void
    onWin?: ({ roomState, userId, slot }: { roomState: stateType, userId: string, slot: portalSlotsTypeElement }) => void
}

export type exclusiveAbilitiesType = {
    key: string;
    name: string;
    description: string;
    maxInDeck: number;
    extraInputs?: ExtraInputsTypes[];
    onActivate: ({ roomState, userId, bakuganKey, slot, target_slot, slot_to_move, target }: { roomState: stateType, roomId: string, userId: string, bakuganKey: string, slot: slots_id, target_slot: slots_id | '', slot_to_move: slots_id | '', target?: string | '' }) => void
    onCanceled?: ({ roomState, userId, bakuganKey, slot }: { roomState: stateType, userId: string, bakuganKey: string, slot: slots_id }) => void
    onWin?: ({ roomState, userId, slot }: { roomState: stateType, userId: string, slot: portalSlotsTypeElement }) => void
}

export type gateCardType = {
    key: string,
    name: string,
    description: string,
    maxInDeck: number,
    attribut?: attribut,
    onOpen: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
        bakuganKey?: string;
        userId?: string
    }) => void,
    onCanceled?: ({ roomState, slot }: {
        roomState: stateType;
        slot: slots_id;
        bakuganKey?: string;
        userId: string
    }) => void,
    autoActivationCheck?: ({ roomState, portalSlot }: { roomState: stateType, portalSlot: portalSlotsTypeElement }) => boolean
}