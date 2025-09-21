'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import useGetRoomState from "@/src/sockets/get-room-state"
import { AbilityCardsList, BakuganList, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data"
import Image from "next/image"

type AbilityExtraInputsProps = {
    roomId: string,
    ability: string,
    bakuganKey: string,
    userId: string,
    slot_target: slots_id | '',
    slotToDrag: slots_id | '',
    target: string | '',
    bakugaToAdd: string | '',
    selectTarget: (bakuganKey: string) => void,
    selected_target: (bakuganKey: string) => void,
    selected_target_slot: (slot_target: slots_id) => void,
    selected_slot_to_move: (slot_to_move: slots_id) => void,
    select_slot_to_drag: (slot_target: slots_id) => void,
    select_bakugan_to_add: (bakugan_to_add: string) => void
}

export default function AbilityExtraInputs({
    roomId, ability, bakuganKey, userId, slot_target, target, slotToDrag, bakugaToAdd, selected_target, selected_slot_to_move, selected_target_slot, select_slot_to_drag, selectTarget, select_bakugan_to_add }
    : AbilityExtraInputsProps) {

    console.log(target, slotToDrag)

    const { roomState } = useGetRoomState({ roomId })
    const abilityUserSlots = roomState?.protalSlots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id
    console.log(ability)
    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    console.log(abilityData)
    const exclusiveData = ExclusiveAbilitiesList.find((e) => e.key === ability)

    const otherSlots = roomState?.protalSlots.filter((s) => s.id !== abilityUserSlots && s.portalCard != null)
    const targets = otherSlots?.find((s) => s.id === slot_target)?.bakugans

    const draggableSlots = roomState?.protalSlots.filter((s) => s.id !== abilityUserSlots)
    const draggables = draggableSlots?.find((s) => s.id === slotToDrag)?.bakugans

    const addableBakugans = roomState?.decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain)


    if (roomState && abilityData && abilityData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                abilityData.extraInputs.includes('add-bakugan') && targets && <>
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
                abilityData.extraInputs.includes('move-opponent') && otherSlots && <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
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

            {
                abilityData.extraInputs.includes('drag-bakugan') && draggableSlots && <>
                    <Select onValueChange={(val) => select_slot_to_drag(val as slots_id)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a gate card slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Usable Slots</SelectLabel>
                                {
                                    draggableSlots.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
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
            }

            {
                abilityData.extraInputs.includes('add-bakugan') && <Select onValueChange={(val) => select_bakugan_to_add(val)}>
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
            }
        </div>
    }
    if (roomState && exclusiveData && exclusiveData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                otherSlots && exclusiveData.extraInputs.includes('move-opponent') && targets && <>
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
                exclusiveData.extraInputs.includes('move-self') && otherSlots && <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
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

            {
                exclusiveData.extraInputs.includes('drag-bakugan') && draggableSlots && <>
                    <Select onValueChange={(val) => selected_target_slot(val as slots_id)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a gate card slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Usable Slots</SelectLabel>
                                {
                                    draggableSlots.map((s, index) => <SelectItem key={index} value={s.id}>{s.id} {s.portalCard?.userId === userId && `(${s.portalCard.key})`}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => selected_target(val)} disabled={slotToDrag === '' ? true : false}>

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
            }
        </div>
    }
}