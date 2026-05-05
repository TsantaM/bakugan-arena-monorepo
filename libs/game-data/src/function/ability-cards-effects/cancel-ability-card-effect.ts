import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList } from "../../battle-brawlers/index.js"
import { AnimationDirectivesTypes } from "../../type/animations-directives.js"
import { activateAbilities, portalSlotsTypeElement, stateType } from "../../type/room-types.js"

type CancelAbilityCardEffectProps = {
    roomState: stateType,
    slotOfGate: portalSlotsTypeElement,
    ability: activateAbilities
}

export function CancelAbilityCardEffect({roomState, slotOfGate, ability} : CancelAbilityCardEffectProps) {
    if (ability.canceled) return
    const user = slotOfGate.bakugans.find((b) => b.key === ability.bakuganKey && b.userId === ability.userId)
    if(!user) return
    const BakuganName = BakuganList.find((b) => b.key === user.key)?.name
    if (!BakuganName) return
    const abilityData = [...AbilityCardsList, ...ExclusiveAbilitiesList].find((card) => card.key === ability.key)
    if (!abilityData) return
    if (!abilityData.onCanceled) return

    const animation: AnimationDirectivesTypes = {
        type: 'CANCEL_ABILITY_CARD',
        data: {
            card: ability.key,
            attribut: user.attribut
        },
        message: [{
            text: `${abilityData.name} of ${BakuganName} as been nullified !`,
            turn: roomState?.turnState.turnCount
        }],
        resolve: false
    }

    roomState.animations.push(animation)

    abilityData.onCanceled({
        bakuganKey: ability.bakuganKey,
        roomState: roomState,
        slot: slotOfGate.id,
        userId: ability.userId
    })

    ability.canceled = true

    const persistantAbility = roomState.persistantAbilities.find((a) => a.key === ability.key && a.bakuganKey === ability.bakuganKey && a.userId === ability.userId && !a.canceled)
    if (persistantAbility) persistantAbility.canceled = true
}