import { PowerChange } from "../../function/ability-cards-effects/power-change.js"
import RemoveRenfortAnimationDirective from "../../function/create-animation-directives/remove-renfort-animation-directive.js"
import { AbilityCardFailed } from "../../function/create-animation-directives/ability-card-failed.js"
import { AddRenfortAnimationDirective } from "../../function/create-animation-directives/add-renfort-directive.js"
import { ComeBackBakuganDirectiveAnimation } from "../../function/create-animation-directives/come-back-bakugan.js"
import { CustomAnimationDirective } from "../../function/create-animation-directives/custom-animation.js"
import type { AbilityCardsActions } from "../../type/actions-serveur-requests.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import type { bakuganOnSlot } from "../../type/room-types.js"
import { getCaster, isInActiveBattle } from "./helpers.js"

/** Bonus accorde au renfort appele. */
const RALLY_POWER = 100
/** Bonus accorde si le renfort est lui aussi un Saurus. */
const RALLY_POWER_SAME_FAMILY = 200

/**
 * Cri de Ralliement — Haos Saurus.
 *
 * Saurus appelle un allie reste en main : il rejoint le combat avec +100 Gs, ou
 * +200 Gs si c'est un autre Saurus.
 *
 * Contrairement aux renforts d'attribut (Rapide Haos, Feu Rapide) qui exigent
 * deux bakugans du meme attribut deja sur le terrain, celui-ci n'a aucune
 * condition de couleur : c'est la famille Saurus qui est recompensee.
 */
export const CriDeRalliement: exclusiveAbilitiesType = {
    key: 'cri-de-ralliement',
    maxInDeck: 1,
    extraInputs: ['add-bakugan'],
    usable_in_neutral: false,
    usable_if_user_not_on_domain: false,
    attribut: 'Haos',
    onActivate({ roomState, userId, bakuganKey, slot }) {
        const animation = AbilityCardFailed({ abilityKey: CriDeRalliement.key })
        if (!roomState) return animation

        const caster = getCaster({ roomState, slot, bakuganKey, userId })
        if (!caster) return animation

        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!deck) return animation

        const bakugans = deck.bakugans.filter(
            (b) => b && !b.bakuganData.onDomain && !b.bakuganData.elimined,
        )

        if (bakugans.length === 0) return animation

        const request: AbilityCardsActions = {
            type: 'SELECT_BAKUGAN_TO_SET',
            message: { key: 'prompt_select_bakugan_set', params: { abilityKey: CriDeRalliement.key } },
            bakugans,
        }

        return request
    },
    onAdditionalEffect({ resolution, roomData }) {
        if (resolution.data.type !== 'SELECT_BAKUGAN_TO_SET') return

        const { bakuganKey, slot, userId } = resolution
        const reinforcement = resolution.data.bakugan
        if (!reinforcement) return

        const caster = getCaster({ roomState: roomData, slot, bakuganKey, userId })
        if (!caster) return

        const deck = roomData.decksState.find((d) => d.userId === userId)
        const deckData = deck?.bakugans.find((b) => b?.bakuganData.key === reinforcement.bakuganData.key)
        if (!deckData) return
        if (deckData.bakuganData.onDomain || deckData.bakuganData.elimined) return

        const { slotOfGate, user } = caster

        const lastId = slotOfGate.bakugans.length > 0 ? slotOfGate.bakugans[slotOfGate.bakugans.length - 1].id : 0

        const newBakugan: bakuganOnSlot = {
            slot_id: slot,
            id: lastId + 1,
            key: deckData.bakuganData.key,
            userId,
            powerLevel: deckData.bakuganData.powerLevel,
            currentPower: deckData.bakuganData.powerLevel,
            attribut: deckData.bakuganData.attribut,
            image: deckData.bakuganData.image,
            abilityBlock: false,
            assist: {
                assist: true,
                addedWith: 'ABILITY',
                key: CriDeRalliement.key,
            },
            statut: {
                trapped: false,
                notRetreat: false,
                poisoned: false,
                protectedAgainstGate: false,
                protectedAgainstAbility: false,
                protected: false,
                absorbPowerBoost: false,
                toSave: false,
                reanimated: false,
                lifeLess: false,
            },
            family: deckData.bakuganData.family,
        }

        slotOfGate.bakugans.push(newBakugan)
        deckData.bakuganData.onDomain = true

        CustomAnimationDirective({
            roomState: roomData,
            animationKey: CriDeRalliement.key,
            sourceBakugan: user,
            targetBakugans: [newBakugan],
            slotId: slot,
            payload: { slot: structuredClone(slotOfGate) },
        })

        AddRenfortAnimationDirective({
            animations: roomData.animations,
            roomState: roomData,
            bakugan: newBakugan,
            slot: slotOfGate,
            turn: roomData.turnState.turnCount,
        })

        const power = newBakugan.family === user.family ? RALLY_POWER_SAME_FAMILY : RALLY_POWER

        PowerChange({ roomState: roomData, bakugan: newBakugan, G: power, malus: false })
    },
    onCanceled({ roomState, userId, slot }) {
        if (!roomState) return

        const slotOfGate = roomState.protalSlots.find((s) => s.id === slot)
        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!slotOfGate || !deck) return

        const renforts = slotOfGate.bakugans.filter(
            (b) =>
                b.userId === userId &&
                b.assist &&
                b.assist.addedWith === 'ABILITY' &&
                b.assist.key === CriDeRalliement.key,
        )

        renforts.forEach((renfort) => {
            const index = slotOfGate.bakugans.findIndex(
                (b) => b.id === renfort.id && b.key === renfort.key && b.userId === renfort.userId,
            )
            if (index === -1) return

            slotOfGate.bakugans.splice(index, 1)

            ComeBackBakuganDirectiveAnimation({
                animations: roomState.animations,
                bakugan: renfort,
                slot: slotOfGate,
                roomState,
            })

            RemoveRenfortAnimationDirective({
                animations: roomState.animations,
                turnCount: roomState.turnState.turnCount,
                bakugan: renfort,
                roomState,
            })

            const deckData = deck.bakugans.find((b) => b?.bakuganData.key === renfort.key)
            if (deckData) deckData.bakuganData.onDomain = false
        })
    },
    activationConditions({ roomState, userId }) {
        const deck = roomState.decksState.find((d) => d.userId === userId)
        if (!deck) return false

        return deck.bakugans.some((b) => b && !b.bakuganData.onDomain && !b.bakuganData.elimined)
    },
    canUse({ roomState, bakugan }) {
        return isInActiveBattle(roomState, bakugan)
    },
}
