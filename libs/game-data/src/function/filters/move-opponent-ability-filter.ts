import { portalSlotsType } from '../../type/room-types'


export function MoveOpponentAbilityFilter({ slots, bakuganKey, userId }: { slots: portalSlotsType | undefined, bakuganKey: string, userId: string }) {

    if (!slots) return
    const abilityUserSlots = slots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id

    const otherSlots = slots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null)

    return {
        otherSlots
    }
}