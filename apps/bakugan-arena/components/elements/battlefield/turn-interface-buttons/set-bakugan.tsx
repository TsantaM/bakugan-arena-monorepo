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
    const opponentsBakugans = roomState?.decksState.find((d) => d.userId !== userId)?.bakugans
    
    const usableBakugans = playersBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)
    const opponentsUsableBakugans = opponentsBakugans?.filter((b) => b?.bakuganData.onDomain === false && b.bakuganData.elimined === false).map((b) => b?.bakuganData)

    const usableBakugansCount = usableBakugans?.length ?? 3
    const slotWithBakugan = roomState?.protalSlots.filter((s) => s.can_set === false && s.portalCard !== null && s.bakugans.length > 0)
    const slotWithGate = roomState?.protalSlots.filter((s) => s.portalCard !== null && !s.can_set)
    // il y a au moins une carte portail
    const oneBakuganLeft = usableBakugansCount === 1
    const opponentsOneBakuganLeft = opponentsUsableBakugans?.length ? opponentsUsableBakugans?.length <= 1 : false
    const noBakuganOnDomain = slotWithBakugan?.length === 0
    const noGateOnDomain =slotWithGate?.length === 0

    const oneLeftAndOpponentsOnDomain = oneBakuganLeft && !noBakuganOnDomain && !opponentsOneBakuganLeft
    const oneLeftAndOpponentsOnDomainAddNoGate = oneLeftAndOpponentsOnDomain && !noGateOnDomain

    const usableSlots =
        !oneLeftAndOpponentsOnDomain // ✅ ajout cas spécial
            ? slots?.
                filter((s) => s.portalCard !== null && s.can_set === false).
                filter((s) => !s.bakugans?.some((b) => b.userId === userId))

            : slots?.
                filter((s) => s.bakugans.some((b) => b.userId != userId)).
                filter((s) => s.bakugans.every((b) => b.userId != userId))

    const selectedSlot = !oneLeftAndOpponentsOnDomainAddNoGate ? slots?.find((s) => s.id === slot) : undefined


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