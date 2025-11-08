import { AbilityCardsList } from '../../battle-brawlers/ability-cards'
import { ExclusiveAbilitiesList } from '../../battle-brawlers/exclusive-abilities'
import { slots_limits } from '../../store/slots-limits'
import { type portalSlotsType, type slots_id } from '../../type/room-types'

export function DragBakuganAbilityFilter({ slots, zone, bakuganKey, userId, slotToDrag, ability }: { slots: portalSlotsType | undefined, bakuganKey: string, userId: string, slotToDrag: "" | slots_id, ability: string, zone: "" | slots_id }) {

    if (!slots) return


    const abilityUserSlots = slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id ? slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id  : zone !== '' ? zone : undefined
    console.log("abilityUserSlots", abilityUserSlots)

    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    const exclusiveAbilityData = ExclusiveAbilitiesList.find((a) => a.key === ability)
    const limits = slots_limits.find((s) => s.slot === abilityUserSlots)?.slot_limit
    console.log("limits", limits)

    if (abilityData && !exclusiveAbilityData && abilityData.slotLimits) {
        const draggableSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null && !s.can_set && s.bakugans.length > 0 && limits?.includes(s.id))

        const draggables = draggableSlots?.find((s) => s.id === slotToDrag)?.bakugans

        return {
            draggableSlots,
            draggables
        }
    } else if (!abilityData && exclusiveAbilityData && exclusiveAbilityData.slotLimits) {
        const draggableSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null && !s.can_set && s.bakugans.length > 0 && limits?.includes(s.id))

        const draggables = draggableSlots?.find((s) => s.id === slotToDrag)?.bakugans

        return {
            draggableSlots,
            draggables
        }
    } else {
        const draggableSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null && !s.can_set && s.bakugans.length > 0)

        const draggables = draggableSlots?.find((s) => s.id === slotToDrag)?.bakugans

        return {
            draggableSlots,
            draggables
        }
    }

}