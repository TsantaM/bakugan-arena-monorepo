import { attribut } from "./game-data-types"

export type slots_id = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6"

export type turnStateType = {
    can_change_player_turn: boolean;
    turn: string;
    previous_turn: string | undefined
    turnCount: number;
    set_new_gate: boolean;
    set_new_bakugan: boolean;
    use_ability_card: boolean;
}

export type playersType = {
    id: string;
    image: string | null;
    displayUsername: string | null;
}

export type deck = {
    bakugans: string[];
    ability: string[];
    exclusiveAbilities: string[];
    gateCards: string[];
}

export type playerType = {
    player: playersType;
    deck: deck;
}

export type battleState = {
    battleInProcess: boolean,
    slot: slots_id | null,
    turns: number,
    paused: boolean
}

export type activateAbilities = {
    id: number,
    key: string,
    userId: string,
    bakuganKey: string,
    canceled: boolean,
}

export type bakuganOnSlot = {
    id: number,
    key: string,
    userId: string,
    powerLevel: number,
    currentPower: number,
    attribut: attribut,
    image: string,
    abilityBlock: boolean,
    assist: boolean,
    family: string
}

export type portalSlotsTypeElement = {
    id: slots_id,
    can_set: boolean,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: bakuganOnSlot[],
    state: {
        open: boolean,
        canceled: boolean,
        blocked: boolean
    },
    activateAbilities: activateAbilities[]
}

export type portalSlotsType = portalSlotsTypeElement[]


export type deckType = {
    deckId: string;
    userId: string;
    bakugans: ({
        bakuganData: {
            key: string;
            name: string;
            attribut: attribut;
            image: string;
            powerLevel: number;
            currentPowerLevel: number;
            activateAbilities: string[];
            persistantAbilities: string[];
            elimined: boolean;
            onDomain: boolean;
            gateCard: null;
            family: string
        };
        excluAbilitiesState: {
            key: string;
            name: string;
            description: string;
            usable_if_user_not_on_domain: boolean,
            used: boolean;
            dead: boolean;
        }[];
    } | null | undefined)[];
    abilities: {
        key: string;
        name: string;
        attribut: attribut | undefined;
        description: string;
        used: boolean;
        dead: boolean;
    }[];
    gates: {
        key: string;
        name: string;
        attribut: attribut | undefined;
        description: string;
        set: boolean;
        usable: boolean;
        dead: boolean;
    }[];
}

export type stateType = {
    roomId: string;
    players: {
        userId: string,
        usable_gates: number,
        usable_abilitys: number
    }[];
    turnState: turnStateType,
    persistantAbilities: activateAbilities[],
    battleState: battleState,
    decksState: deckType[];
    protalSlots: portalSlotsType;
    status: {
        finished: boolean,
        winner: string | null
    }
} | undefined