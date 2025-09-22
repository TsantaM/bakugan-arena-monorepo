'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import useGetRoomState from "@/src/sockets/get-room-state"
import { AbilityCardsList, BakuganList, bakuganToMoveType, ExclusiveAbilitiesList, slots_id } from "@bakugan-arena/game-data"
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
    bakuganToMove: bakuganToMoveType | undefined,
    selectTarget: (bakuganKey: string) => void,
    selected_target: (bakuganKey: string) => void,
    selected_target_slot: (slot_target: slots_id) => void,
    selected_slot_to_move: (slot_to_move: slots_id) => void,
    select_slot_to_drag: (slot_target: slots_id) => void,
    select_bakugan_to_add: (bakugan_to_add: string) => void,
    select_bakugan_to_move: (bakuganToMove : bakuganToMoveType) => void,
    select_destination: (destination: slots_id) => void
}

export default function AbilityExtraInputs({
    roomId, ability, bakuganKey, userId, slot_target, target, slotToDrag, bakuganToMove ,selected_target, selected_slot_to_move, selected_target_slot, select_slot_to_drag, selectTarget, select_bakugan_to_add, select_bakugan_to_move, select_destination }
    : AbilityExtraInputsProps) {

    console.log(target, slotToDrag)

    const { roomState } = useGetRoomState({ roomId })
    const abilityUserSlots = roomState?.protalSlots.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id
    console.log(ability)
    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    console.log(abilityData)
    const exclusiveData = ExclusiveAbilitiesList.find((e) => e.key === ability)

    const otherSlots = roomState?.protalSlots.filter((s) => s.id !== abilityUserSlots && s.portalCard !== null)
    const targets = otherSlots?.find((s) => s.id === slot_target)?.bakugans

    const draggableSlots = roomState?.protalSlots.filter((s) => s.id !== abilityUserSlots)
    const draggables = draggableSlots?.find((s) => s.id === slotToDrag)?.bakugans

    const addableBakugans = roomState?.decksState.find((d) => d.userId === userId)?.bakugans.filter((b) => !b?.bakuganData.elimined && !b?.bakuganData.onDomain)
    const bakuganToMoveList: bakuganToMoveType[] | undefined = roomState?.protalSlots.filter((s) => s.portalCard !== null && !s.can_set && s.bakugans.length > 0).flatMap((slot) =>
        slot.bakugans.map((bakugan) => ({
            slot: slot.id,
            bakuganKey: bakugan.key,
            userId: bakugan.userId
        }))
    )
    const bakuganToMoveDestinations = roomState?.protalSlots.filter((s) => s.id !== bakuganToMove?.slot && !s.can_set && s.portalCard !== null)

    if (roomState && abilityData && abilityData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                abilityData.extraInputs.includes('move-bakugan') && bakuganToMoveList && <>
                    <Select onValueChange={(val) => {
                        const select_bakugan = bakuganToMoveList.find((b) => b.bakuganKey === val)
                        if(select_bakugan) {
                            select_bakugan_to_move(select_bakugan)
                        }
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a gate card slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Usable Slots</SelectLabel>
                                {
                                    bakuganToMoveList.map((s, index) => <SelectItem key={index} value={s.bakuganKey}>{BakuganList.find((b) => b.key === s.bakuganKey)?.name}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => select_destination(val as slots_id)} disabled={bakuganToMove === undefined ? true : false}>

                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bakugan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Select the target of ability</SelectLabel>
                                {
                                    bakuganToMoveDestinations && bakuganToMoveDestinations.map((s, index) => <SelectItem key={index} value={s.id}>{s.id}</SelectItem>)
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
                abilityData.extraInputs.includes('move-self') && otherSlots && <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
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
                exclusiveData.extraInputs.includes('move-bakugan') && bakuganToMoveList && <>
                    <Select onValueChange={(val) => {
                        const select_bakugan = bakuganToMoveList.find((b) => b.bakuganKey === val)
                        if(select_bakugan) {
                            select_bakugan_to_move(select_bakugan)
                        }
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a gate card slot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Usable Slots</SelectLabel>
                                {
                                    bakuganToMoveList.map((s, index) => <SelectItem key={index} value={s.bakuganKey}>{BakuganList.find((b) => b.key === s.bakuganKey)?.name}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(val) => select_destination(val as slots_id)} disabled={bakuganToMove === undefined ? true : false}>

                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bakugan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Select the target of ability</SelectLabel>
                                {
                                    bakuganToMoveDestinations && bakuganToMoveDestinations.map((s, index) => <SelectItem key={index} value={s.id}>{s.id}</SelectItem>)
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </>
            }

            {
                exclusiveData.extraInputs.includes('move-opponent') && otherSlots && <Select onValueChange={(val) => selected_slot_to_move(val as slots_id)}>
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
                exclusiveData.extraInputs.includes('add-bakugan') && <Select onValueChange={(val) => select_bakugan_to_add(val)}>
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
}