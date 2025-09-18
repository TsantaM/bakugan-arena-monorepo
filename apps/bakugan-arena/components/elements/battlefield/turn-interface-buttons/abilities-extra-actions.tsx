'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import useGetRoomState from "@/src/sockets/get-room-state"
import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data"

type AbilityExtraInputsProps = {
    roomId: string,
    ability: string,
    bakuganKey: string,
    userId: string,
    slot_target: slots_id | '',
    selected_target: (bakuganKey: string) => void,
    selected_target_slot: (slot_target: slots_id) => void,
    selected_slot_to_move: (slot_to_move: slots_id) => void
}

export default function AbilityExtraInputs({
    roomId, ability, bakuganKey, userId, slot_target, selected_target, selected_slot_to_move, selected_target_slot }
    : AbilityExtraInputsProps) {

    const { roomState } = useGetRoomState({ roomId })
    const abilityUserSlots = roomState?.protalSlots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id
    console.log(ability)
    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    console.log(abilityData)
    const exclusiveData = ExclusiveAbilitiesList.find((e) => e.key === ability)

    const otherSlots = roomState?.protalSlots.filter((s) => s.id !== abilityUserSlots && s.portalCard != null)
    const targets = otherSlots?.find((s) => s.id === slot_target)?.bakugans

    if (roomState && abilityData && abilityData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                abilityData.extraInputs.includes('target') && abilityData.extraInputs.includes('targets-slot') && targets && <>
                    <Select onValueChange={(val) => selected_target_slot(val as slots_id)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a gate card slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Usable Slots</SelectLabel>
                                {
                                    otherSlots.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => selected_target(val)} disabled={slot_target === '' ? true : false}>

                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bakugan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Select the target of ability</SelectLabel>
                                {
                                    targets.map((s, index) => <SelectItem key={index} value={s.key}>{BakuganList.find((b) => b.key === s.key)?.name}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </>
            }

            {
                abilityData.extraInputs.includes('slot') && otherSlots && <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a gate card slot" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Slots</SelectLabel>
                            {
                                otherSlots.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            }
        </div>
    }

    if (roomState && exclusiveData && exclusiveData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                otherSlots && exclusiveData.extraInputs.includes('target') && exclusiveData.extraInputs.includes('targets-slot') && targets && <>
                    <Select onValueChange={(val) => selected_target_slot(val as slots_id)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a gate card slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Usable Slots</SelectLabel>
                                {
                                    otherSlots.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => selected_target(val)} disabled={slot_target === '' ? true : false}>

                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bakugan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Select the target of ability</SelectLabel>
                                {
                                    targets.map((s, index) => <SelectItem key={index} value={s.key}>{BakuganList.find((b) => b.key === s.key)?.name}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </>
            }

            {
                exclusiveData.extraInputs.includes('slot') && otherSlots && <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a gate card slot" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Usable Slots</SelectLabel>
                            {
                                otherSlots.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            }
        </div>
    }
}