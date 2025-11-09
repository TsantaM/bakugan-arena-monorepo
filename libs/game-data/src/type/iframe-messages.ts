import { portalSlotsType } from '../type/room-types'

export type MessageToIframe =
    {
        type: 'INIT_GAME_ROOM',
        data: {
            slots: portalSlotsType,
            userId: string
        }
    } | {
        type: 'TURN_ACTION_ANIMATION',
    }

export type MessageFromIframe =
    {
        type: 'ANIMATION_DONE'
    }