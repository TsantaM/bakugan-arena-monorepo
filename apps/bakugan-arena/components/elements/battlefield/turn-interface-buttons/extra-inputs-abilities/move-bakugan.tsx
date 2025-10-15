'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { BakuganList, MoveBakuganAbilityFilters, slots_id } from "@bakugan-arena/game-data"

export default function MoveBakugan({userId} : {userId: string}) {

    const { select_bakugan_to_move, select_destination } = useTurnActionStore()
    const { bakuganToMove, zone, abilityUser, ability } = useTurnActionStore((state) => state.turnActions)

    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)

    // Move Bakugan Filter
    const bakuganToMoveInput = MoveBakuganAbilityFilters({ bakuganToMove, slots, bakuganKey: abilityUser, userId: userId, zone: zone, ability: ability })

    const bakuganToMoveList = bakuganToMoveInput?.bakuganToMoveList
    const bakuganToMoveDestinations = bakuganToMoveInput?.bakuganToMoveDestinations

    return (
        <>
            <Select onValueChange={(val) => {
                const select_bakugan = bakuganToMoveList?.find((b) => b.bakuganKey === val)
                if (select_bakugan) {
                    select_bakugan_to_move(select_bakugan)
                }
            }}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a gate card slot" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Usable Slots</SelectLabel>
                        {
                            bakuganToMoveList?.map((s, index) => <SelectItem key={index} value={s.bakuganKey}>{BakuganList.find((b) => b.key === s.bakuganKey)?.name}</SelectItem>)
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={(val) => select_destination(val as slots_id)} disabled={bakuganToMove === undefined ? true : false}>

                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a bakugan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Select the target of ability</SelectLabel>
                        {
                            bakuganToMoveDestinations?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id}</SelectItem>)
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        </>
    )
}