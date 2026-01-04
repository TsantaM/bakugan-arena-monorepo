import type { attribut } from './game-data-types'
import type { bakuganInDeck, portalSlotsTypeElement, slots_id } from './room-types'

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
    data: SelectableAbilityCardAction[]
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

export type bakuganToMoveType = {
    key: string,
    userId: string,
    slot: slots_id
}

export type AbilityCardsActions = {
    type: 'SELECT_SLOT',
    message: string,
    slots: slots_id[]
} | {
    type: 'SELECT_BAKUGAN_TO_SET',
    message: string,
    bakugans: bakuganInDeck[]
} | {
    type: 'MOVE_BAKUGAN_TO_ANOTHER_SLOT',
    message: string,
    bakugans: bakuganToMoveType[],
    slots: slots_id[]
} | {
    type: 'SELECT_BAKUGAN_ON_DOMAIN',
    message: string,
    bakugans: bakuganToMoveType[],
} | {
    type: 'ATTRACT_BAKUGAN',
    message: string,
    bakugans: bakuganToMoveType[]
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
    bakugan: bakuganToMoveType,
    slot: slots_id
} | {
    type: 'SELECT_BAKUGAN_ON_DOMAIN',
    bakugan: string,
    slot: slots_id
} | {
    type: 'ATTRACT_BAKUGAN',
    bakugan: bakuganToMoveType
} | {
    type: 'SELECT_SLOT',
    slot: slots_id
}