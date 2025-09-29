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
import { BakuganList, slots_id } from "@bakugan-arena/game-data"


export default function UseAbilityCard({ selectAbility, ability, selectBakugan, userId, bakuganKey }: { selectAbility: (ability: string) => void, ability: string, selectBakugan: (bakugan: string) => void, roomId: string, userId: string, bakuganKey: string }) {

    const turnState = useGlobalGameState((state) => state.gameState?.turnState)
    const player = useGlobalGameState((state) => state.gameState?.players.find((p) => p.userId === userId))
    const battleState = useGlobalGameState((state) => state.gameState?.battleState)
    const slotOfBattle = useGlobalGameState((state) => state.gameState?.protalSlots.find((b) => b.id === state.gameState?.battleState.slot))
    const playersDeck = useGlobalGameState((state) => state.gameState?.decksState.find((d) => d.userId === userId))
    console.log(bakuganKey)

    // ---------------------------
    


    if (battleState && battleState.battleInProcess && !battleState.paused && slotOfBattle) {

        const usersBakugan = slotOfBattle?.bakugans.filter((b) => b.userId === userId)
        const usersBakuganKeys = slotOfBattle?.bakugans.filter((b) => b.userId === userId && !b.abilityBlock).map((b) => b.key)
        const listBakugans = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))
        const attribut = usersBakugan.find((a) => a.key === bakuganKey)?.attribut
        const usableAbilities = playersDeck?.abilities.filter((a) => a.used === false && a.dead === false).filter((a) => a.attribut === attribut).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        );

        const usableExclusives = playersDeck?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        );


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
                                    listBakugans?.map((s, index) => <SelectItem key={index} value={s.key} >{s.name}</SelectItem>)
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