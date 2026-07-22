import { AbilityCardsActions } from "../../type/actions-serveur-requests.js";

/** Ability activation failed — clients translate via `ability_failed` + abilityKey. */
export function AbilityCardFailed({ abilityKey }: { abilityKey: string }): AbilityCardsActions {
    return {
        type: "CARD_FAILED",
        abilityKey,
        message: {
            key: 'ability_failed',
            params: { abilityKey },
        },
    }
}
