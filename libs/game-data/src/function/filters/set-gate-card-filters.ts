import { portalSlotsType } from '../../type/room-types'
import { attribut } from '../../type/game-data-types'

export function FindUsableSlotAndGates({ slots, gates }: {
    slots: portalSlotsType | undefined, gates: {
        key: string;
        name: string;
        attribut: attribut | undefined;
        description: string;
        set: boolean;
        usable: boolean;
        dead: boolean;
    }[] | undefined
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