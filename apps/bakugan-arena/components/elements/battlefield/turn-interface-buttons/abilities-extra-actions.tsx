'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { AbilityCardsList, AddBakuganAbilityFilter, BakuganList, DragBakuganAbilityFilter, ExclusiveAbilitiesList, MoveBakuganAbilityFilters, MoveOpponentAbilityFilter, slots_id } from "@bakugan-arena/game-data"
import Image from "next/image"

type AbilityExtraInputsProps = {
    userId: string,}

export default function AbilityExtraInputs({
    userId }
    : AbilityExtraInputsProps) {


    const { ability, abilityUser: bakuganKey, target, slotToDrag, bakuganToMove } = useTurnActionStore((state) => state.turnActions)
    const {
        selectTarget,
        select_slot_to_move :selected_slot_to_move,
        select_slot_to_drag,
        select_bakugan_to_add,
        select_bakugan_to_move,
        select_destination
    } = useTurnActionStore()
    
    console.log(target, slotToDrag)


    console.log(ability)
    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    console.log(abilityData)
    const exclusiveData = ExclusiveAbilitiesList.find((e) => e.key === ability)

    const slots = useGlobalGameState((state) => state.gameState?.protalSlots)
    const decksState = useGlobalGameState((state) => state.gameState?.decksState)

    // Move Bakugan Filter
    const bakuganToMoveInput = MoveBakuganAbilityFilters({bakuganToMove, slots})

    const bakuganToMoveList = bakuganToMoveInput?.bakuganToMoveList
    const bakuganToMoveDestinations = bakuganToMoveInput?.bakuganToMoveDestinations


    // Move Opponent Filter && Move Self Filter
    const moveOpponentInput = MoveOpponentAbilityFilter({slots, bakuganKey, userId})

    const otherSlots = moveOpponentInput?.otherSlots

    // Drag Bakugan Filter
    const dragBakuganInput = DragBakuganAbilityFilter({slots, bakuganKey, slotToDrag, userId})

    const draggableSlots = dragBakuganInput?.draggableSlots
    const draggables = dragBakuganInput?.draggables 

    // Add Bakugan Filter
    const addBakuganInput = AddBakuganAbilityFilter({decksState, userId})

    const addableBakugans = addBakuganInput?.addableBakugans

    console.log(abilityData?.extraInputs)

    if (abilityData && abilityData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                abilityData.extraInputs.includes('move-bakugan') && bakuganToMoveList && <>
                    <Select onValueChange={(val) => {
                        const select_bakugan = bakuganToMoveList.find((b) => b.bakuganKey === val)
                        if (select_bakugan) {
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
                                    bakuganToMoveDestinations?.map((s, index) => <SelectItem key={index} value={s.id}>{s.id}</SelectItem>)
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
    if (exclusiveData && exclusiveData.extraInputs) {
        return <div className="grid grid-cols-2 items-center justify-between gap-3">

            {
                exclusiveData.extraInputs.includes('move-bakugan') && bakuganToMoveList && <>
                    <Select onValueChange={(val) => {
                        const select_bakugan = bakuganToMoveList.find((b) => b.bakuganKey === val)
                        if (select_bakugan) {
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

// 'use client'

// import { useTurnActionStore } from "@/src/store/turn-actions-store"
// import { AbilityCardsList, ExclusiveAbilitiesList } from "@bakugan-arena/game-data"
// import MoveBakugan from "./extra-inputs-abilities/move-bakugan"
// import MoveOpponent from "./extra-inputs-abilities/move-opponent"
// import MoveSelf from "./extra-inputs-abilities/move-self"
// import DragBakugan from "./extra-inputs-abilities/drag-bakugan"
// import AddBakugan from "./extra-inputs-abilities/add-bakugan"

// type AbilityExtraInputsProps = {
//     userId: string,
// }

// export default function AbilityExtraInputs({
//     userId }
//     : AbilityExtraInputsProps) {

//     const { ability } = useTurnActionStore((state) => state.turnActions)

//     console.log(ability)
//     const abilityData = AbilityCardsList.find((a) => a.key === ability)
//     console.log(abilityData)
//     const exclusiveData = ExclusiveAbilitiesList.find((e) => e.key === ability)

//     console.log(abilityData?.extraInputs)

//     if (abilityData && abilityData.extraInputs) {
//         return <div className="grid grid-cols-2 items-center justify-between gap-3">

//             {
//                 abilityData.extraInputs.includes('move-bakugan') && <MoveBakugan />
//             }

//             {
//                 abilityData.extraInputs.includes('move-opponent') && <MoveOpponent userId={userId} />
//             }

//             {
//                 abilityData.extraInputs.includes('move-self') && <MoveSelf userId={userId} />
//             }

//             {
//                 abilityData.extraInputs.includes('drag-bakugan') && <DragBakugan userId={userId} />
//             }

//             {
//                 abilityData.extraInputs.includes('add-bakugan') && <AddBakugan userId={userId} />
//             }
//         </div>
//     }
//     if (exclusiveData && exclusiveData.extraInputs) {
//         return <div className="grid grid-cols-2 items-center justify-between gap-3">

//             {
//                 exclusiveData.extraInputs.includes('move-bakugan') && <MoveBakugan />
//             }

//             {
//                 exclusiveData.extraInputs.includes('move-opponent') && <MoveOpponent userId={userId} />
//             }

//             {
//                 exclusiveData.extraInputs.includes('move-self') && <MoveSelf userId={userId} />
//             }

//             {
//                 exclusiveData.extraInputs.includes('drag-bakugan') && <DragBakugan userId={userId} />
//             }

//             {
//                 exclusiveData.extraInputs.includes('add-bakugan') && <AddBakugan userId={userId} />
//             }
//         </div>
//     }
// }