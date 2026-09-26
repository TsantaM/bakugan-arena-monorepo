import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/**
 * Enigme du Sphinx — Manion.
 *
 * Manion pose son enigme : l'adversaire ne peut poser aucun nouveau bakugan sur
 * le terrain pendant son prochain tour.
 *
 * Le jeu ne disposait d'aucun levier sur l'economie de tour adverse : on
 * pouvait bloquer ses capacites, ses portails, jamais ses poses. Contre les
 * decks de renfort et d'occupation, un tour sans pose coute un tempo entier.
 */
export const EnigmeDuSphinx: exclusiveAbilitiesType = {
    key: 'enigme-du-sphinx',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Subterra',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        // `set_new_bakugan` est reevalue a chaque changement de tour : le
        // blocage porte donc exactement sur le prochain tour adverse.
        roomState.turnState.set_new_bakugan = false

        CustomAnimationDirective({
            roomState,
            animationKey: EnigmeDuSphinx.key,
            sourceBakugan: caster.user,
            slotId: slot,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'opponent_cannot_set_bakugan',
            params: { abilityKey: EnigmeDuSphinx.key },
        })

        return null
    },
    onCanceled({ roomState }) {
        if (!roomState) return

        // Pendant un combat, la pose est suspendue par les regles elles-memes :
        // annuler l'enigme ne doit pas la rouvrir.
        const { battleInProcess, paused } = roomState.battleState
        if (battleInProcess && !paused) return

        roomState.turnState.set_new_bakugan = true
    },
    activationConditions({ roomState }) {
        // Inutile pendant un combat : la pose y est deja suspendue.
        const { battleInProcess, paused } = roomState.battleState
        return !battleInProcess || paused
    },
}
