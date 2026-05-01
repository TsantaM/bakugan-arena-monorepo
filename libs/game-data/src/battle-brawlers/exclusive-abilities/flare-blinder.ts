import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { BlockAbilityCardsEffect, RemoveAbilityCardsBlockEffect } from "../../function/index.js"
import { TentaclearHaos } from "../bakugans/tentacleer.js"

export const FlareBlinder: exclusiveAbilitiesType = {
    key: 'flare-blinder',
    name: 'Flare Blinder',
    maxInDeck: 1,
    description: `Prevent the opponent from activating abilities on the same slot as the user.`,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {

        if (bakuganKey !== TentaclearHaos.key) return null
        if (!roomState) return null
        BlockAbilityCardsEffect({ roomState, userId, bakuganKey, slot, card: FlareBlinder, turns: 1 })

        return null
    },
    onCanceled({ roomState }) {

        if (!roomState) return null
        RemoveAbilityCardsBlockEffect({ roomState, card: FlareBlinder })

    },
    canUse({ roomState, bakugan }) {
        if (!roomState) return false
        if (bakugan.key !== TentaclearHaos.key) return false

        return true
    },
}