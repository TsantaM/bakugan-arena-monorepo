'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { BakuganList, DragBakuganAbilityFilter, slots_id } from "@bakugan-arena/game-data"

export default function DragBakugan({ userId }: { userId: string }) {

    const { abilityUser: bakuganKey, slotToDrag, ability, zone } = useTurnActionStore((state) => state.turnActions)
    const { selectTarget, select_slot_to_drag } = useTurnActionStore()
    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)

    // Drag Bakugan Filter
    const dragBakuganInput = DragBakuganAbilityFilter({ slots, bakuganKey, slotToDrag, userId, ability: ability, zone: zone })

    const draggableSlots = dragBakuganInput?.draggableSlots
    const draggables = dragBakuganInput?.draggables


    if(draggableSlots) return (
        <>
            <Select onValueChange={(val) => select_slot_to_drag(val as slots_id)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a gate card slot" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Usable Slots</SelectLabel>
                        {
                            draggableSlots?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={(val) => selectTarget(val)} disabled={slotToDrag === '' ? true : false}>

                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a bakugan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Select the target of ability</SelectLabel>
                        {
                            draggables?.map((s, index) => <SelectItem key={index} value={s.key}>{BakuganList.find((b) => b.key === s.key)?.name}</SelectItem>)
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        </>
    )
}