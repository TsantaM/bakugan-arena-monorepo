import type { portalSlotsType, slots_id } from "../../type/room-types.js"

const SLOT_IDS: slots_id[] = [
    "slot-1",
    "slot-2",
    "slot-3",
    "slot-4",
    "slot-5",
    "slot-6",
]

export function createEmptyPortalSlots(): portalSlotsType {
    return SLOT_IDS.map((id, index) => ({
        id,
        can_set: index === 1,
        portalCard: null,
        activateAbilities: [],
        bakugans: [],
        state: {
            open: false,
            canceled: false,
            blocked: false,
        },
    }))
}
