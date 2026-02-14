import { AbilityCardsActions } from "../../type/actions-serveur-requests.js";

export function AbilityCardFailed({card} : {card: string}) {
    const animation: AbilityCardsActions = {
        type: "CARD_FAILED",
        message: `${card} failed`
    }

    return animation
}