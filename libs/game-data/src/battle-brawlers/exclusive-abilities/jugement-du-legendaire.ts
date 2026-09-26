import { CancelAbilityCardEffect } from "../../function/ability-cards-effects/cancel-ability-card-effect.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { LegendarySoldiersImage } from "../../store/gate-card-images.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/**
 * Jugement du Legendaire — Pyrus Apollonir.
 *
 * Apollonir remet le combat a plat : toutes les capacites actives sur la carte
 * portail sont annulees, des deux cotes — la sienne comprise. Bonus comme
 * malus disparaissent, chaque bakugan revient a ce que valent sa puissance de
 * base et sa carte portail.
 *
 * C'est le seul effacement symetrique du jeu : il ne fait pas gagner, il remet
 * le combat a zero. Une reponse aux empilements de bonus que ni les annulations
 * de portail ni les blocages de capacite ne savent defaire.
 */
export const JugementDuLegendaire: exclusiveAbilitiesType = {
    key: 'jugement-du-legendaire',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Pyrus',
    image: LegendarySoldiersImage.pyrus,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: JugementDuLegendaire.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const { slotOfGate, user } = caster

        const toCancel = slotOfGate.activateAbilities.filter(
            (a) => !a.canceled && a.key !== JugementDuLegendaire.key,
        )

        if (toCancel.length === 0) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: JugementDuLegendaire.key,
            sourceBakugan: user,
            targetBakugans: slotOfGate.bakugans,
            slotId: slot,
        })

        // Copie : `CancelAbilityCardEffect` mute la liste d'activations.
        toCancel.forEach((ability) => {
            CancelAbilityCardEffect({ roomState, slotOfGate, ability })
        })

        NewAdditionnalMessage({
            roomState,
            key: 'battlefield_judged',
            params: { abilityKey: JugementDuLegendaire.key, count: toCancel.length },
        })

        return null
    },
    activationConditions({ roomState, userId }) {
        const { slot } = roomState.battleState
        if (slot === null) return false

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return false
        void userId

        return slotOfGate.activateAbilities.some(
            (a) => !a.canceled && a.key !== JugementDuLegendaire.key,
        )
    },
    canUse({ roomState, bakugan }) {
        const slotOfGate = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slotOfGate) return false

        return slotOfGate.activateAbilities.some(
            (a) => !a.canceled && a.key !== JugementDuLegendaire.key,
        )
    },
}
