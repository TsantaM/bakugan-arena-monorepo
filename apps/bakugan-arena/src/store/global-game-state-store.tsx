'use client'

import { stateType } from '@bakugan-arena/game-data'
import { create } from 'zustand'

type globalGateStateType = {
    gameState: stateType | null,
    refreshKey: number,
    setGlobalState: (state: stateType) => void,
    setRefreshKey: () => void
}

export const useGlobalGameState = create<globalGateStateType>((set) => ({
    gameState: null,
    refreshKey: 0,
    setRefreshKey: () => {
        set(() => ({ refreshKey: + 1 }))
    },
    setGlobalState(state) {
        set(() => ({ gameState: state }))
        set(() => ({refreshKey: +1}))
    },
}))