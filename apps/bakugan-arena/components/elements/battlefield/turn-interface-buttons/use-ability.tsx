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
import { BakuganList, slots_id } from "@bakugan-arena/game-data"


export default function UseAbilityCard({ selectAbility, selectBakugan, roomId, userId, bakuganKey }: { selectAbility: (ability: string) => void, selectBakugan: (bakugan: string) => void, roomId: string, userId: string, bakuganKey: string }) {

    const { roomState } = useGetRoomState({ roomId })
    const battleState = roomState?.battleState
    const slotOfBattle = roomState?.protalSlots.find((b) => b.id === battleState?.slot)
    console.log(bakuganKey)

    if (battleState && battleState.battleInProcess && !battleState.paused && slotOfBattle) {

        const usersBakugan = slotOfBattle?.bakugans.filter((b) => b.userId === userId)
        const usersBakuganKeys = slotOfBattle?.bakugans.filter((b) => b.userId === userId).map((b) => b.key)
        const listBakugans = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))
        const attribut = usersBakugan.find((a) => a.key === bakuganKey)?.attribut
        const usableAbilities = roomState.decksState.find((d) => d.userId === userId)?.abilities.filter((a) => a.used === false && a.dead === false).filter((a) => a.attribut === attribut).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        );

        const usableExclusives = roomState.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        );


        console.log(usableAbilities)
        console.log(usableExclusives)

        return (
            <>
                <div className="grid grid-cols-2 items-center justify-between gap-3">
                    <Select onValueChange={(val) => selectBakugan(val)} disabled={roomState.turnState.use_ability_card === false ? true : false}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bakugan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>User Bakugan</SelectLabel>
                                {
                                    listBakugans?.map((s, index) => <SelectItem key={index} value={s.key}>{s.name}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(val) => selectAbility(val as slots_id)} disabled={roomState.turnState.use_ability_card === false || bakuganKey === '' ? true : false}>
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
            </>
        )
    }

}