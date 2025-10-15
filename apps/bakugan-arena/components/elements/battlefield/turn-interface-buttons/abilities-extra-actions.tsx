'use client'

import { useTurnActionStore } from "@/src/store/turn-actions-store"
import { AbilityCardsList, ExclusiveAbilitiesList } from "@bakugan-arena/game-data"
import MoveBakugan from "./extra-inputs-abilities/move-bakugan"
import MoveOpponent from "./extra-inputs-abilities/move-opponent"
import MoveSelf from "./extra-inputs-abilities/move-self"
import DragBakugan from "./extra-inputs-abilities/drag-bakugan"
import AddBakugan from "./extra-inputs-abilities/add-bakugan"

type AbilityExtraInputsProps = {
    userId: string
}

export default function AbilityExtraInputs({ userId }: AbilityExtraInputsProps) {
    const ability = useTurnActionStore((state) => state.turnActions.ability)
    console.log(ability)
    const abilityData = AbilityCardsList.find((a) => a.key === ability)
    const exclusiveData = ExclusiveAbilitiesList.find((e) => e.key === ability)
    console.log(exclusiveData, exclusiveData?.extraInputs?.includes("move-bakugan"))

    if (abilityData && abilityData.extraInputs) {
        return (
            <div className="grid grid-cols-2 items-center justify-between gap-3">
                {abilityData.extraInputs.includes("move-bakugan") && <MoveBakugan />}
                {abilityData.extraInputs.includes("move-opponent") && <MoveOpponent userId={userId} />}
                {abilityData.extraInputs.includes("move-self") && <MoveSelf userId={userId} />}
                {abilityData.extraInputs.includes("drag-bakugan") && <DragBakugan userId={userId} />}
                {abilityData.extraInputs.includes("add-bakugan") && <AddBakugan userId={userId} />}
            </div>
        )
    }

    if (exclusiveData && exclusiveData.extraInputs) {
        return (
            <div className="grid grid-cols-2 items-center justify-between gap-3">
                {exclusiveData.extraInputs.includes("move-bakugan") && <MoveBakugan />}
                {exclusiveData.extraInputs.includes("move-opponent") && <MoveOpponent userId={userId} />}
                {exclusiveData.extraInputs.includes("move-self") && <MoveSelf userId={userId} />}
                {exclusiveData.extraInputs.includes("drag-bakugan") && <DragBakugan userId={userId} />}
                {exclusiveData.extraInputs.includes("add-bakugan") && <AddBakugan userId={userId} />}
            </div>
        )
    }
}
