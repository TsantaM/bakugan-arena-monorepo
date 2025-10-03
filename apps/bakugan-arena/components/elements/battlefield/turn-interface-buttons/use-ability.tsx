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
import { SelectAbilityCardFilters, slots_id } from "@bakugan-arena/game-data"


export default function UseAbilityCard({ roomId, userId }: { roomId: string, userId: string }) {

    const turnState = useGlobalGameState((state) => state.gameState?.turnState)
    const player = useGlobalGameState((state) => state.gameState?.players.find((p) => p.userId === userId))
    const battleState = useGlobalGameState((state) => state.gameState?.battleState)
    const slotOfBattle = useGlobalGameState((state) => state.gameState?.protalSlots.find((b) => b.id === state.gameState?.battleState.slot))
    const playersDeck = useGlobalGameState((state) => state.gameState?.decksState.find((d) => d.userId === userId))

    const { selectAbility, selectAbilityUser: selectBakugan, } = useTurnActionStore()
    const { abilityUser: bakuganKey } = useTurnActionStore((state) => state.turnActions)
    console.log(bakuganKey)

    // ---------------------------



    if (battleState && battleState.battleInProcess && !battleState.paused && slotOfBattle) {

        const selectAbilityInputs = SelectAbilityCardFilters({bakuganKey: bakuganKey, playersDeck: playersDeck, slotOfBattle: slotOfBattle, userId: userId})

        if(!selectAbilityInputs) return

        const bakuganList = selectAbilityInputs.bakugansList
        const usableAbilities = selectAbilityInputs.usableAbilities
        const usableExclusives = selectAbilityInputs.usableExclusives

        console.log(usableAbilities)
        console.log(usableExclusives)

        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <p>Set a gate card</p>
                    <p>{player?.usable_abilitys}</p>
                </div>
                <div className="grid grid-cols-2 items-center justify-between gap-3">
                    <Select onValueChange={(val) => selectBakugan(val)} disabled={turnState?.use_ability_card === false || player?.usable_abilitys === 0 ? true : false}>
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

                    <Select onValueChange={(val) => selectAbility(val as slots_id)} disabled={turnState?.use_ability_card === false || bakuganKey === '' || player?.usable_abilitys === 0 ? true : false}>
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

}