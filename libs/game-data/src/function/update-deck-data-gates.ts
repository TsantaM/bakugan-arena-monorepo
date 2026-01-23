import { type deckType, type slots_id, type portalSlotsType, type portalSlotsTypeElement, type bakuganOnSlot, type activateAbilities } from "../type/type-index.js"

type newSlotState = {
    can_set: boolean,
    portalCard: {
        key: string,
        userId: string,
    },
    id: slots_id,
    bakugans: bakuganOnSlot[],
    state: {
        open: boolean,
        canceled: boolean,
        blocked: boolean,
    },
    activateAbilities: activateAbilities[],
}


export function updateDeckGates(deck: deckType, gateId: string) {
    let updated = false;
    return deck.gates.map((g) => {
        if (!updated && g.key === gateId && g.usable) {
            updated = true;
            return { ...g, usable: false };
        }
        return g;
    })
}


export function updateSlot(slots: portalSlotsType, slotId: slots_id, newSlotState: newSlotState ) {
    const updatedSlotState = slots.map((s) => s.id === slotId ? { ...s, ...newSlotState } : s)
    return updatedSlotState
}