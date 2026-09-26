import { ElimineBakuganEffect } from "../../function/ability-cards-effects/elimine-bakugan-effect.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import type { AbilityCardsActions, bakuganToMoveType2 } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnField, isInActiveBattle } from "./helpers.js"

/**
 * Verdict du Bourreau — Darkus Warius.
 *
 * Warius condamne un bakugan adverse, ou qu'il se trouve sur le terrain. Si
 * Warius remporte le combat en cours, la sentence tombe : la cible est eliminee,
 * meme si elle n'a jamais mis un pied dans ce combat.
 *
 * C'est une menace a distance : elle force l'adversaire a choisir entre
 * defendre le combat et sauver la cible en la deplacant ou en la protegeant.
 */
export const VerdictDuBourreau: exclusiveAbilitiesType = {
    key: 'verdict-du-bourreau',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Darkus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: VerdictDuBourreau.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const targets = getOpponentsOnField(roomState, userId).filter(
            (b) => !b.statut.markedForDeath,
        )
        if (targets.length === 0) return animation

        const bakugans: bakuganToMoveType2[] = targets.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: b.slot_id,
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_target', params: { abilityKey: VerdictDuBourreau.key } },
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
        if (target.statut.markedForDeath) return

        const caster = roomData.protalSlots
            .find((s) => s.id === resolution.slot)
            ?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

        target.statut.markedForDeath = {
            check: true,
            origin: 'ABILITY',
            key: VerdictDuBourreau.key,
            ability: caster ? { key: VerdictDuBourreau.key, user: caster } : undefined,
        }

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: VerdictDuBourreau.key,
            sourceBakugan: caster,
            targetBakugans: [target],
            slotId: target.slot_id,
        })

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'bakugan_marked_for_death',
            params: { name: Bakugans[target.key].name },
        })
    },
    onWin({ roomState, userId }) {
        if (!roomState) return

        const condemned = roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => {
                const status = b.statut.markedForDeath
                return !!status && status.key === VerdictDuBourreau.key && b.userId !== userId
            })

        condemned.forEach((target) => {
            target.statut.markedForDeath = false

            NewAdditionnalMessage({
                roomState,
                key: 'bakugan_verdict_executed',
                params: { name: Bakugans[target.key].name },
            })

            ElimineBakuganEffect({ roomState, bakugan: target })
        })
    },
    onCanceled({ roomState }) {
        if (!roomState) return

        roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .forEach((bakugan) => {
                const status = bakugan.statut.markedForDeath
                if (!status || status.key !== VerdictDuBourreau.key) return
                bakugan.statut.markedForDeath = false
            })
    },
    activationConditions({ roomState, userId }) {
        return getOpponentsOnField(roomState, userId).length > 0
    },
    canUse({ roomState, bakugan }) {
        if (!isInActiveBattle(roomState, bakugan)) return false
        return getOpponentsOnField(roomState, bakugan.userId).length > 0
    },
}
