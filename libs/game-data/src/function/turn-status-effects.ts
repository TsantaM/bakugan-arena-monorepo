import { Bakugans } from "../battle-brawlers/bakugans.js"
import type { bakuganOnSlot, stateType } from "../type/room-types.js"
import { PowerChange } from "./ability-cards-effects/power-change.js"
import { CustomAnimationDirective } from "./create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "./new-additional-message.js"

/** Perte de puissance par defaut d'un bakugan empoisonne, a chaque changement de tour. */
export const POISON_TICK_POWER = 50

/** Cle d'animation jouee quand le poison ronge un bakugan. */
export const POISON_TICK_ANIMATION_KEY = 'status:poison-tick'

/**
 * Poison : chaque bakugan porteur du statut `poisoned` perd de la puissance a
 * chaque changement de tour, tant qu'il reste sur le terrain.
 *
 * Le montant retire est celui stocke sur le statut (`value`), sinon
 * `POISON_TICK_POWER`.
 */
function applyPoisonTicks(roomState: stateType) {
    const poisoned: bakuganOnSlot[] = roomState.protalSlots
        .map((slot) => slot.bakugans)
        .flat()
        .filter((bakugan) => !!bakugan.statut.poisoned)

    poisoned.forEach((bakugan) => {
        const status = bakugan.statut.poisoned
        if (!status) return

        const power = status.value && status.value > 0 ? status.value : POISON_TICK_POWER

        CustomAnimationDirective({
            roomState,
            animationKey: POISON_TICK_ANIMATION_KEY,
            sourceBakugan: bakugan,
            targetBakugans: [bakugan],
            slotId: bakugan.slot_id,
        })

        NewAdditionnalMessage({
            roomState,
            key: 'bakugan_poison_tick',
            params: { name: Bakugans[bakugan.key].name, power },
        })

        PowerChange({
            roomState,
            bakugan,
            G: power,
            malus: true,
            origin: status.origin,
        })
    })
}

/**
 * Emplacements verrouilles (Brise-Muraille) : on decompte les tours restants et
 * on libere la pose de carte portail une fois le verrou expire.
 */
function updateSlotSetLocks(roomState: stateType) {
    roomState.protalSlots.forEach((slot) => {
        const lock = slot.setLock
        if (!lock) return

        lock.turns -= 1
        if (lock.turns > 0) return

        slot.setLock = false
        slot.can_set = true

        NewAdditionnalMessage({
            roomState,
            key: 'slot_set_lock_ended',
            params: { abilityKey: lock.key },
        })
    })
}

/**
 * Effets de statut resolus a chaque changement de tour.
 * Appele par `updateTurnState`, avant le recyclage des emplacements vides.
 */
export function ApplyTurnStatusEffects(roomState: stateType) {
    if (!roomState) return

    applyPoisonTicks(roomState)
    updateSlotSetLocks(roomState)
}
