import type { attribut } from './game-data-types'
import type { portalSlotsTypeElement, slots_id } from './room-types'

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

export type SelectableAbilityCardAction = {
    onBoardBakugans: onBoardBakugans[],
    notOnBoardBakugans: notOnBoardBakugans[]
}

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
        slots: slots_id[],
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
            bakuganId: string,
            slot: slots_id
        }[] | undefined
    },
    {
        type : 'ACTIVE_GATE_CARD',
        data: {
            slot: slots_id
        } | undefined
    }
]