import { ComeBackBakuganEffect } from "../../function/ability-cards-effects/come-back-bakugan-effect.js"
import { canMoveBakugan } from "../../function/ability-cards-effects/can-move-bakugan.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnSlot, weakestOf } from "./helpers.js"

/**
 * Rafale Ascendante — Ventus Harpus.
 *
 * Harpus souffle vers le ciel : le bakugan adverse le plus faible de la carte
 * portail est renvoye dans la main de son proprietaire. Il n'est pas elimine —
 * il est simplement sorti du combat.
 *
 * Retrait sans elimination : l'adversaire perd son tempo et son placement, et
 * devra depenser une pose pour revenir. Utile la ou une elimination serait
 * impossible (cible protegee) ou contre-productive (Renaissance, Engourdissement).
 */
export const RafaleAscendante: exclusiveAbilitiesType = {
    key: 'rafale-ascendante',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Ventus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: RafaleAscendante.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const blowable = getOpponentsOnSlot(caster.slotOfGate, userId).filter((b) =>
            canMoveBakugan(b, 'ABILITY'),
        )

        const target = weakestOf(blowable)
        if (!target) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: RafaleAscendante.key,
            sourceBakugan: caster.user,
            targetBakugans: [target],
            slotId: slot,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_blown_away',
            params: { name: Bakugans[target.key].name },
        })

        ComeBackBakuganEffect({ bakugan: target, roomState })

        return null
    },
    canUse({ roomState, bakugan }) {
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false

        return getOpponentsOnSlot(slot, bakugan.userId).some((b) => canMoveBakugan(b, 'ABILITY'))
    },
}
