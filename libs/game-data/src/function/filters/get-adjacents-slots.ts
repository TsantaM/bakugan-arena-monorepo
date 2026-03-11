import { Slots } from "../../store/slots";
import { portalSlotsTypeElement, stateType } from "../../type/room-types";

export function getAdjacentSlots({ slot, roomState }: { slot: portalSlotsTypeElement, roomState: stateType }): portalSlotsTypeElement[] {

    if (!roomState) return []

    const slotId = slot.id
    const slots = roomState.protalSlots
    const slot_1 = slots.find(s => s.id === "slot-1")
    const slot_2 = slots.find(s => s.id === "slot-2")
    const slot_3 = slots.find(s => s.id === "slot-3")
    const slot_4 = slots.find(s => s.id === "slot-4")
    const slot_5 = slots.find(s => s.id === "slot-5")
    const slot_6 = slots.find(s => s.id === "slot-6")

    if (!slot_1 || !slot_2 || !slot_3 || !slot_4 || !slot_5 || !slot_6) return []

    switch (slot.id) {
        case "slot-1": return [slot_2, slot_4, slot_5]
        case "slot-2": return [slot_1, slot_3, slot_4, slot_5, slot_6]
        case "slot-3": return [slot_2, slot_5, slot_6]
        case "slot-4": return [slot_1, slot_2, slot_5]
        case "slot-5": return [slot_1, slot_2, slot_3, slot_4, slot_6]
        case "slot-6": return [slot_2, slot_3, slot_5]
    }

}

export function getJuxtaposableSlots({ slot, roomState }: { slot: portalSlotsTypeElement, roomState: stateType }): portalSlotsTypeElement[] {

    if (!roomState) return []

    if (!roomState) return []

    const slotId = slot.id
    const slots = roomState.protalSlots
    const slot_1 = slots.find(s => s.id === "slot-1")
    const slot_2 = slots.find(s => s.id === "slot-2")
    const slot_3 = slots.find(s => s.id === "slot-3")
    const slot_4 = slots.find(s => s.id === "slot-4")
    const slot_5 = slots.find(s => s.id === "slot-5")
    const slot_6 = slots.find(s => s.id === "slot-6")

    if (!slot_1 || !slot_2 || !slot_3 || !slot_4 || !slot_5 || !slot_6) return []

    switch (slot.id) {
        case "slot-1": return [slot_2]
        case "slot-2": return [slot_1, slot_3]
        case "slot-3": return [slot_2]
        case "slot-4": return [slot_5]
        case "slot-5": return [slot_4, slot_6]
        case "slot-6": return [slot_5]
    }

}