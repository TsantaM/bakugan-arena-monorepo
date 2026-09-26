import { ComeBackBakuganEffect } from "../../function/ability-cards-effects/come-back-bakugan-effect.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { pushReplayAnimation } from "../../function/replay/push-replay-animation.js"
import { ResetSlot } from "../../function/reset-slot.js"
import { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, isInActiveBattle } from "./helpers.js"

/**
 * Oeil du Cyclone — Ventus Skyress Tempete.
 *
 * Skyress leve un cyclone qui aspire tout : chaque bakugan present sur la carte
 * portail, allie comme adverse, retourne dans la main de son proprietaire. La
 * carte portail est retiree du jeu et le combat s'arrete sans vainqueur ni
 * elimine.
 *
 * Bouton d'arret d'urgence : la seule carte capable d'annuler un combat perdu
 * d'avance sans sacrifier personne — au prix d'un tempo entier et de la carte
 * portail.
 */
export const OeilDuCyclone: exclusiveAbilitiesType = {
    key: 'oeil-du-cyclone',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Ventus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: OeilDuCyclone.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const { slotOfGate, user } = caster

        CustomAnimationDirective({
            roomState,
            animationKey: OeilDuCyclone.key,
            sourceBakugan: user,
            targetBakugans: [...slotOfGate.bakugans],
            slotId: slot,
        })

        // Copie : `ComeBackBakuganEffect` retire les bakugans de la liste.
        const swept = [...slotOfGate.bakugans]
        swept.forEach((bakugan) => {
            ComeBackBakuganEffect({ bakugan, roomState })
        })

        const removeGateCard: AnimationDirectivesTypes = {
            type: 'REMOVE_GATE_CARD',
            data: { slot: slotOfGate },
            resolved: false,
        }

        roomState.animations.push(removeGateCard)
        pushReplayAnimation(roomState, removeGateCard)

        ResetSlot(slotOfGate)

        NewAdditionnalMessage({
            roomState,
            key: 'battle_dispersed',
            params: { abilityKey: OeilDuCyclone.key },
        })

        return null
    },
    canUse({ roomState, bakugan }) {
        return isInActiveBattle(roomState, bakugan)
    },
}
