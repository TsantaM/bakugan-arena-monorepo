import { Bakugans } from "../../battle-brawlers/bakugans.js"
import { GateCardsList } from "../../battle-brawlers/gate-gards.js"
import type { Message } from "../../type/animations-directives.js"
import type { bakuganOnSlot, portalSlotsTypeElement, slots_id, stateType } from "../../type/room-types.js"
import { OpenGateCardActionRequest } from "../action-request-functions/open-gate-card-action-request.js"
import { CheckBattle } from "../check-battle-in-process.js"
import { CheckBattleStillInProcess } from "../check-battle-still-in-process.js"
import { CustomAnimationDirective } from "../create-animation-directives/custom-animation.js"
import { MoveToAnotherSlotDirectiveAnimation } from "../create-animation-directives/move-to-another-slot.js"
import { NewAdditionnalMessage } from "../new-additional-message.js"
import {
    isValidMoveTarget,
    moveRefusalReason,
    nextBakuganIdOnSlot,
    type MoveRefusalReason,
} from "./can-move-bakugan.js"
import { checkRenfortOnMove } from "./check-renfort-on-move.js"
import type { EffectOrigin } from "./protection-status.js"

export type BakuganMoveCustomAnimation = {
    animationKey: string
    sourceBakugan?: bakuganOnSlot
    targetBakugans?: bakuganOnSlot[]
    slotId?: slots_id
    payload?: Record<string, unknown>
    message?: Message[]
}

export type BakuganMoveOutcome =
    | { moved: true; bakugan: bakuganOnSlot }
    | { moved: false; reason: MoveRefusalReason | 'bakugan_not_on_slot' }

const REFUSAL_MESSAGE_KEY: Partial<Record<MoveRefusalReason, string>> = {
    protected: 'bakugan_protected',
    trapped: 'bakugan_trapped_cannot_move',
    not_retreat: 'bakugan_cannot_retreat',
}

/**
 * Déplacement d'un bakugan d'un slot à un autre — chemin unique pour toutes les
 * capacités (attraction, déplacement d'une cible, déplacement de soi).
 *
 * Garantit dans l'ordre : destination valide, mobilité de la cible, effet
 * `onRemoveBakugan` de la gate de départ, renfort sortant, **réattribution d'un
 * `id` libre sur le slot d'arrivée**, déplacement, animation, effet
 * `onSetBakuganOnSlot` de la gate d'arrivée, renfort entrant, **réévaluation de
 * l'état de combat**, puis rafraîchissement des actions d'ouverture de gate.
 */
export function applyBakuganMove({
    roomState,
    bakugan,
    fromSlot,
    toSlot,
    origin = 'ABILITY',
    trapWith,
    enableRenfort = true,
    customAnimations,
    additionalMessages,
    announceRefusal = true,
}: {
    roomState: stateType
    /** Référence vivante du bakugan présent sur `fromSlot`. */
    bakugan: bakuganOnSlot
    fromSlot: portalSlotsTypeElement
    toSlot: portalSlotsTypeElement
    origin?: EffectOrigin
    /** Pose `statut.trapped` à l'arrivée (Trappe de Sable). */
    trapWith?: { key: string; origin?: EffectOrigin }
    enableRenfort?: boolean
    customAnimations?: BakuganMoveCustomAnimation[]
    additionalMessages?: Message[]
    announceRefusal?: boolean
}): BakuganMoveOutcome {
    if (!roomState) return { moved: false, reason: 'bakugan_not_on_slot' }

    const index = fromSlot.bakugans.findIndex(
        (b) => b.key === bakugan.key && b.userId === bakugan.userId,
    )
    if (index < 0) return { moved: false, reason: 'bakugan_not_on_slot' }

    const targetRefusal = isValidMoveTarget(fromSlot, toSlot)
    if (targetRefusal) return { moved: false, reason: targetRefusal }

    const mobilityRefusal = moveRefusalReason(bakugan, origin)
    if (mobilityRefusal) {
        const messageKey = announceRefusal ? REFUSAL_MESSAGE_KEY[mobilityRefusal] : undefined
        if (messageKey) {
            NewAdditionnalMessage({
                roomState,
                key: messageKey,
                params: { name: Bakugans[bakugan.key]?.name ?? bakugan.key },
            })
        }
        return { moved: false, reason: mobilityRefusal }
    }

    // --- Effet de la gate de départ ---
    const leavingGate = GateCardsList.find((card) => card.key === fromSlot.portalCard?.key)
    leavingGate?.onRemoveBakugan?.({ bakugan, roomState, slot: fromSlot })

    checkRenfortOnMove({
        roomState,
        bakugan,
        slot: fromSlot,
        direction: 'leave',
        enabled: enableRenfort,
    })

    // --- Déplacement ---
    const newState: bakuganOnSlot = {
        ...bakugan,
        slot_id: toSlot.id,
        // Un `id` doit rester unique sur son slot : le client 3D en dérive des
        // identifiants DOM (left-renfor-<id>), et les gates calculent le suivant.
        id: nextBakuganIdOnSlot(toSlot),
        statut: {
            ...bakugan.statut,
            trapped: trapWith
                ? { check: true, key: trapWith.key, origin: trapWith.origin ?? origin }
                : bakugan.statut.trapped,
        },
    }

    toSlot.bakugans.push(newState)
    fromSlot.bakugans.splice(index, 1)

    // --- Animation ---
    if (customAnimations && customAnimations.length > 0) {
        customAnimations.forEach((animation) => {
            CustomAnimationDirective({
                roomState,
                animationKey: animation.animationKey,
                sourceBakugan: animation.sourceBakugan,
                targetBakugans: animation.targetBakugans ?? [structuredClone(newState)],
                slotId: animation.slotId ?? toSlot.id,
                payload: animation.payload ?? {
                    bakugan: structuredClone(newState),
                    initialSlot: structuredClone(fromSlot),
                    newSlot: structuredClone(toSlot),
                },
                message: animation.message,
            })
        })
    } else {
        MoveToAnotherSlotDirectiveAnimation({
            animations: roomState.animations,
            bakugan: structuredClone(newState),
            initialSlot: structuredClone(fromSlot),
            newSlot: structuredClone(toSlot),
            turn: roomState.turnState.turnCount,
            additionalMessages: additionalMessages ?? [],
            roomState,
        })
    }

    // --- Effet de la gate d'arrivée (sur le slot d'ARRIVÉE) ---
    const landingGate = GateCardsList.find((card) => card.key === toSlot.portalCard?.key)
    landingGate?.onSetBakuganOnSlot?.({ bakugan: newState, roomState, slot: toSlot })

    checkRenfortOnMove({
        roomState,
        bakugan: newState,
        slot: toSlot,
        direction: 'enter',
        enabled: enableRenfort,
    })

    // --- État de combat ---
    // D'abord clore un combat devenu invalide (le slot n'a plus deux joueurs),
    // ensuite seulement en démarrer un nouveau : CheckBattle interrompt le combat
    // en cours s'il est appelé pendant celui-ci.
    CheckBattleStillInProcess(roomState)
    if (!roomState.battleState.battleInProcess) {
        CheckBattle({ roomState })
    }

    OpenGateCardActionRequest({ roomState })

    return { moved: true, bakugan: newState }
}
