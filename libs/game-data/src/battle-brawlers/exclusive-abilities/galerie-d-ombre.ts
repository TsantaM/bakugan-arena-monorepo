import { applyBakuganMove } from "../../function/ability-cards-effects/apply-bakugan-move.js"
import { getAdjacentsSlots } from "../../function/filters/get-adjacents-slots.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import type { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { slots_id } from "../../type/room-types.js"
import { getCaster } from "./helpers.js"

/**
 * Galerie d'Ombre — Darkus Wormquake.
 *
 * Wormquake s'enfonce sous terre et ressort sur une carte portail adjacente. Il
 * quitte le combat sans etre elimine, et referme la galerie derriere lui : la
 * carte portail qu'il abandonne est annulee.
 *
 * C'est la sortie de secours du jeu : elle repond aux pieges a declenchement
 * automatique (Mine Fantome, Echange) que rien ne permettait d'esquiver.
 */
export const GalerieDOmbre: exclusiveAbilitiesType = {
    key: "galerie-d-ombre",
    maxInDeck: 1,
    extraInputs: ['move-self'],
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Darkus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: GalerieDOmbre.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const slots: slots_id[] = getAdjacentsSlots({ slot: caster.slotOfGate, roomState })
            .filter((candidate) => candidate.portalCard !== null)
            .map((candidate) => candidate.id)

        if (slots.length === 0) return animation

        const request: AbilityCardsActions = {
            type: 'SELECT_SLOT',
            message: { key: 'prompt_select_slot', params: { abilityKey: GalerieDOmbre.key } },
            slots,
        }

        return request
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (resolution.data.type !== 'SELECT_SLOT') return

        const fromSlot = roomData.protalSlots.find((s) =>
            s.bakugans.some((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId),
        )
        const destination = resolution.data.slot
        const toSlot = roomData.protalSlots.find((s) => s.id === destination)

        if (!fromSlot || !toSlot) return

        const user = fromSlot.bakugans.find(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId,
        )
        if (!user) return

        const outcome = applyBakuganMove({
            roomState: roomData,
            bakugan: user,
            fromSlot,
            toSlot,
            customAnimations: [{ animationKey: GalerieDOmbre.key, slotId: fromSlot.id }],
        })

        if (!outcome.moved) return

        // La galerie s'effondre derriere Wormquake.
        fromSlot.state.canceled = true

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'slot_collapsed',
            params: { abilityKey: GalerieDOmbre.key },
        })
    },
    canUse({ roomState, bakugan }) {
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false

        return getAdjacentsSlots({ slot, roomState }).some((s) => s.portalCard !== null)
    },
}
