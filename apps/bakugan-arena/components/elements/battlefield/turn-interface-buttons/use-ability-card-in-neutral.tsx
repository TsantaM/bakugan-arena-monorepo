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

import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { SelectAbilityCardInNeutralFilters, slots_id } from "@bakugan-arena/game-data"


export default function UseAbilityCardInNeutral({ roomId, userId }: { roomId: string, userId: string }) {


    const { bakuganToSet, ability, abilityUser: bakuganKey } = useTurnActionStore((state) => state.turnActions)
    const { selectAbility, selectAbilityUser: selectBakugan } = useTurnActionStore()

    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
    const decksState = useGlobalGameState((state) => state.gameState?.decksState)
    const use_ability_card = useGlobalGameState((state) => state.gameState?.turnState.use_ability_card)

    const players = useGlobalGameState((state) => state.gameState?.players)
    const player = players?.find((p) => p.userId === userId)

    const selectAbilityInputs = SelectAbilityCardInNeutralFilters({ slots, userId, decksState, bakuganToSet, bakuganKey })

    if (!selectAbilityInputs) return

    const bakuganList = selectAbilityInputs.bakuganList
    const usableAbilities = selectAbilityInputs.usableAbilities
    const usableExclusives = selectAbilityInputs.usableExclusives
    const bakuganToSetData = selectAbilityInputs.bakuganToSetData



    console.log(bakuganKey, ability)
    console.log(usableAbilities)
    console.log(usableExclusives)

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <p>Set a gate card</p>
                <p>{player?.usable_abilitys}</p>
            </div>
            <div className="grid grid-cols-2 items-center justify-between gap-3">
                <Select onValueChange={(val) => selectBakugan(val)} disabled={use_ability_card === false || player?.usable_abilitys === 0 ? true : false}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a bakugan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>User Bakugan</SelectLabel>
                            {
                                bakuganList?.map((s, index) => <SelectItem key={index} value={s.key} >{s.name}</SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select onValueChange={(val) => selectAbility(val as slots_id)} disabled={use_ability_card === false || bakuganKey === '' || player?.usable_abilitys === 0 ? true : false}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a ability card" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Abilities</SelectLabel>
                            {
                                usableAbilities?.map((s, index) => <SelectItem key={index} value={s.key}>{s.name}</SelectItem>)
                            }
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Usable Exclusive Abilities</SelectLabel>
                            {
                                usableExclusives?.map((s, index) => <SelectItem key={index} value={s.key}>{s.name}</SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <Toaster />
        </div>
    )
}
