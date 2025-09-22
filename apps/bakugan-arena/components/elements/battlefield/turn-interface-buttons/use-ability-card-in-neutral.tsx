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
import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data"


export default function UseAbilityCardInNeutral({ selectAbility, bakuganToSet, zone, ability, abilityUser, selectBakugan, roomId, userId, bakuganKey }: { selectAbility: (ability: string) => void, ability: string, zone: string, selectBakugan: (bakugan: string) => void, roomId: string, userId: string, bakuganKey: string, abilityUser: string, bakuganToSet: string }) {

    const { roomState } = useGetRoomState({ roomId })
    const player = roomState?.players.find((p) => p.userId === userId)
    const battleState = roomState?.battleState
    const bakuganOnDomain = roomState?.protalSlots.flatMap((s) => s.bakugans).filter((b) => b.userId === userId)
    console.log(bakuganKey)

    if (roomState && bakuganOnDomain) {

        const usersBakuganKeys = bakuganOnDomain.filter((b) => b.userId === userId && !b.abilityBlock).map((b) => b.key)
        const listBakugans = BakuganList.filter((b) => usersBakuganKeys.includes(b.key))
        const bakuganToSetData = BakuganList.find((b) => b.key === bakuganToSet)
        const abilityUserData = bakuganOnDomain.find((b) => b.key === abilityUser) ? bakuganOnDomain.find((b) => b.key === abilityUser) : bakuganToSetData
        const attribut = abilityUserData?.attribut
        const abilitiesUsableInNeutral = AbilityCardsList.filter((c) => c.usable_in_neutral === true).map((c) => c.key)
        const exclusivesUsableInNeutral = ExclusiveAbilitiesList.filter((c) => c.usable_in_neutral === true).map((c) => c.key)
        const usableAbilities = roomState.decksState.find((d) => d.userId === userId)?.abilities.filter((a) => a.used === false && a.dead === false && abilitiesUsableInNeutral.includes(a.key)).filter((a) => a.attribut === attribut).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        );

        const usableExclusives = roomState.decksState.find((d) => d.userId === userId)?.bakugans.find((b) => b?.bakuganData.key === bakuganKey)?.excluAbilitiesState.filter((c) => c.dead === false && c.used === false && c.dead === false && exclusivesUsableInNeutral.includes(c.key)).filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.key === item.key)
        );

        console.log(abilityUser, ability)
        console.log(usableAbilities)
        console.log(usableExclusives)

        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <p>Set a gate card</p>
                    <p>{player?.usable_abilitys}</p>
                </div>
                <div className="grid grid-cols-2 items-center justify-between gap-3">
                    <Select onValueChange={(val) => selectBakugan(val)} disabled={roomState.turnState.use_ability_card === false || player?.usable_abilitys === 0 ? true : false}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bakugan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>User Bakugan</SelectLabel>
                                {
                                    bakuganToSetData && <SelectItem key={bakuganToSetData.key} value={bakuganToSetData.key} >{bakuganToSetData.name}</SelectItem>
                                }
                                {
                                    listBakugans?.map((s, index) => <SelectItem key={index} value={s.key} >{s.name}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(val) => selectAbility(val as slots_id)} disabled={roomState.turnState.use_ability_card === false || bakuganKey === '' || player?.usable_abilitys === 0 ? true : false}>
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