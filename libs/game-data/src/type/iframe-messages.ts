import type { portalSlotsType } from '../type/room-types'
import type { AnimationDirectivesTypes } from './animations-directives'

export type MessageToIframe =
    {
        type: 'INIT_GAME_ROOM',
        data: {
            slots: portalSlotsType,
            userId: string
        },
        token: string,
        roomId: string,
        userId: string
    } | {
        type: 'TURN_ACTION_ANIMATION',
        data: AnimationDirectivesTypes,
        token: string,
        roomId: string,
        userId: string
    }

export type MessageFromIframe =
    {
        type: 'ANIMATION_DONE'
    } | {
        type : 'INIT_ROOM'
    }