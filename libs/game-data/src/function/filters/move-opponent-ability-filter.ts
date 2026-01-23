import { AbilityCardsList } from '../../battle-brawlers/ability-cards.js'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities.js'
import { slots_limits } from '../../store/store-index.js'
import { type portalSlotsType, type slots_id } from '../../type/type-index.js'


export function MoveOpponentAbilityFilter({ slots, zone, bakuganKey, userId, ability }: { slots: portalSlotsType | undefined, bakuganKey: string, userId: string, ability: string, zone: "" | slots_id }) {

    if (!slots) return

    const abilityUserSlots = slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id ? slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id : zone !== '' ? zone : undefined

    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    const exclusiveAbilityData = ExclusiveAbilitiesList.find((a) => a.key === ability)
    const limits = slots_limits.find((s) => s.slot === abilityUserSlots)?.slot_limit


    if (abilityData && !exclusiveAbilityData && abilityData.slotLimits) {
        const otherSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null && limits?.includes(s.id))

        return {
            otherSlots
        }
    } else if (!abilityData && exclusiveAbilityData && exclusiveAbilityData.slotLimits) {
        const otherSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null && limits?.includes(s.id))

        return {
            otherSlots
        }
    } else {
        const otherSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null)

        return {
            otherSlots
        }
    }
}