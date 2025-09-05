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
    DialogClose
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
import { Toaster } from "@/components/ui/sonner"
import useGetRoomState from "@/src/sockets/get-room-state"
import useSetBakugan from "@/src/sockets/set-bakugan"
import useTurnAction from "@/src/sockets/turn-action"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"



export default function SetBakugan({ set_bakugan, use_ability, roomId, userId }: { set_gate: boolean, set_bakugan: boolean, use_ability: boolean, roomId: string, userId: string }) {

    const [bakugan, setBakugan] = useState("")
    const [slot, setSlot] = useState("")
    const { SetBakugan } = useSetBakugan({ roomId: roomId, userId: userId })
    const { turnAction } = useTurnAction({ roomId })


    const { slots, roomState } = useGetRoomState({ roomId })
    console.log(slots)
    const playersBakugans = roomState?.decksState.find((d) => d.userId === userId)?.bakugans
    const usableBakugans = playersBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)
    const usableSlots = slots?.filter((s) => s.portalCard !== null && s.can_set === false)

        const handleSetGate = () => {
        if (bakugan != '' && slot != '') {
            SetBakugan({ bakuganKey: bakugan, slot: slot })
            turnAction()
            console.log(slot, bakugan)
        } else {
            toast.error('You must choice a usable gate card and a valid slot')
        }
    }


    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="lg:w-[15vw]" disabled={set_bakugan ? false : true}>Bakugans</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Bakugan</DialogTitle>
                        <DialogDescription>
                            Select a bakugan and the slot where he'll spawn
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 items-center justify-between gap-3">
                        <Select onValueChange={(val) => setBakugan(val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a gate card" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Usable Gates</SelectLabel>
                                    {
                                        usableBakugans && usableBakugans.map((s, index) => <SelectItem key={index} value={s ? s.key : ''}>
                                            <Image src={`/images/bakugans/sphere/${s?.image}/${s?.attribut.toUpperCase()}.png`} alt={s ? s.key : ''} width={20} height={20}/>
                                            {s ? s.name : ""}
                                        </SelectItem>)
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => setSlot(val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a gate card slot" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Usable Slots</SelectLabel>
                                    {
                                        usableSlots?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button disabled={bakugan === '' && slot === '' ? true : false} onClick={handleSetGate}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toaster />

        </>

    )

}