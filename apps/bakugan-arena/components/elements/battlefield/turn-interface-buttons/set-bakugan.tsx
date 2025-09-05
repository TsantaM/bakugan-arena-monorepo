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
import Image from "next/image"



export default function SetBakuganComponent({ set_bakugan, roomId, userId, selectBakugan, selectZone }: { set_bakugan: boolean, roomId: string, userId: string, selectBakugan: (bakugan :string) => void, selectZone: (zone :string) => void }) {


    const { slots, roomState } = useGetRoomState({ roomId })
    console.log(slots)
    const playersBakugans = roomState?.decksState.find((d) => d.userId === userId)?.bakugans
    const usableBakugans = playersBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)
    const usableSlots = slots?.filter((s) => s.portalCard !== null && s.can_set === false)


    return (
        <>

            <div className="grid grid-cols-2 items-center justify-between gap-3">
                <Select onValueChange={(val) => selectBakugan(val)} disabled={ !set_bakugan ? true : false }>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a bakugan to set" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Gates</SelectLabel>
                            {
                                usableBakugans && usableBakugans.map((s, index) => <SelectItem key={index} value={s ? s.key : ''}>
                                    <Image src={`/images/bakugans/sphere/${s?.image}/${s?.attribut.toUpperCase()}.png`} alt={s ? s.key : ''} width={20} height={20} />
                                    {s ? s.name : ""}
                                </SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select onValueChange={(val) => selectZone(val)} disabled={ !set_bakugan ? true : false }>
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
            <Toaster />

        </>

    )

}