import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import { NewAdditionnalMessage } from "../../function/new-additional-message.js"
import { AbilityCards } from "../ability-cards.js"
import { ExclusiveAbilities } from "../exclusive-abilities.js"
import type { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import type { abilityCardsType, exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { activateAbilities, stateType } from "../../type/room-types.js"
import { getCaster, isInActiveBattle } from "./helpers.js"

/** Retrouve la definition d'une carte, capacite classique ou exclusive. */
function findCard(key: string): abilityCardsType | exclusiveAbilitiesType | undefined {
    return AbilityCards[key] ?? ExclusiveAbilities[key]
}

/**
 * La derniere capacite activee par un adversaire sur l'emplacement, qui soit
 * copiable : ni annulee, ni une capacite Fusion (elle dependrait d'une carte
 * mere que Siege n'a pas activee), ni la Lame elle-meme.
 */
function lastCopyableOpponentAbility(
    roomState: stateType,
    slotId: string,
    userId: string,
): activateAbilities | undefined {
    const slot = roomState.protalSlots.find((s) => s.id === slotId)
    if (!slot) return undefined

    return [...slot.activateAbilities]
        .reverse()
        .find((activation) => {
            if (activation.canceled) return false
            if (activation.userId === userId) return false
            if (activation.key === LameUsurpatrice.key) return false

            const card = findCard(activation.key)
            if (!card) return false
            if ('fusionWith' in card && card.fusionWith) return false

            return true
        })
}

/**
 * Lame Usurpatrice — Darkus Siege.
 *
 * Siege retourne contre son proprietaire la derniere capacite que l'adversaire
 * a activee dans ce combat : elle est rejouee, cette fois au profit de Siege.
 * Les capacites Fusion sont hors de portee — elles dependent d'une carte mere.
 *
 * Carte purement reactive : elle ne vaut rien en premier, et devient d'autant
 * plus forte que l'adversaire sort une grosse capacite. La copie est
 * enregistree dans `persistantAbilities` pour que la resolution differee
 * (choix d'une cible, d'un emplacement…) soit deleguee a la bonne carte.
 */
export const LameUsurpatrice: exclusiveAbilitiesType = {
    key: 'lame-usurpatrice',
    maxInDeck: 1,
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Darkus',
    onActivate({ roomState, userId, bakuganKey, slot, roomId, cardToCancel }) {
        const animation = AbilityCardFailed({ abilityKey: LameUsurpatrice.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const stolen = lastCopyableOpponentAbility(roomState, slot, userId)
        if (!stolen) return animation

        const card = findCard(stolen.key)
        if (!card) return animation

        CustomAnimationDirective({
            roomState,
            animationKey: LameUsurpatrice.key,
            sourceBakugan: caster.user,
            slotId: slot,
            payload: { stolen: stolen.key },
        })

        NewAdditionnalMessage({
            roomState,
            key: 'ability_usurped',
            params: { abilityKey: stolen.key },
        })

        // Memorise la carte copiee : `onAdditionalEffect` doit deleguer a elle.
        roomState.persistantAbilities.push({
            id: roomState.persistantAbilities.length + 1,
            key: LameUsurpatrice.key,
            bakuganKey,
            userId,
            canceled: false,
            fusion: [stolen.key],
        })

        // La capacite volee est rejouee comme si Siege l'avait lancee.
        return card.onActivate({ roomState, userId, bakuganKey, slot, roomId, cardToCancel })
    },
    onAdditionalEffect({ resolution, roomData, cardToCancel }) {
        const record = [...roomData.persistantAbilities]
            .reverse()
            .find(
                (a) =>
                    a.key === LameUsurpatrice.key &&
                    !a.canceled &&
                    a.userId === resolution.userId &&
                    a.bakuganKey === resolution.bakuganKey,
            )

        const stolenKey = record?.fusion?.[0]
        if (!stolenKey) return

        const card = findCard(stolenKey)
        if (!card || !card.onAdditionalEffect) return

        card.onAdditionalEffect({ resolution, roomData, cardToCancel })
    },
    onCanceled({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return

        const index = roomState.persistantAbilities.findIndex(
            (a) =>
                a.key === LameUsurpatrice.key &&
                !a.canceled &&
                a.userId === userId &&
                a.bakuganKey === bakuganKey,
        )
        if (index === -1) return

        const stolenKey = roomState.persistantAbilities[index].fusion?.[0]
        roomState.persistantAbilities[index].canceled = true

        if (!stolenKey) return

        const card = findCard(stolenKey)
        card?.onCanceled?.({ roomState, userId, bakuganKey, slot })
    },
    activationConditions({ roomState, userId }) {
        const { slot } = roomState.battleState
        if (slot === null) return false

        return !!lastCopyableOpponentAbility(roomState, slot, userId)
    },
    canUse({ roomState, bakugan }) {
        if (!isInActiveBattle(roomState, bakugan)) return false

        return !!lastCopyableOpponentAbility(roomState, bakugan.slot_id, bakugan.userId)
    },
}
