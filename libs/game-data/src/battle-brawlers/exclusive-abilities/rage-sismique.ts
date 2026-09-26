import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { countEliminated, getCaster } from "./helpers.js"

/** Bonus de base, avant le decompte des allies tombes. */
const BASE_POWER = 50
/** Bonus gagne par allie elimine. */
const POWER_PER_FALLEN_ALLY = 50
/** Plafond du bonus lie aux allies tombes. */
const MAX_FALLEN_BONUS = 200

/**
 * Rage Sismique — Pyrus Saurus.
 *
 * Plus ses allies tombent, plus Saurus frappe fort : +50 Gs, puis +50 Gs par
 * bakugan allie elimine (plafonne a +200 Gs).
 *
 * Carte de remontada : faible quand on domine, redoutable quand on encaisse.
 */
export const RageSismique: exclusiveAbilitiesType = {
    key: 'rage-sismique',
    maxInDeck: 2,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Pyrus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return null

        const fallenBonus = Math.min(
            countEliminated(roomState, userId) * POWER_PER_FALLEN_ALLY,
            MAX_FALLEN_BONUS,
        )
        const power = BASE_POWER + fallenBonus

        CustomAnimationDirective({
            roomState,
            animationKey: RageSismique.key,
            sourceBakugan: caster.user,
            slotId: slot,
            payload: { power, fallenBonus },
        })

        PowerChange({ roomState, bakugan: caster.user, G: power, malus: false })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        const fallenBonus = Math.min(
            countEliminated(roomState, userId) * POWER_PER_FALLEN_ALLY,
            MAX_FALLEN_BONUS,
        )

        PowerChange({
            roomState,
            bakugan: caster.user,
            G: BASE_POWER + fallenBonus,
            malus: true,
            ignoreProtection: true,
        })
    },
}
