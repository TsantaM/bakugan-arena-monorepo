'use client'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"

import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { slots_id } from "@bakugan-arena/game-data"


export default function SetGateCardComponent({ userId, selectGate, selectSlot }: { userId: string, selectGate: (gate: string) => void, selectSlot: (slot: slots_id) => void }) {

    const player = useGlobalGameState((state) => state.gameState?.players.find((p) => p.userId === userId))
    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
    const set_gate = useGlobalGameState((state) => state.gameState?.turnState.set_new_gate) ? useGlobalGameState((state) => state.gameState?.turnState.set_new_gate) : false
    const usableSlots = slots?.filter((s) => s.can_set)
    const gates = useGlobalGameState((state) => state.gameState?.decksState.find((d) => d.userId === userId))?.gates
    
    const usableGates = gates?.filter((g) => g.usable && !g.dead && !g.set).filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    )


    // ----------------------- 


    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <p>Set a gate card</p>
                <p>{player?.usable_gates}</p>
            </div>
            <div className="grid grid-cols-2 items-center justify-between gap-3">
                <Select onValueChange={(val) => selectGate(val)} disabled={set_gate === false || player?.usable_gates === 0 ? true : false}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a gate card" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Gates</SelectLabel>
                            {
                                usableGates?.map((s, index) => <SelectItem key={index} value={s.key}>{s.name}</SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select onValueChange={(val) => selectSlot(val as slots_id)} disabled={set_gate === false || player?.usable_gates === 0 ? true : false}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a gate card slot" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Slots</SelectLabel>
                            {
                                usableSlots?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id}</SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <Toaster />
        </div>

    )
}