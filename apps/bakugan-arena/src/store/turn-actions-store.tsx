'use client'

import { bakuganToMoveType, slots_id } from "@bakugan-arena/game-data"
import { create } from "zustand"

type turnActionsType = {

    // Set Gate Card Actions
    gate: string | '',
    slot: slots_id | '',

    // Set Bakugan Action
    bakuganToSet: string | '',
    zone: slots_id | '',

    // Active Gate Card Action
    active: boolean,
    slotToActive: slots_id | ''

    // Use ability Card Hook
    ability: string | ''
    abilityUser: string | '',

    // Extra inputs (inputs additional choices)

    // --------------------------- Drag Bakugan ---------------------------
    // Slot of bakugan to drag
    slotToDrag: slots_id | '',

    // Target of the drag ability
    target: string | '',

    // Not used now but I let it be for future
    slot_target: slots_id | '',

    // --------------------------- Move Opponent && Move Self (Slot destination where opponent or user will be replaced ex: Souffle Tout / Mirage Aquatique) ---------------------------
    slot_to_move: slots_id | '',

    // --------------------------- Add Bakugan (The Bakugan how will join the fight ex: Eclat Soudain) ---------------------------
    bakuganToAdd: string | '',

    // --------------------------- Move Bakugan (effect : Marionnette (Mantris)) ---------------------------
    // Select bakugan to Move
    bakuganToMove: bakuganToMoveType | undefined,

    // Select bakugan to move destination
    destination: slots_id | ''
}

type turnActionStoreType = {
    turnActions: turnActionsType
    setGate: (gate: string) => void
    setSlot: (slot: slots_id | '') => void
    selectBakuganToSet: (bakugan: string) => void
    selectZone: (zone: string) => void
    setActiveGate: (active: boolean) => void
    selectGateToActiveSlot: (slot: slots_id | '') => void
    selectAbility: (ability: string) => void
    selectAbilityUser: (bakugan: string) => void
    select_slot_to_drag: (slot_target: slots_id | '') => void
    selectTarget: (bakuganKey: string) => void
    select_slot_to_move: (slot_to_move: slots_id | '') => void
    select_bakugan_to_add: (bakuganToAdd: string) => void
    select_bakugan_to_move: (bakuganToMove: bakuganToMoveType | undefined) => void
    select_destination: (destination: slots_id | '') => void,
    reset: () => void
}

export const useTurnActionStore = create<turnActionStoreType>((set) => ({
    turnActions: {
        // Set Gate Card Actions
        gate: '',
        slot: '',
        // Set Bakugan Action
        bakuganToSet: '',
        zone: '',
        // Active Gate Card Action
        active: false,
        slotToActive: '',
        // Use ability Card Hook
        ability: '',
        abilityUser: '',
        // Extra inputs (inputs additional choices)
        // --------------------------- Drag Bakugan ---------------------------
        // Slot of bakugan to drag
        slotToDrag: '',
        // Target of the drag ability
        target: '',
        // Not used now but I let it be for future
        slot_target: '',
        // --------------------------- Move Opponent && Move Self (Slot destination where opponent or user will be replaced ex: Souffle Tout / Mirage Aquatique) ---------------------------
        slot_to_move: '',
        // --------------------------- Add Bakugan (The Bakugan how will join the fight ex: Eclat Soudain) ---------------------------
        bakuganToAdd: '',
        // --------------------------- Move Bakugan (effect : Marionnette (Mantris)) ---------------------------
        // Select bakugan to Move
        bakuganToMove: undefined,
        // Select bakugan to move destination
        destination: ''
    },
    setGate: (gate) => {
        set((state) => {
            const newGate = state.turnActions.gate = gate
            return { ...state, newGate }
        }
        )
    },
    setSlot: (slot: slots_id | '') => set((state) => {
        const newGate = state.turnActions.slot = slot
        return { ...state, newGate }
    }),

    selectBakuganToSet: (bakugan: string) => set((state) => {
        const newGate = state.turnActions.bakuganToSet = bakugan
        return { ...state, newGate }
    }
    ),

    selectZone: (zone: string) => set((state) => {
        const newGate = state.turnActions.zone = zone as slots_id
        return { ...state, newGate }
    }
    ),

    setActiveGate: (active: boolean) => set((state) => {
        const newGate = state.turnActions.active = active
        return { ...state, newGate }
    }
    ),

    selectGateToActiveSlot: (slot: slots_id | '') => set((state) => {
        const newGate = state.turnActions.slotToActive = slot
        return { ...state, newGate }
    }
    ),

    selectAbility: (ability: string) => set((state) => {
        const newGate = state.turnActions.ability = ability
        return { ...state, newGate }
    }
    ),

    selectAbilityUser: (bakugan: string) => set((state) => {
        const newGate = state.turnActions.abilityUser = bakugan
        return { ...state, newGate }
    }
    ),

    select_slot_to_drag: (slot_target: slots_id | '') => set((state) => {
        const newGate = state.turnActions.slotToDrag = slot_target
        return { ...state, newGate }
    }
    ),
    selectTarget: (bakuganKey: string) => set((state) => {
        const newGate = state.turnActions.target = bakuganKey
        return { ...state, newGate }
    }
    ),
    select_slot_to_move: (slot_to_move: slots_id | '') => set((state) => {
        const newGate = state.turnActions.slot_to_move = slot_to_move
        return { ...state, newGate }
    }
    ),
    select_bakugan_to_add: (bakuganToAdd: string) => set((state) => {
        const newGate = state.turnActions.bakuganToAdd = bakuganToAdd
        return { ...state, newGate }
    }
    ),
    select_bakugan_to_move: (bakuganToMove: bakuganToMoveType | undefined) => set((state) => {
        const newGate = state.turnActions.bakuganToMove = bakuganToMove
        return { ...state, newGate }
    }
    ),
    select_destination: (destination: slots_id | '') => set((state) => {
        const newGate = state.turnActions.destination = destination
        return { ...state, newGate }
    }
    ),
    reset: () => {
        set((state) => {
            const newState = state.turnActions = {
                gate: '',
                slot: '',
                bakuganToSet: '',
                zone: '',
                active: false,
                slotToActive: '',
                ability: '',
                abilityUser: '',
                slotToDrag: '',
                target: '',
                slot_target: '',
                slot_to_move: '',
                bakuganToAdd: '',
                bakuganToMove: undefined,
                destination: ''
            }
            return {...state, newState}
        })
    }
}))