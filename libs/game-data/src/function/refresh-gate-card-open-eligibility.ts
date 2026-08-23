import { OpenGateCardActionRequest } from "./action-request-functions/open-gate-card-action-request.js"
import { handleGateCards } from "./gate-card-auto-activation.js"
import { stateType } from "../type/type-index.js"

/**
 * After an ability that blocked a gate is canceled, re-evaluate whether the
 * active player can open it manually and whether any gate should auto-open.
 */
export function refreshGateCardOpenEligibility(roomState: stateType) {
    if (!roomState) return []

    OpenGateCardActionRequest({ roomState })
    return handleGateCards(roomState)
}
