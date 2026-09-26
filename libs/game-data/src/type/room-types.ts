import type { AnimationDirectivesTypes, Message } from "./animations-directives.js";
import type { GameLogState } from "./game-log-types.js";
import type { replayEntryType, replaySnapshotType } from "./replay-snapshot-types.js";
import { type attribut } from "./game-data-types.js"
import type { AbilityCardsActionsRequestsType, ActivePlayerActionRequestType, gateCardActionRequestsType, InactivePlayerActionRequestType } from './actions-serveur-requests.js'

export type slots_id = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6"

export type turnStateType = {
    can_change_player_turn: boolean;
    turn: string;
    previous_turn: string | undefined
    turnCount: number;
    set_new_gate: boolean;
    set_new_bakugan: boolean;
    use_ability_card: boolean;
    ability_card_block: {
        blocked: boolean;
        turn: number;
        reason: {
            key: string;
            attribut: attribut;
            bakugan: bakuganOnSlot;
            slot: slots_id;

        } | null;
    }
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
    fusion?: string[]
}

/** Statut actif posé sur un bakugan par une carte. */
export type onSlotStatutEffect = {
    check: true,
    origin: 'GATE' | 'ABILITY'
    key: string,
    /** Montant associé à l'effet (ex: puissance drainée à rendre si la cible meurt). */
    value?: number,
    ability?: {
        key: string,
        user: bakuganOnSlot
    }
}

export type onSlotStatutType = false | onSlotStatutEffect

export type bakuganOnSlot = {
    slot_id: slots_id
    id: number,
    key: string,
    userId: string,
    powerLevel: number,
    currentPower: number,
    attribut: attribut,
    secondAttribut?: attribut, 
    image: string,
    abilityBlock: boolean,
    alreadyChangeAttribut?: boolean,
    assist: false | {
        assist: true,
        addedWith: 'GATE' | 'ABILITY',
        key: string
    },
    statut: {
        trapped: onSlotStatutType,
        notRetreat: onSlotStatutType,
        poisoned: onSlotStatutType,
        protectedAgainstGate: onSlotStatutType,
        protectedAgainstAbility: onSlotStatutType,
        protected: onSlotStatutType,
        absorbPowerBoost: onSlotStatutType,
        toSave: onSlotStatutType,
        reanimated: onSlotStatutType,
        lifeLess: onSlotStatutType,
        /** Puissance verrouillee : le bakugan ignore tout gain et toute perte de puissance. */
        powerLocked?: onSlotStatutType,
        /** Garde du slot : encaisse a la place de ses allies les malus qui les visent. */
        guardian?: onSlotStatutType,
        /** Le prochain malus subi est converti en bonus de puissance equivalent. */
        reflectMalus?: onSlotStatutType,
        /** Retire definitivement du jeu : aucun effet de reanimation ne peut le ramener. */
        banished?: onSlotStatutType,
        /** Condamne : sera elimine si l'auteur de la marque remporte son combat. */
        markedForDeath?: onSlotStatutType
    },
    family: string
}

export type blockedCardSlotType = false | {
    blocked: true,
    blockedWith: 'GATE' | 'ABILITY',
    key: string
}

/** Interdiction temporaire de poser une carte portail sur un emplacement (Brise-Muraille). */
export type slotSetLockType = false | {
    locked: true,
    key: string,
    /** Joueur a l'origine du verrou. */
    userId: string,
    /** Tours restants avant liberation de l'emplacement. */
    turns: number
}

export type portalSlotsTypeElement = {
    id: slots_id,
    can_set: boolean,
    /** Pose de carte portail interdite sur cet emplacement pendant quelques tours. */
    setLock?: slotSetLockType,
    portalCard: {
        key: string,
        userId: string
    } | null,
    bakugans: bakuganOnSlot[],
    state: {
        open: boolean,
        canceled: boolean,
        blocked: blockedCardSlotType
    },
    activateAbilities: activateAbilities[]
}

export type portalSlotsType = portalSlotsTypeElement[]

export type bakuganInDeck = {
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
        family: string;
        /** Retire definitivement du jeu (Pacte Sanglant) : aucune reanimation possible. */
        banished?: boolean;
    };
    excluAbilitiesState: {
        key: string;
        name?: string;
        description?: string;
        usable_if_user_not_on_domain: boolean,
        used: boolean;
        dead: boolean;
    }[];
};

export type deckType = {
    deckId: string;
    userId: string;
    bakugans: bakuganInDeck[];
    abilities: {
        key: string;
        name?: string;
        attribut: attribut | undefined;
        description?: string;
        used: boolean;
        dead: boolean;
    }[];
    gates: {
        key: string;
        name?: string;
        attribut: attribut | undefined;
        description?: string;
        set: boolean;
        usable: boolean;
        dead: boolean;
    }[];
}

export type stateType = {
    connectedsUsers: Map<string, {
        gameboardSocket: string,
        nextjsSocket: string
    }>,
    spectators: Map<string, {
        gameboardSocket: string,
        nextjsSocket: string
    }>,
    messages: Message[]
    roomId: string;
    ranked: boolean;
    players: {
        userId: string,
        usable_gates: number,
        usable_abilitys: number,
        username: string,
        timer: number
    }[];
    turnState: turnStateType,
    persistantAbilities: activateAbilities[],
    battleState: battleState,
    decksState: deckType[];
    protalSlots: portalSlotsType;
    status: {
        finished: boolean,
        finisheAt: number | null,
        winner: string | null,
        elo: {
            winner: {
                newElo: number,
                bonus: number
            },
            loser: {
                newElo: number,
                malus: number
            }
        } | null
    },
    animations: AnimationDirectivesTypes[],
    animationsForReplay: replayEntryType[],
    initialReplaySnapshot: replaySnapshotType,
    InactivePlayerActionRequest: InactivePlayerActionRequestType,
    ActivePlayerActionRequest: ActivePlayerActionRequestType,
    AbilityAditionalRequest: AbilityCardsActionsRequestsType[],
    gateCardActionRequest: gateCardActionRequestsType[],
    createdAt: number,
    gameLog?: GameLogState
}

export type roomStateType = {
    turnState: turnStateType;
    deck: deckType[];
    portalSlots: portalSlotsType;
    battleState: battleState;
    timers: {
        userId: string,
        timer: number
        deadlineAt?: number | null
        running?: boolean
        serverNow?: number
    }[]
    eliminated: {
        user: number,
        opponnent: number
    };
    finished: Message | undefined
}