import { CancelGateCardDirectiveAnimation } from "../../function/create-animation-directives/cancel-gate-card.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { GateCardsList } from "../gate-gards.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster } from "./helpers.js"

/** Nombre de tours pendant lesquels l'emplacement reste condamne. */
const LOCK_TURNS = 2

/**
 * Brise-Muraille — Pyrus Warius.
 *
 * Warius ne se contente pas d'annuler la carte portail adverse : il defonce
 * l'emplacement. Pendant deux tours, plus personne ne peut y poser de carte
 * portail.
 *
 * La ou les annulations classiques laissent l'adversaire reposer une carte au
 * tour suivant, celle-ci retire durablement une case du plateau — ce qui pese
 * sur toutes les cartes qui comptent les portails (Gouffre de l'Esprit,
 * Grand Esprit) et sur la mobilite.
 */
export const BriseMuraille: exclusiveAbilitiesType = {
    key: 'brise-muraille',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Pyrus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: BriseMuraille.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const { slotOfGate, user } = caster
        const gateKey = slotOfGate.portalCard?.key

        if (!gateKey) return animation
        if (slotOfGate.portalCard?.userId === userId) return animation
        if (slotOfGate.state.canceled) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: BriseMuraille.key,
            sourceBakugan: user,
            slotId: slot,
        })

        // Annulation de la carte portail, si elle etait ouverte
        if (slotOfGate.state.open) {
            CancelGateCardDirectiveAnimation({
                animations: roomState.animations,
                slot: slotOfGate,
                turn: roomState.turnState.turnCount,
                roomState,
            })

            const gateToCancel = GateCardsList.find((g) => g.key === gateKey)
            if (gateToCancel && gateToCancel.onCanceled) {
                gateToCancel.onCanceled({ roomState, slot, userId, bakuganKey })
            }
        }

        slotOfGate.state.canceled = true

        // Condamnation de l'emplacement : plus aucune pose pendant LOCK_TURNS tours.
        slotOfGate.can_set = false
        slotOfGate.setLock = {
            locked: true,
            key: BriseMuraille.key,
            userId,
            turns: LOCK_TURNS,
        }

        NewAdditionnalMessage({
            roomState,
            key: 'slot_set_locked',
            params: { abilityKey: BriseMuraille.key, turns: LOCK_TURNS },
        })

        return null
    },
    onCanceled({ roomState, slot }) {
        if (!roomState) return

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        if (!slotOfGate) return

        const lock = slotOfGate.setLock
        if (!lock || lock.key !== BriseMuraille.key) return

        slotOfGate.setLock = false
        if (!slotOfGate.portalCard) slotOfGate.can_set = true
    },
    canUse({ roomState, bakugan }) {
        const slot = roomState.protalSlots.find((s) => s.id === bakugan.slot_id)
        if (!slot) return false
        if (slot.portalCard === null) return false
        if (slot.portalCard.userId === bakugan.userId) return false
        if (slot.state.canceled) return false

        return true
    },
}
