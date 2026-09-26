import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import { moveBakuganToSelectedSlot, requestMoveSelfSlotSelection } from "../../function/ability-cards-effects/moveSelf.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getOpponentsOnSlot, weakestOf } from "./helpers.js"

/** Puissance retiree a la cible du piquer. */
const DIVE_POWER = 100

/**
 * Pique Incendiaire — Pyrus Falconeer.
 *
 * Falconeer abandonne sa position et pique sur une autre carte portail : il s'y
 * deplace, et le bakugan adverse le plus faible qui s'y trouve encaisse 100 Gs
 * dans la manoeuvre.
 *
 * Carte de tempo pour un petit bakugan (370 Gs) : elle transforme sa fragilite
 * en mobilite offensive au lieu de chercher a le faire gagner en force.
 */
export const PiqueIncendiaire: exclusiveAbilitiesType = {
    key: 'pique-incendiaire',
    maxInDeck: 2,
    extraInputs: ['move-self'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Pyrus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        return requestMoveSelfSlotSelection({
            roomState,
            userId,
            bakuganKey,
            slot,
            abilityKey: PiqueIncendiaire.key,
            activationConditions: PiqueIncendiaire.activationConditions,
        })
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (resolution.data.type !== 'SELECT_SLOT') return

        moveBakuganToSelectedSlot({
            resolution,
            roomData,
            customAnimations: [{ animationKey: PiqueIncendiaire.key }],
        })

        // Le piquer ne touche que si Falconeer est reellement arrive sur
        // l'emplacement choisi : le deplacement a pu etre refuse.
        const landingSlot = roomData.protalSlots.find((s) =>
            s.bakugans.some((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId),
        )
        if (!landingSlot) return
        if (landingSlot.id !== resolution.data.slot) return

        const prey = weakestOf(getOpponentsOnSlot(landingSlot, resolution.userId))
        if (!prey) return

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'bakugan_dive_hit',
            params: { name: Bakugans[prey.key].name, power: DIVE_POWER },
        })

        PowerChange({ roomState: roomData, bakugan: prey, G: DIVE_POWER, malus: true })
    },
    activationConditions({ roomState }) {
        // Il faut au moins une autre carte portail ou se poser.
        return roomState.protalSlots.filter((s) => s.portalCard !== null).length >= 2
    },
}
