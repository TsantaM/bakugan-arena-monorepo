import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { BlockAbilityCardsEffect, RemoveAbilityCardsBlockEffect } from "../../function/index.js"

export const VisageDuChagrin: exclusiveAbilitiesType = {
    key: 'visage-du-chagrin',
    name: 'Face of Grief',
    description: `Prevents the opponent from activationg abilities`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate: ({ roomState, userId, bakuganKey, slot }) => {
        if (!roomState) return null
        BlockAbilityCardsEffect({ roomState, userId, bakuganKey, slot, card: VisageDuChagrin, turns: 1 })
        return null
    },
    onCanceled({ roomState }) {
        if (!roomState) return
        RemoveAbilityCardsBlockEffect({ roomState, card: VisageDuChagrin })
    },
}