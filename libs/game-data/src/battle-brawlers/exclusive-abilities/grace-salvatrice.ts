import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { Bakugans } from "../bakugans.js"
import { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganToMoveType2 } from "../../type/actions-serveur-requests.js"
import { getCaster, isInActiveBattle } from "./helpers.js"

/**
 * Grace Salvatrice — Aquos Angelo.
 *
 * Angelo designe un allie engage dans le combat : si le combat est perdu, cet
 * allie est epargne et revient dans la main de son proprietaire au lieu d'etre
 * elimine (statut `toSave`, deja gere par la fin de combat).
 *
 * Miroir defensif du Pacte Sanglant de Diablo : l'un parie, l'autre assure.
 */
export const GraceSalvatrice: exclusiveAbilitiesType = {
    key: 'grace-salvatrice',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Aquos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: GraceSalvatrice.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        // Tous les allies du combat, Angelo compris : il peut se sauver lui-meme.
        const savable = caster.slotOfGate.bakugans.filter(
            (b) => b.userId === userId && !b.statut.toSave && !b.statut.lifeLess,
        )

        if (savable.length === 0) return animation

        const bakugans: bakuganToMoveType2[] = savable.map((b) => ({
            key: b.key,
            userId: b.userId,
            slot: b.slot_id,
        }))

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_ON_DOMAIN',
            message: { key: 'prompt_select_bakugan_target', params: { abilityKey: GraceSalvatrice.key } },
            bakugans,
        }

        return request
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (resolution.data.type !== 'SELECT_BAKUGAN_ON_DOMAIN') return

        const { bakugan, slot, userId } = resolution.data

        const slotTarget = roomData.protalSlots.find((s) => s.id === slot)
        const target = slotTarget?.bakugans.find((b) => b.key === bakugan && b.userId === userId)
        if (!target) return

        // On ne protege que ses propres bakugans.
        if (target.userId !== resolution.userId) return
        if (target.statut.toSave) return

        target.statut.toSave = {
            check: true,
            origin: 'ABILITY',
            key: GraceSalvatrice.key,
        }

        const caster = slotTarget?.bakugans.find(
            (b) => b.key === resolution.bakuganKey && b.userId === resolution.userId,
        )

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: GraceSalvatrice.key,
            sourceBakugan: caster,
            targetBakugans: [target],
            slotId: target.slot_id,
        })

        NewAdditionnalMessage({
            roomState: roomData,
            key: 'bakugan_will_be_saved',
            params: { name: Bakugans[target.key].name },
        })
    },
    onCanceled({ roomState, userId }) {
        if (!roomState) return

        roomState.protalSlots
            .map((s) => s.bakugans)
            .flat()
            .filter((b) => b.userId === userId)
            .forEach((bakugan) => {
                const status = bakugan.statut.toSave
                if (!status || status.key !== GraceSalvatrice.key) return
                bakugan.statut.toSave = false
            })
    },
    canUse({ roomState, bakugan }) {
        return isInActiveBattle(roomState, bakugan)
    },
}
