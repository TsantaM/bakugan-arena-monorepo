import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { POISON_TICK_POWER } from "../../function/turn-status-effects.js"
import { Bakugans } from "../bakugans.js"
import type { AbilityCardsActions, bakuganToMoveType2 } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnField } from "./helpers.js"

/**
 * Venin Rampant — Darkus Stinglash.
 *
 * Stinglash inocule son venin a un bakugan adverse : la cible perd 50 Gs a
 * chaque changement de tour, tant qu'elle reste sur le terrain
 * (voir `ApplyTurnStatusEffects`).
 *
 * Premiere vraie carte d'usure du jeu : elle ne fait presque rien sur le
 * moment, mais elle rend couteux le fait de camper sur le terrain.
 */
export const VeninRampant: exclusiveAbilitiesType = {
    key: 'venin-rampant',
    maxInDeck: 2,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Darkus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: VeninRampant.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const targets = getOpponentsOnField(roomState, userId).filter((b) => !b.statut.poisoned)
        if (targets.length === 0) return animation

        const bakugans: bakuganToMoveType2[] = targets.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: b.slot_id,
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_target', params: { abilityKey: VeninRampant.key } },
            bakugans,
        }

        return request
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const { bakugan, slot, userId } = resolution.data
        if (userId === resolution.userId) return

        const slotTarget = roomData.protalSlots.find((s) => s.id === slot)
        const target = slotTarget?.bakugans.find((b) => b.key === bakugan && b.userId === userId)
        if (!target) return
        if (target.statut.poisoned) return

        const caster = roomData.protalSlots
            .find((s) => s.id === resolution.slot)
            ?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

        target.statut.poisoned = {
            check: true,
            origin: 'ABILITY',
            key: VeninRampant.key,
            value: POISON_TICK_POWER,
        }

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: VeninRampant.key,
            sourceBakugan: caster,
            targetBakugans: [target],
            slotId: target.slot_id,
        })

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'bakugan_poisoned',
            params: { name: Bakugans[target.key].name, power: POISON_TICK_POWER },
        })
    },
    onCanceled({ roomState }) {
        if (!roomState) return

        roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .forEach((bakugan) => {
                const status = bakugan.statut.poisoned
                if (!status || status.key !== VeninRampant.key) return
                bakugan.statut.poisoned = false
            })
    },
    activationConditions({ roomState, userId }) {
        return getOpponentsOnField(roomState, userId).some((b) => !b.statut.poisoned)
    },
    canUse({ roomState, bakugan }) {
        return getOpponentsOnField(roomState, bakugan.userId).some((b) => !b.statut.poisoned)
    },
}
