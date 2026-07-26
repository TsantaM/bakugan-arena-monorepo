import type { attribut } from './game-data-types.js'
import type { bakuganOnSlot, portalSlotsType, slots_id } from './room-types.js'
import type { AnimationDirectivesTypes } from './animations-directives.js'
import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
} from './actions-serveur-requests.js'

/** Sélection partielle Next → gameboard : démarre le ciblage 3D. */
export type TurnActionPartialSelection =
    | {
        actionType: 'SET_GATE_CARD_ACTION'
        key: string
        slots: slots_id[]
    }
    | {
        actionType: 'SET_BAKUGAN'
        key: string
        attribut: attribut
        slots: slots_id[]
    }
    | {
        actionType: 'USE_ABILITY_CARD'
        key: string
        /** Noms mesh `${bakuganKey}-${userId}` sélectionnables */
        bakuganNames: string[]
        bakugans: { bakuganKey: string; slot: slots_id }[]
    }
    | {
        actionType: 'CHANGE_ATTRIBUTE'
        attribut: attribut
        bakuganNames: string[]
        bakugans: bakuganOnSlot[]
    }

/** Coup complet à valider (Next) puis à émettre (gameboard). */
export type TurnActionCommitPayload =
    | {
        actionType: 'SET_GATE_CARD_ACTION' | 'SELECT_GATE_CARD'
        gateId: string
        slot?: slots_id
    }
    | {
        actionType: 'SET_BAKUGAN'
        bakuganKey: string
        slot: slots_id
    }
    | {
        actionType: 'USE_ABILITY_CARD'
        abilityId: string
        bakuganKey: string
        slot: slots_id
    }
    | {
        actionType: 'OPEN_GATE_CARD' | 'ACTIVE_GATE_CARD'
        gateId: string
        slot: slots_id
    }
    | {
        actionType: 'CHANGE_ATTRIBUTE'
        attribut: attribut
        bakugan: bakuganOnSlot
    }
    | {
        actionType: 'SELECT_BAKUGAN'
        key: string
    }
    | {
        actionType: 'SELECT_ABILITY_CARD'
        key: string
        bakuganId: string
        slot: slots_id
    }

/** Next → iframe */
export type MessageToIframe =
    | {
        type: 'INIT_GAME_ROOM'
        data: {
            slots: portalSlotsType
            userId: string
        }
        token: string
        roomId: string
        userId: string
    }
    | {
        type: 'TURN_ACTION_ANIMATION'
        data: AnimationDirectivesTypes
        token: string
        roomId: string
        userId: string
    }
    | {
        type: 'SKIP_ANIMATIONS'
    }
    | {
        type: 'ACTION_PARTIAL_SELECTION'
        payload: TurnActionPartialSelection
    }
    | {
        type: 'COMMIT_ACTION'
        payload: TurnActionCommitPayload
    }
    | {
        type: 'CANCEL_TARGETING'
    }
    | {
        type: 'PASS_TURN'
    }
    | {
        type: 'CLEAR_TURN_UI'
    }

/** iframe → Next */
export type MessageFromIframe =
    | {
        type: 'ANIMATION_DONE'
    }
    | {
        type: 'INIT_ROOM'
    }
    | {
        type: 'GAME_MESSAGE'
        payload: unknown
    }
    | {
        type: 'GAME_TURN_END'
    }
    | {
        type: 'GAME_ANIMATIONS_START'
    }
    | {
        type: 'GAME_ANIMATIONS_DONE'
    }
    | {
        type: 'TURN_ACTION_REQUEST'
        request: ActivePlayerActionRequestType | InactivePlayerActionRequestType
    }
    | {
        type: 'ACTION_TARGET_SELECTED'
        payload: TurnActionCommitPayload
    }
    | {
        type: 'ACTION_TARGET_CANCELLED'
    }
