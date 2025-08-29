'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import useGetRoomState from "@/src/sockets/get-room-state"
import { useState } from "react"


export default function SetGateCard({ set_gate, set_bakugan, use_ability, roomId, userId }: { set_gate: boolean, set_bakugan: boolean, use_ability: boolean, roomId: string, userId: string }) {

    const { slots, roomState } = useGetRoomState({ roomId })

    const usableSlots = slots?.filter((s) => s.can_set)
    const usableGates = [ ... new Set(roomState?.decksState.find((d) => d.userId === userId)?.gates.filter((g) => g.usable && !g.dead && !g.set))]

    const [gate, setGate] = useState<string>("")
    const [slot, setSlot] = useState<string>("")

    return (
        <>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="lg:w-[15vw]" disabled={set_gate ? false : true}>Cards</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Gate Card</DialogTitle>
                        <DialogDescription>
                            Select gate card and the slot
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 items-center justify-between gap-3">
                        <Select onValueChange={(val) => setGate(val)}>
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

                        <Select onValueChange={(val) => setSlot(val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a gate card slot"/>
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

                    <DialogFooter>
                        <Button onClick={() => alert(`${gate} on ${slot}`)}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>

    )
}