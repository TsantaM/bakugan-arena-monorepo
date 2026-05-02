import { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import { exclusiveAbilitiesType } from "../../type/game-data-types.js"
import { AbilityCardsList } from "../ability-cards.js"
import { BakuganList } from "../bakugans.js"
import { TentaclearHaos } from "../bakugans/tentacleer.js"
import { ExclusiveAbilitiesList } from "../exclusive-abilities.js"

export const RayonGamma: exclusiveAbilitiesType = {
    key: 'gamma-ray',
    name: 'Gamma Ray',
    description: `Nullifies all opponent's ability on the field`,
    maxInDeck: 1,
    usable_in_neutral: true,
    usable_if_user_not_on_domain: false,
    onActivate({ roomState, userId, bakuganKey, slot }) {
        if (!roomState) return null
        const lists = [AbilityCardsList, ExclusiveAbilitiesList].flat()
        const slotOfGate = roomState?.protalSlots.find((s) => s.id === slot)
        const user = slotOfGate?.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
        if (!user) return null

        const abilities = roomState.protalSlots.flatMap((s) => s.activateAbilities).filter((ability) => ability.userId !== userId && !ability.canceled)

        if (slotOfGate) {
            // const user = slotOfGate.bakugans.find((b) => b.key === bakuganKey && b.userId === userId)
            abilities.forEach((lastAbility) => {
                const ability = lists.find((a) => a.key === lastAbility.key)
                const abilityUser = BakuganList.find((b) => b.key === lastAbility.bakuganKey)
                if (!abilityUser) return
                if (!ability) return

                const animation: AnimationDirectivesTypes = {
                    type: 'CANCEL_ABILITY_CARD',
                    data: {
                        card: ability.key,
                        attribut: abilityUser.attribut
                    },
                    message: [{
                        text: `${ability.name} of ${abilityUser.name} as been nullified !`,
                        turn: roomState?.turnState.turnCount
                    }],
                    resolve: false
                }

                roomState?.animations.push(animation)

                if (ability && ability.onCanceled) ability.onCanceled({ roomState, bakuganKey: lastAbility.bakuganKey, slot: slot, userId: lastAbility.userId })

                lastAbility.canceled = true

                const persistantAbility = roomState.persistantAbilities.find((a) => a.key === lastAbility.key && a.bakuganKey === lastAbility.bakuganKey && a.userId === lastAbility.userId && !a.canceled)
                if (persistantAbility) persistantAbility.canceled = true

            })
        }


        return null
    },
    activationConditions({ roomState, userId }) {

        const abilities = roomState.protalSlots.flatMap((s) => s.activateAbilities).filter((ability) => ability.userId !== userId && !ability.canceled)
        if(abilities.length === 0) return false
        return true

    },
    canUse({ bakugan }) {
        if (bakugan.key !== TentaclearHaos.key) return false
        return true
    },
}