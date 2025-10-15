'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { MoveOpponentAbilityFilter, slots_id } from "@bakugan-arena/game-data"

export default function MoveOpponent({ userId }: { userId: string }) {

    const { select_slot_to_move: selected_slot_to_move } = useTurnActionStore()
    const { abilityUser: bakuganKey, ability, zone } = useTurnActionStore((state) => state.turnActions)

    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)

    const moveOpponentInput = MoveOpponentAbilityFilter({ slots, bakuganKey, userId, ability: ability, zone: zone })

    const otherSlots = moveOpponentInput?.otherSlots

    if(otherSlots) return (
        <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a gate card slot" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Usable Slots</SelectLabel>
                    {
                        otherSlots?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}