import { portalSlotsType, slots_id } from '../../type/room-types'

export function DragBakuganAbilityFilter({slots, bakuganKey, userId, slotToDrag} : {slots: portalSlotsType | undefined, bakuganKey: string, userId: string, slotToDrag: "" | slots_id }) {

    if(!slots) return
    const abilityUserSlots = slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id

    const draggableSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null && !s.can_set && s.bakugans.length > 0)
    const draggables = draggableSlots?.find((s) => s.id === slotToDrag)?.bakugans

    return {
        draggableSlots,
        draggables
    }

}