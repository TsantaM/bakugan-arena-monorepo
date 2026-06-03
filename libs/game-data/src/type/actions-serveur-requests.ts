import type { attribut } from './game-data-types.js'
import type { bakuganInDeck, bakuganOnSlot, portalSlotsTypeElement, slots_id } from './room-types.js'

export type SelectableBakuganAction = {
    key: string,
    attribut: attribut,
    currentPower: number,
    name: string,
    image: string
}

export type SelectableGateCardAction = {
    key: string,
    name: string,
    description: string,
    image: string
}

export type onBoardBakugans = {
    slot: slots_id,
    bakuganKey: string,
    attribut: attribut,
    abilities: {
        key: string,
        name: string,
        description: string,
        image: string
    }[]
}

export type notOnBoardBakugans = {
    bakuganKey: string,
    abilities: {
        key: string,
        name: string,
        description: string,
        image: string
    }[]
}

export type SelectableAbilityCardAction = onBoardBakugans[]

export type ActionType = {
    type: 'SELECT_BAKUGAN',
    data: SelectableBakuganAction[]
} | {
    type: 'SELECT_GATE_CARD',
    data: SelectableGateCardAction[]
} | {
    type: 'SELECT_ABILITY_CARD',
    data: SelectableGateCardAction[]
} | {
    type: 'SET_BAKUGAN',
    data: {
        bakugans: SelectableBakuganAction[],
        setableSlots: slots_id[]
    }
} | {
    type: 'SET_GATE_CARD_ACTION',
    data: {
        cards: SelectableGateCardAction[],
        slots: slots_id[]
    }
} | {
    type: 'USE_ABILITY_CARD',
    data: SelectableAbilityCardAction
} | {
    type: 'ACTIVE_GATE_CARD',
    data: portalSlotsTypeElement
} | {
    type: 'OPEN_GATE_CARD',
    slot: slots_id,
    gateId: string
} | {
    type: 'CHANGE_ATTRIBUTE',
    data: {
        target: bakuganOnSlot,
        attributs: attribut[]
    }[]
}

export type ActivePlayerActionRequestType = {
    target: 'ACTIVE_PLAYER',
    actions: {
        mustDo: ActionType[],
        mustDoOne: ActionType[],
        optional: ActionType[]
    }
}

export type InactivePlayerActionRequestType = {
    target: 'INACTIVE_PLAYER',
    actions: {
        mustDo: ActionType[],
        mustDoOne: ActionType[],
        optional: ActionType[]
    }
}

// Ce bloc doit surement envore faire l'objet d'une refactorisation car il est absurdement verbeux et long

export type ActionRequestAnswerType = [
    {
        type: 'SELECT_GATE_CARD',
        data: {
            key: string,
            userId: string
        } | undefined
    },
    {
        type: 'SELECT_BAKUGAN',
        data: {
            key: string,
            userId: string
        } | undefined
    },
    {
        type: 'SELECT_ABILITY_CARD',
        data: {
            key: string,
            userId: string,
            bakuganId: string,
            slot: slots_id
        } | undefined
    },
    {
        type: 'SET_BAKUGAN',
        data: {
            key: string,
            userId: string,
            slot: slots_id | ''
        } | undefined
    },
    {
        type: 'SET_GATE_CARD_ACTION',
        data: {
            key: string,
            userId: string,
            slot: slots_id | ''
        } | undefined
    },
    {
        type: 'USE_ABILITY_CARD',
        data: {
            key: string,
            userId: string,
            bakuganId: string | '',
            slot: slots_id | ''
        } | undefined
    },
    {
        type: 'ACTIVE_GATE_CARD',
        data: {
            slot: slots_id
        } | undefined
    },
    {
        type: 'CHANGE_ATTRIBUTE',
        data: {
            bakugan: bakuganOnSlot | undefined,
            attribut: attribut
        } | undefined
    }
]


// --------------------------------------------

export type AbilityCardsActionsRequestsType = {
    roomId: string,
    cardKey: string,
    userId: string,
    bakuganKey: string,
    slot: slots_id,
    data: AbilityCardsActions
}

export type bakuganToMoveType2 = {
    key: string,
    userId: string,
    slot: slots_id
}

export type AbilityCardsActions = {
    type: 'SELECT_SLOT',
    target?: string // Le joueur qui va recevoir l'action request,
    message: string,
    skipable?: boolean,
    slots: slots_id[],
    emptySlot?: boolean
} | {
    type: 'SELECT_BAKUGAN_TO_SET',
    target?: string // Le joueur qui va recevoir l'action request,
    message: string,
    skipable?: boolean,
    bakugans: bakuganInDeck[],
} | {
    type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
    target?: string // Le joueur qui va recevoir l'action request,
    message: string,
    bakugans: bakuganToMoveType2[],
    skipable?: boolean,
    slots: slots_id[]
} | {
    type: 'SELECT_BAKUGAN_ON_DOMAIN',
    target?: string // Le joueur qui va recevoir l'action request,
    message: string,
    skipable?: boolean,
    bakugans: bakuganToMoveType2[],
} | {
    type: 'ATTRACT_BAKUGAN',
    target?: string // Le joueur qui va recevoir l'action request,
    message: string,
    skipable?: boolean,
    bakugans: bakuganToMoveType2[]
} | {
    type: 'CARD_FAILED',
    skipable?: boolean,
    message: string,
    target?: string // Le joueur qui va recevoir l'action request,
} | {
    type: 'SELECT_ABILITY_CARD',
    target?: string,// Le joueur qui va recevoir l'action request,
    message: string,
    skipable?: boolean,
    data: SelectableGateCardAction[]
}

export type resolutionType = {
    cardKey: string;
    userId: string;
    bakuganKey: string;
    slot: slots_id;
    roomId: string;
    data: resolutionDataType;
}


export type resolutionDataType = {
    type: 'SELECT_BAKUGAN_TO_SET',
    bakugan: bakuganInDeck
} | {
    type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
    bakugan: bakuganToMoveType2,
    slot: slots_id
} | {
    type: 'SELECT_BAKUGAN_ON_DOMAIN',
    bakugan: string,
    slot: slots_id,
    userId: string
} | {
    type: 'ATTRACT_BAKUGAN',
    bakugan: bakuganToMoveType2
} | {
    type: 'SELECT_SLOT',
    slot: slots_id
} | {
    type: 'SELECT_ABILITY_CARD',
    cardOwnerId: string,
    card: SelectableGateCardAction
} | {
    type: 'SKIP_ACTION'
}

export type gateCardAdditionalRequest = {
    type: 'SELECT_BAKUGAN_TO_SET',
    target?: string // Le joueur qui va recevoir l'action request,
    message: string,
    skipable?: boolean,
    bakugans: bakuganInDeck[],
} | {
    skipable?: boolean,
    target?: string // Le joueur qui va recevoir l'action request,
    type: 'SELECT_ABILITY_CARD',
    data: SelectableGateCardAction[],
    message: string,

} | {
    type: 'TURN_ACTION_LAUNCHER'
    target?: string // Le joueur qui va recevoir l'action request,
}

export type gateCardActionRequestsType = {
    roomId: string,
    cardKey: string,
    userId: string,
    slot: slots_id,
    data: gateCardAdditionalRequest
}

export type resolutionGateCardType = {
    cardKey: string;
    userId: string;
    slot: slots_id;
    roomId: string;
    data: resolutionGateCardDataType;
}

export type resolutionGateCardDataType = {
    type: 'SELECT_ABILITY_CARD',
    cardOwnerId: string,
    card: SelectableGateCardAction
} | {
    type: 'SELECT_BAKUGAN_TO_SET',
    bakugan: bakuganInDeck
} | {
    type: 'SKIP_ACTION'
}