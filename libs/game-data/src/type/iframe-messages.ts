import { portalSlotsType } from '../type/room-types'
import { AnimationDirectivesTypes } from './animations-directives'

export type MessageToIframe =
    {
        type: 'INIT_GAME_ROOM',
        data: {
            slots: portalSlotsType,
            userId: string
        }
    } | {
        type: 'TURN_ACTION_ANIMATION',
        data: AnimationDirectivesTypes
    }

export type MessageFromIframe =
    {
        type: 'ANIMATION_DONE'
    }