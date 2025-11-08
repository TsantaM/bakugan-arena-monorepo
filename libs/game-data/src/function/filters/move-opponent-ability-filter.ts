import { AbilityCardsList } from '../../battle-brawlers/ability-cards'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities'
import { slots_limits } from '../../store/slots-limits'
import { type portalSlotsType, type slots_id } from '../../type/room-types'


export function MoveOpponentAbilityFilter({ slots, zone, bakuganKey, userId, ability }: { slots: portalSlotsType | undefined, bakuganKey: string, userId: string, ability: string, zone: "" | slots_id }) {

    if (!slots) return

    const abilityUserSlots = slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id ? slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id : zone !== '' ? zone : undefined
    console.log("abilityUserSlots", abilityUserSlots)

    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    const exclusiveAbilityData = ExclusiveAbilitiesList.find((a) => a.key === ability)
    const limits = slots_limits.find((s) => s.slot === abilityUserSlots)?.slot_limit
    console.log("limits", limits)


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