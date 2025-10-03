'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { AddBakuganAbilityFilter } from "@bakugan-arena/game-data"
import Image from "next/image"


export default function AddBakugan({userId} : {userId: string}) {

    const { select_bakugan_to_add } = useTurnActionStore()
    const decksState = useGlobalGameState((state) => state.gameState?.decksState)
    
    // Add Bakugan Filter
    const addBakuganInput = AddBakuganAbilityFilter({ decksState, userId })

    const addableBakugans = addBakuganInput?.addableBakugans


    if(addableBakugans) return (
        <Select onValueChange={(val) => select_bakugan_to_add(val)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a bakugan to set" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Usable Gates</SelectLabel>
                    {
                        addableBakugans && addableBakugans.map((s, index) => <SelectItem key={index} value={s ? s.bakuganData.key : ''}>
                            <Image src={`/images/bakugans/sphere/${s ? s?.bakuganData.image : ''}/${s ? s?.bakuganData.attribut.toUpperCase() : ''}.png`} alt={s ? s.bakuganData.key : ''} width={20} height={20} />
                            {s ? s.bakuganData.name : ""}
                        </SelectItem>)
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}