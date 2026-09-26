import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/** Puissance retiree a chaque bakugan de la carte portail, lanceur excepte. */
const BLAZE_POWER = 50

/**
 * Brasier de Siege — Pyrus Siege.
 *
 * Siege met le feu a la carte portail entiere : tous les bakugans presents
 * perdent 50 Gs, ses propres allies compris. Seul Siege est epargne par ses
 * flammes.
 *
 * Premier effet de zone a degats collateraux du jeu : puissant a un contre un,
 * autodestructeur dans une formation groupee. Il force a choisir entre nombre
 * et frappe de zone.
 */
export const BrasierDeSiege: exclusiveAbilitiesType = {
    key: 'brasier-de-siege',
    maxInDeck: 2,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Pyrus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: BrasierDeSiege.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const burned = caster.slotOfGate.bakugans.filter((b) => b !== caster.user)
        if (burned.length === 0) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: BrasierDeSiege.key,
            sourceBakugan: caster.user,
            targetBakugans: burned,
            slotId: slot,
        })

        burned.forEach((bakugan) => {
            PowerChange({ roomState, bakugan, G: BLAZE_POWER, malus: true })
        })

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        caster.slotOfGate.bakugans
            .filter((b) => b !== caster.user)
            .forEach((bakugan) => {
                PowerChange({
                    roomState,
                    bakugan,
                    G: BLAZE_POWER,
                    malus: false,
                })
            })
    },
    canUse({ roomState, bakugan }) {
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false

        return slot.bakugans.length > 1
    },
}
