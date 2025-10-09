'use client'

import { bakuganOnSlot, portalSlotsType, portalSlotsTypeElement, slots_id, stateType } from '@bakugan-arena/game-data'
import { create } from 'zustand'

type globalGateStateType = {
    gameState: stateType | null,
    portalSlots: portalSlotsType,
    setSlots: (slots: portalSlotsType) => void,
    setUpdateSlot: (slot: portalSlotsTypeElement) => void,
    removeBakugan: ({ bakugan, slot }: { bakugan: bakuganOnSlot, slot: portalSlotsTypeElement }) => void,
    cleanSlots: () => void,
    refreshKey: number,
    setGlobalState: (state: stateType) => void,
    setRefreshKey: () => void
}

export const useGlobalGameState = create<globalGateStateType>((set) => ({
    gameState: null,
    refreshKey: 0,
    portalSlots: [],
    setSlots(slots) {
        set(() => ({portalSlots: slots}))
    },
    cleanSlots() {
        set(() => (
            {portalSlots: []}
        ))
    },
    setUpdateSlot(slot) {
        set((state) => {
            const slotToUpdate = state.portalSlots.find((s) => s.id === slot.id)
            const index = state.portalSlots.findIndex((s) => s.id === slot.id)
            if (slotToUpdate && index !== -1) {
                const updated = state.portalSlots[index] = {
                    ...state.portalSlots[index],
                    activateAbilities: slot.activateAbilities,
                    bakugans: slot.bakugans,
                    can_set: slot.can_set,
                    id: slot.id,
                    portalCard: slot.portalCard,
                    state: slot.state
                }
                return { portalSlots: [...state.portalSlots, updated] }
            } else {
                return { portalSlots: [...state.portalSlots, slot] }
            }
        })
    },
    removeBakugan({ bakugan, slot }) {
        set((state) => {
            const slotToUpdate = state.portalSlots.find((s) => s.id === slot.id && s.bakugans.includes(bakugan))
            const index = state.portalSlots.findIndex((s) => s.id === slot.id && s.bakugans.includes(bakugan))
            const bakuganIndex = slotToUpdate?.bakugans.findIndex((b) => b === bakugan)
            if (slotToUpdate && index !== -1 && bakuganIndex && bakuganIndex !== -1) {
                const updated = state.portalSlots[index]
                updated.bakugans.splice(bakuganIndex, 1)
                return { portalSlots: [...state.portalSlots, updated] }
            } else {
                return { portalSlots: [...state.portalSlots, slot] }
            }

        })
    },
    setRefreshKey: () => {
        set(() => ({ refreshKey: + 1 }))
    },
    setGlobalState(state) {
        set(() => ({ gameState: state }))
        set(() => ({ refreshKey: +1 }))
    },
}))