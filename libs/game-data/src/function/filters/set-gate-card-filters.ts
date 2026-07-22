import { type deckType, type portalSlotsType } from '../../type/type-index.js'

export function FindUsableSlotAndGates({ slots, gates }: {
    slots: portalSlotsType | undefined,
    gates: deckType['gates'] | undefined
}) {

    const usableSlots = slots?.filter((s) => s.can_set && s.portalCard === null)
    const usableGates = gates?.filter((g) => g.usable && !g.dead && !g.set).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    )

    return {
        usableSlots,
        usableGates
    }
}