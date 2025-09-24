'use client'

import { bakuganToMoveType, slots_id } from "@bakugan-arena/game-data"
import { useState } from "react"

export default function UseAbilityCardHook() {
    // Ability Card choices
    const [ability, setAbility] = useState('')
    const selectAbility = (ability: string) => {
        setAbility(ability)
    }

    // Bakugan how will use the ability
    const [abilityUser, setAbilityUser] = useState('')
    const selectAbilityUser = (bakugan: string) => {
        setAbilityUser(bakugan)
    }

    // Extra inputs (inputs additional choices)

    // --------------------------- Drag Bakugan ---------------------------
    // Slot of bakugan to drag
    const [slotToDrag, setSlotToDrag] = useState<slots_id | ''>('')
    const select_slot_to_drag = (slot_target: slots_id | '') => {
        setSlotToDrag(slot_target)
    }

    // Target of the drag ability
    const [target, setTarget] = useState('')
    const selectTarget = (bakuganKey: string) => {
        setTarget(bakuganKey)
    }


    // Not used now but I let it be for future
    const [slot_target, set_slot_target] = useState<slots_id | ''>('')
    const select_slot_target = (slot_target: slots_id | '') => {
        set_slot_target(slot_target)
    }

    // --------------------------- Move Opponent && Move Self (Slot destination where opponent or user will be replaced ex: Souffle Tout / Mirage Aquatique) ---------------------------
    const [slot_to_move, set_slot_to_move] = useState<slots_id | ''>('')
    const select_slot_to_move = (slot_to_move: slots_id | '') => {
        set_slot_to_move(slot_to_move)
    }


    // --------------------------- Add Bakugan (The Bakugan how will join the fight ex: Eclat Soudain) ---------------------------
    const [bakuganToAdd, setBakuganToAdd] = useState('')
    const select_bakugan_to_add = (bakuganToAdd: string) => {
        setBakuganToAdd(bakuganToAdd)
    }

    // --------------------------- Move Bakugan (effect : Marionnette (Mantris)) ---------------------------
    // Select bakugan to Move
    const [bakuganToMove, setBakuganToMove] = useState<bakuganToMoveType | undefined>()
    const select_bakugan_to_move = (bakuganToMove: bakuganToMoveType | undefined) => {
        setBakuganToMove(bakuganToMove)
    }

    // Select bakugan to move destination
    const [destination, setDestination] = useState<slots_id | ''>('')
    const select_destination = (destination: slots_id | '') => {
        setDestination(destination)
    }


    return {
        ability, selectAbility,
        abilityUser, selectAbilityUser,

        target, selectTarget,
        slotToDrag, select_slot_to_drag,

        slot_target, select_slot_target,

        slot_to_move, select_slot_to_move,

        bakuganToAdd, select_bakugan_to_add,

        bakuganToMove, select_bakugan_to_move,
        destination, select_destination
    }
}