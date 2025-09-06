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

import useGetRoomState from "@/src/sockets/get-room-state"
import { slots_id } from "@bakugan-arena/game-data"


export default function SetGateCardComponent({ set_gate, roomId, userId, selectGate, selectSlot }: { set_gate: boolean, roomId: string, userId: string, selectGate: (gate: string) => void, selectSlot: (slot: slots_id) => void }) {

    const { slots, roomState } = useGetRoomState({ roomId })
    const player = roomState?.players.find((p) => p.userId === userId)
    const usableSlots = slots?.filter((s) => s.can_set)
    const gates = roomState?.decksState.find((d) => d.userId === userId)?.gates.filter((g) => g.usable && !g.dead && !g.set)
    const usableGates = gates?.filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.key === item.key)
    );

    return (
        <>

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
        </>

    )
}