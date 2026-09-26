import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/**
 * Carapace Reflechissante — Aquos Juggernoid.
 *
 * Juggernoid rentre dans sa coque : le prochain retrait de puissance qui le
 * vise n'est pas seulement encaisse, il est retourne — Juggernoid gagne le
 * montant au lieu de le perdre (voir `PowerChange`). L'effet se consomme au
 * premier malus.
 *
 * Contrairement a une protection, qui se contente d'ignorer l'attaque, la
 * carapace punit : plus l'adversaire frappe fort, plus il renforce sa cible.
 */
export const CarapaceReflechissante: exclusiveAbilitiesType = {
    key: 'carapace-reflechissante',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Aquos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null
        if (caster.user.statut.reflectMalus) return null

        caster.user.statut.reflectMalus = {
            check: true,
            origin: 'ABILITY',
            key: CarapaceReflechissante.key,
        }

        CustomAnimationDirective({
            roomState,
            animationKey: CarapaceReflechissante.key,
            sourceBakugan: caster.user,
            slotId: slot,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_reflect_ready',
            params: { name: Bakugans[caster.user.key].name },
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const status = caster.user.statut.reflectMalus
        if (!status || status.key !== CarapaceReflechissante.key) return

        caster.user.statut.reflectMalus = false
    },
    canUse({ bakugan }) {
        return !bakugan.statut.reflectMalus
    },
}
