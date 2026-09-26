import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import type { AbilityCardsActions, bakuganToMoveType2 } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnField } from "./helpers.js"

/**
 * Etreinte de Pierre — Subterra Stinglash.
 *
 * La pince de Stinglash se referme : la cible ne peut plus quitter sa carte
 * portail (ni fuir, ni etre deplacee ou attiree), et l'emplacement lui-meme est
 * scelle — sa carte portail ne peut plus etre annulee ni echangee.
 *
 * Verrouillage pur : elle ne retire aucune puissance, elle supprime des options.
 * Redoutable contre les decks de mobilite (Ventus) et de swap de portails.
 */
export const EtreinteDePierre: exclusiveAbilitiesType = {
    key: 'etreinte-de-pierre',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Subterra',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: EtreinteDePierre.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const targets = getOpponentsOnField(roomState, userId).filter(
            (b) => !b.statut.trapped || !b.statut.notRetreat,
        )
        if (targets.length === 0) return animation

        const bakugans: bakuganToMoveType2[] = targets.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: b.slot_id,
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_target', params: { abilityKey: EtreinteDePierre.key } },
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
        if (!target || !slotTarget) return

        const status = {
            check: true,
            origin: 'ABILITY',
            key: EtreinteDePierre.key,
        } as const

        target.statut.trapped = { ...status }
        target.statut.notRetreat = { ...status }

        // L'emplacement est scelle : la carte portail ne peut plus etre
        // annulee ni echangee tant que l'etreinte tient.
        slotTarget.state.blocked = {
            blocked: true,
            blockedWith: 'ABILITY',
            key: EtreinteDePierre.key,
        }

        const caster = roomData.protalSlots
            .find((s) => s.id === resolution.slot)
            ?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: EtreinteDePierre.key,
            sourceBakugan: caster,
            targetBakugans: [target],
            slotId: target.slot_id,
        })

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'bakugan_stone_clasped',
            params: { name: Bakugans[target.key].name },
        })
    },
    onCanceled({ roomState }) {
        if (!roomState) return

        roomState.protalSlots.forEach((slot) => {
            if (slot.state.blocked && slot.state.blocked.key === EtreinteDePierre.key) {
                slot.state.blocked = false
            }

            slot.bakugans.forEach((bakugan) => {
                if (bakugan.statut.trapped && bakugan.statut.trapped.key === EtreinteDePierre.key) {
                    bakugan.statut.trapped = false
                }
                if (bakugan.statut.notRetreat && bakugan.statut.notRetreat.key === EtreinteDePierre.key) {
                    bakugan.statut.notRetreat = false
                }
            })
        })
    },
    activationConditions({ roomState, userId }) {
        return getOpponentsOnField(roomState, userId).length > 0
    },
    canUse({ roomState, bakugan }) {
        return getOpponentsOnField(roomState, bakugan.userId).some(
            (b) => !b.statut.trapped || !b.statut.notRetreat,
        )
    },
}
