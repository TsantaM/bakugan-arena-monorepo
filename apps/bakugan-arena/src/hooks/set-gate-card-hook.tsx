'use client'

import { slots_id } from "@bakugan-arena/game-data"
import { useState } from "react"

export default function useSetGateCardHook() {
    // Gate id when chose a gate to set
    const [gate, setGate] = useState<string>("")
    const selectGate = (gate: string) => {
        setGate(gate)
    }

    // Slot where the gate card will be set
    const [slot, setSlot] = useState<slots_id | ''>("")
    const selectSlot = (slot: slots_id | '') => {
        setSlot(slot)
    }

    return {
        gate, selectGate,
        slot, selectSlot
    }
}