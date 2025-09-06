'use client'

import { Button } from "@/components/ui/button"
import SetGateCardComponent from "./turn-interface-buttons/set-gate-card"
import SetBakuganComponent from "./turn-interface-buttons/set-bakugan"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { useState } from "react"
import useSetGate from "@/src/sockets/set-gate"
import useTurnAction from "@/src/sockets/turn-action"
import { toast } from "sonner"
import useSetBakugan from "@/src/sockets/set-bakugan"
import { slots_id } from "@bakugan-arena/game-data"

export default function TurnInterface({ turn, set_gate, set_bakugan, use_ability, roomId, userId }: { turn: boolean, set_gate: boolean, set_bakugan: boolean, use_ability: boolean, roomId: string, userId: string }) {

    const { SetGateCard } = useSetGate({ roomId: roomId, userId: userId })
    const { SetBakugan } = useSetBakugan({ roomId: roomId, userId: userId })
    const { turnAction } = useTurnAction({ roomId: roomId, userId: userId })
    const [gate, setGate] = useState<string>("")
    const [slot, setSlot] = useState<slots_id | ''>("")
    const [bakugan, setBakugan] = useState("")
    const [zone, setZone] = useState("")


    const selectGate = (gate: string) => {
        setGate(gate)
    }

    const selectSlot = (slot: slots_id) => {
        setSlot(slot)
    }

    const selectBakugan = (bakugan: string) => {
        setBakugan(bakugan)
    }

    const selectZone = (zone: string) => {
        setZone(zone)
    }


    const handleConfirm = () => {
        if (gate != '' && slot != '') {
            SetGateCard({ gateId: gate, slot: slot })
            console.log(slot, gate)
        } else {
            toast.error('You must choice a usable gate card and a valid slot')
            console.log(slot, gate)
        }

        if (bakugan != '' && zone != '') {
            SetBakugan({ bakuganKey: bakugan, slot: zone })
            console.log(slot, bakugan)
        } else {
            toast.error('You must choice a usable gate card and a valid slot')
        }

        if (gate != '' && slot != '' || bakugan != '' && zone != '') {
            turnAction()
        }

        setGate('')
        setSlot('')
        setZone('')
        setBakugan('')
    }


    if (!turn) {
        return (
            <p className="flex flex-col gap-2 lg:flex-row lg:absolute lg:left-[50%] bottom-7 lg:translate-x-[-50%] z-20">It's your opponent's turn</p>
        )
    } else {




        return (
            <>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="relative z-[20] lg:w-[15vw]">Actions</Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Turn actions</DialogTitle>
                            <DialogDescription>
                                Select the actions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-5">
                            <SetGateCardComponent set_gate={set_gate} roomId={roomId} userId={userId} selectGate={selectGate} selectSlot={selectSlot} />
                            <SetBakuganComponent set_bakugan={set_bakugan} roomId={roomId} userId={userId} selectBakugan={selectBakugan} selectZone={selectZone} slot={slot} gate={gate} />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant='destructive'>Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleConfirm}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>

        )
    }
}