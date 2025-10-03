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
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { SetBakuganFilters, slots_id } from "@bakugan-arena/game-data"
import Image from "next/image"



export default function SetBakuganComponent({ set_bakugan, userId }: { set_bakugan: boolean, userId: string }) {

    const { selectBakuganToSet: selectBakugan, selectZone } = useTurnActionStore()
    const { slot, gate } = useTurnActionStore((state) => state.turnActions)

    const decksState = useGlobalGameState((state) => state.gameState?.decksState)
    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
    if (!decksState) return

    const playerDeck = decksState.find((d) => d.userId === userId)
    const opponentBakugans = decksState.find((d) => d.userId !== userId)

    const filtered = SetBakuganFilters({ playersDeck: playerDeck, opponentDeck: opponentBakugans, slot: slot, slots: slots, userId: userId })
    const usableBakugans = filtered?.usableBakugans
    const usableSlots = filtered?.usableSlots
    const selectedSlot = filtered?.selectedSlot

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