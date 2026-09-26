import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { POISON_TICK_POWER } from "../../function/turn-status-effects.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnSlot, strongestOf } from "./helpers.js"

/** Puissance retiree a chaque adversaire de la carte portail. */
const TIDE_POWER = 50

/**
 * Maree Corrosive — Aquos Stinglash.
 *
 * Stinglash deverse une maree acide sur la carte portail : chaque adversaire
 * present perd 50 Gs, et le plus puissant d'entre eux est empoisonne — il
 * continuera de fondre a chaque tour (voir `ApplyTurnStatusEffects`).
 *
 * Elle prolonge le venin de la famille Stinglash en frappe de zone : le coup
 * immediat est modeste, c'est la duree qui fait le travail.
 */
export const MareeCorrosive: exclusiveAbilitiesType = {
    key: 'maree-corrosive',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Aquos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: MareeCorrosive.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const opponents = getOpponentsOnSlot(caster.slotOfGate, userId)
        if (opponents.length === 0) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: MareeCorrosive.key,
            sourceBakugan: caster.user,
            targetBakugans: opponents,
            slotId: slot,
        })

        opponents.forEach((opponent) => {
            PowerChange({ roomState, bakugan: opponent, G: TIDE_POWER, malus: true })
        })

        const prime = strongestOf(opponents)
        if (prime && !prime.statut.poisoned) {
            prime.statut.poisoned = {
                check: true,
                origin: 'ABILITY',
                key: MareeCorrosive.key,
                value: POISON_TICK_POWER,
            }

            NewAdditionnalMessage({
                roomState,
                key: 'bakugan_poisoned',
                params: { name: Bakugans[prime.key].name, power: POISON_TICK_POWER },
            })
        }

        return null
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return

        getOpponentsOnSlot(caster.slotOfGate, userId).forEach((opponent) => {
            if (opponent.statut.poisoned && opponent.statut.poisoned.key === MareeCorrosive.key) {
                opponent.statut.poisoned = false
            }

            PowerChange({ roomState, bakugan: opponent, G: TIDE_POWER, malus: false })
        })
    },
    canUse({ roomState, bakugan }) {
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false

        return getOpponentsOnSlot(slot, bakugan.userId).length > 0
    },
}
