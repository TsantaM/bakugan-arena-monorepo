import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import type { AbilityCardsActions, bakuganToMoveType2 } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { getCaster, getOpponentsOnField } from "./helpers.js"

/**
 * Rapace Eclaireur — Ventus Falconeer.
 *
 * Falconeer survole le domaine et rapporte ce qu'il a vu : le nombre de
 * capacites exclusives encore disponibles chez la cible est revele, puis la
 * cible est reduite au silence — elle ne peut plus activer aucune capacite
 * jusqu'a l'annulation de cette carte.
 *
 * Seule carte d'information du jeu, et le seul musellement qui vise un bakugan
 * precis ou qu'il se trouve : Lumiere Aveuglante est limitee a l'emplacement du
 * lanceur, Visage du Chagrin bloque tout le monde pour un tour.
 */
export const RapaceEclaireur: exclusiveAbilitiesType = {
    key: 'rapace-eclaireur',
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    attribut: 'Ventus',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: RapaceEclaireur.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const targets = getOpponentsOnField(roomState, userId).filter((b) => !b.abilityBlock)
        if (targets.length === 0) return animation

        const bakugans: bakuganToMoveType2[] = targets.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: b.slot_id,
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_target', params: { abilityKey: RapaceEclaireur.key } },
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
        if (target.abilityBlock) return

        // Reconnaissance : on revele combien de capacites exclusives la cible
        // peut encore sortir.
        const remaining = roomData.decksState
            .find((d) => d.userId === target.userId)
            ?.bakugans.find((b) => b?.bakuganData.key === target.key)
            ?.excluAbilitiesState.filter((a) => !a.used && !a.dead).length ?? 0

        target.abilityBlock = true

        // `abilityBlock` est un simple booleen sans source : on note la cible
        // pour ne lever que ce musellement-la si la carte est annulee.
        roomData.persistantAbilities.push({
            id: roomData.persistantAbilities.length + 1,
            key: RapaceEclaireur.key,
            bakuganKey: resolution.bakuganKey,
            userId: resolution.userId,
            canceled: false,
            fusion: [`${target.key}::${target.userId}`],
        })

        const caster = roomData.protalSlots
            .find((s) => s.id === resolution.slot)
            ?.bakugans.find((b) => b.key === resolution.bakuganKey && b.userId === resolution.userId)

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: RapaceEclaireur.key,
            sourceBakugan: caster,
            targetBakugans: [target],
            slotId: target.slot_id,
            payload: { remaining },
        })

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'bakugan_scouted',
            params: { name: Bakugans[target.key].name, count: remaining },
        })
    },
    onCanceled({ roomState, userId, bakuganKey }) {
        if (!roomState) return

        const record = [...roomState.persistantAbilities]
            .reverse()
            .find(
                (a) =>
                    a.key === RapaceEclaireur.key &&
                    !a.canceled &&
                    a.userId === userId &&
                    a.bakuganKey === bakuganKey,
            )

        if (!record) return
        record.canceled = true

        const [entry] = record.fusion ?? []
        if (!entry) return

        const [targetKey, targetUserId] = entry.split('::')

        roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => b.key === targetKey && b.userId === targetUserId)
            .forEach((bakugan) => {
                bakugan.abilityBlock = false
            })
    },
    activationConditions({ roomState, userId }) {
        return getOpponentsOnField(roomState, userId).some((b) => !b.abilityBlock)
    },
    canUse({ roomState, bakugan }) {
        return getOpponentsOnField(roomState, bakugan.userId).some((b) => !b.abilityBlock)
    },
}
