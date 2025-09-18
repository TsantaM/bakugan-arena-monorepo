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
import { portalSlotsType, portalSlotsTypeElement, slots_id } from "@bakugan-arena/game-data"
import Image from "next/image"
import { useEffect, useState } from "react"



export default function SetBakuganComponent({ set_bakugan, slot, gate, roomId, userId, selectBakugan, selectZone }: { set_bakugan: boolean, slot: slots_id | '', gate: string, roomId: string, userId: string, selectBakugan: (bakugan: string) => void, selectZone: (zone: slots_id) => void }) {


    const { slots, roomState } = useGetRoomState({ roomId })
    console.log(slots)

    const playersBakugans = roomState?.decksState.find((d) => d.userId === userId)?.bakugans
    const usableBakugans = playersBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)

    const usableBakugansCount = usableBakugans?.length ?? 3
    const noBakugansOnField = slots?.every((s) => (s.bakugans?.length ?? 0) === 0)             // il y a au moins une carte portail

    const usableSlots =
        (usableBakugansCount > 1
            || slots?.filter((s) => s.portalCard !== null && s.can_set === false).length === 1
            || (slots?.filter((s) => s.portalCard !== null && (s.bakugans?.length ?? 0) > 0)?.length ?? 0) > 0
            && noBakugansOnField) // ✅ ajout cas spécial
            ? slots?.
                filter((s) => s.portalCard !== null && s.can_set === false).
                filter((s) => !s.bakugans?.some((b) => b.userId === userId))

            : slots?.
                filter((s) => s.bakugans.some((b) => b.userId != userId)).
                filter((s) => s.bakugans.every((b) => b.userId != userId))

    const selectedSlot = usableBakugansCount > 1 && slots?.find((s) => s.id === slot)


    return (
        <>

            <div className="grid grid-cols-2 items-center justify-between gap-3">
                <Select onValueChange={(val) => selectBakugan(val)} disabled={!set_bakugan ? true : false}>
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

                <Select onValueChange={(val) => selectZone(val as slots_id)} disabled={!set_bakugan ? true : false}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a gate card slot" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Slots</SelectLabel>
                            {
                                usableSlots?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                            }
                            {
                                selectedSlot && slot != '' && gate != '' && <SelectItem value={selectedSlot.id}>{selectedSlot.id} {`(${gate})`}</SelectItem>
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <Toaster />

        </>

    )

}