import type {
    AbilityCardsActionsRequestsType,
    AdditionalTargetResult,
    gateCardActionRequestsType,
    MessageFromIframe,
    TurnActionCommitPayload,
    TurnActionPartialSelection,
} from '@bakugan-arena/game-data'
import type { Message } from '@bakugan-arena/game-data'

const PARENT_ORIGIN = '*'

function postToParent(message: MessageFromIframe) {
    window.parent.postMessage(message, PARENT_ORIGIN)
}

export function sendMessageToParent(message: Message[] | undefined) {
    postToParent({
        type: 'GAME_MESSAGE',
        payload: message,
    })
}

/** Signale au parent que le tour courant est terminé. */
export function notifyParentTurnEnd() {
    postToParent({ type: 'GAME_TURN_END' })
}

/** Signale au parent que la file d'animations courante est terminée. */
export function notifyParentAnimationsDone() {
    postToParent({ type: 'GAME_ANIMATIONS_DONE' })
}

/** Signale au parent qu'une file d'animations démarre. */
export function notifyParentAnimationsStart() {
    postToParent({ type: 'GAME_ANIMATIONS_START' })
}

/** Forward du turn-action-request vers Next (option A). */
export function notifyParentTurnActionRequest(
    request: Extract<MessageFromIframe, { type: 'TURN_ACTION_REQUEST' }>['request'],
) {
    postToParent({
        type: 'TURN_ACTION_REQUEST',
        request,
    })
}

/** Forward d'une ability additional request vers Next. */
export function notifyParentAbilityAdditionalRequest(
    request: AbilityCardsActionsRequestsType,
) {
    postToParent({
        type: 'ADDITIONAL_ACTION_REQUEST',
        kind: 'ability',
        request,
    })
}

/** Forward d'une gate additional request vers Next. */
export function notifyParentGateAdditionalRequest(
    request: gateCardActionRequestsType,
) {
    postToParent({
        type: 'ADDITIONAL_ACTION_REQUEST',
        kind: 'gate',
        request,
    })
}

/** Cible 3D choisie → Next pour validation. */
export function notifyParentActionTargetSelected(payload: TurnActionCommitPayload) {
    postToParent({
        type: 'ACTION_TARGET_SELECTED',
        payload,
    })
}

export function notifyParentActionTargetCancelled() {
    postToParent({ type: 'ACTION_TARGET_CANCELLED' })
}

/** Cible 3D choisie pour une additional → Next. */
export function notifyParentAdditionalTargetSelected(payload: AdditionalTargetResult) {
    postToParent({
        type: 'ADDITIONAL_TARGET_SELECTED',
        payload,
    })
}

export type { TurnActionPartialSelection, TurnActionCommitPayload, AdditionalTargetResult }
