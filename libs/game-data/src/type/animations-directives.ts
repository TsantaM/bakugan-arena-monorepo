import type { portalSlotsTypeElement, bakuganOnSlot, slots_id } from '../type/room-types'

export type Message = {
    userName?: string,
    text: string
}

export type AnimationDirectivesTypes =
    {
        type: 'SET_GATE_CARD',
        data: {
            slot: portalSlotsTypeElement
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'SET_BAKUGAN',
        data: {
            bakugan: bakuganOnSlot,
            slot: portalSlotsTypeElement
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'MOVE_BAKUGAN',
        data: {
            initialSlot: portalSlotsTypeElement,
            newSlot: portalSlotsTypeElement,
            bakugan: bakuganOnSlot,
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'OPEN_GATE_CARD',
        data: {
            slotId: slots_id,
            slot: portalSlotsTypeElement
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'CANCEL_GATE_CARD',
        data: {
            slot: portalSlotsTypeElement
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'COME_BACK_BAKUGAN',
        data: {
            bakugan: bakuganOnSlot,
            slot: portalSlotsTypeElement, // Before the bakugan was removed
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'ELIMINE_BAKUGAN',
        data: {
            bakugan: bakuganOnSlot,
            slot: portalSlotsTypeElement
        },
        message?: Message[],
        resolved: boolean
    } | {
        type: 'REMOVE_GATE_CARD',
        data: {
            slot: portalSlotsTypeElement
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'POWER_CHANGE',
        data: {
            bakugan: bakuganOnSlot[],
            powerChange: number,
            malus?: boolean
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'MOVE_TO_ANOTHER_SLOT',
        data: {
            initialSlot: portalSlotsTypeElement,
            newSlot: portalSlotsTypeElement,
            bakugan: bakuganOnSlot,
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'BATTLE_START',
        data: {
            slot: portalSlotsTypeElement
        },
        message?: Message[]
        resolved: boolean
    } | {
        type: 'BATTLE-END',
        message?: Message[],
        resolved: boolean
    } | {
        type: 'SET_BAKUGAN_AND_ADD_RENFORT',
        data: {
            bakugan: bakuganOnSlot,
            slot: portalSlotsTypeElement
        },
        message?: Message[],
        resolved: boolean
    } | {
        type: 'ACTIVE_ABILITY_CARD',
        resolve: false,
        data: {
            card: string,
        },
        message: Message[]
    }