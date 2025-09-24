'use client'

import { slots_id } from "@bakugan-arena/game-data"
import { useState } from "react"

export default function useActiveGateCardHook() {
    // Boolean for gate card activation
    const [active, setActive] = useState(false)
    const setActiveGate = (active: boolean) => {
        setActive(active)
    }

    // Slot where the gate to active is
    const [slotToActive, setSlotToActive] = useState<slots_id | ''>('')
    const selectGateToActiveSlot = (slot: slots_id | '') => {
        setSlotToActive(slot)
    }

    return {
        active, setActiveGate,
        slotToActive, selectGateToActiveSlot
    }

}