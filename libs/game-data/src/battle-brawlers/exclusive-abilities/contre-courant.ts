import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganOnSlot } from "../../type/room-types.js"
import { getCaster, getOpponentsOnSlot } from "./helpers.js"

/** Ce que chaque adversaire a gagne au-dela de sa puissance de base. */
function boostOf(bakugan: bakuganOnSlot): number {
    return Math.max(0, bakugan.currentPower - bakugan.powerLevel)
}

/**
 * Contre-Courant — Aquos Garganoid.
 *
 * Garganoid retourne le courant : chaque adversaire de la carte portail perd le
 * double de ce qu'il avait gagne au-dessus de sa puissance de base. Son bonus
 * est donc efface, puis retranche une seconde fois.
 *
 * C'est une punition des decks qui empilent les bonus (cartes Personnage,
 * Dragon Puissance Ultime, Reacteurs) : sans bonus adverse, elle ne fait rien.
 */
export const ContreCourant: exclusiveAbilitiesType = {
    key: 'contre-courant',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Aquos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: ContreCourant.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const boosted = getOpponentsOnSlot(caster.slotOfGate, userId).filter((b) => boostOf(b) > 0)
        if (boosted.length === 0) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: ContreCourant.key,
            sourceBakugan: caster.user,
            targetBakugans: boosted,
            slotId: slot,
        })

        boosted.forEach((opponent) => {
            PowerChange({ roomState, bakugan: opponent, G: boostOf(opponent) * 2, malus: true })
        })

        return null
    },
    activationConditions({ roomState, userId }) {
        return roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .some((b) => b.userId !== userId && boostOf(b) > 0)
    },
    canUse({ roomState, bakugan }) {
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false

        return getOpponentsOnSlot(slot, bakugan.userId).some((b) => boostOf(b) > 0)
    },
}
