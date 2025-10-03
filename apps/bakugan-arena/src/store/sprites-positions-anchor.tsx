'use client'

import { create } from "zustand"

export type spritePosition = {
    key: string,
    userId: string,
    x: number,
    y: number,
    h: number,
    w: number
}

type spritePositionStoreType = {
    spritesPositions: spritePosition[],
    setSpritesPositions: (data: spritePosition) => void,
    refreshKey: number,
    setRefreshKey: () => void
}

export const useSpritePositionAnchor = create<spritePositionStoreType>((set) => ({
    spritesPositions: [],
    refreshKey: 0,
    setRefreshKey: () => {
        set((state) => ({ refreshKey: state.refreshKey + 1 }))
    },
    setSpritesPositions(data) {
        set((state) => {
            const index = state.spritesPositions.findIndex((p) => p.key === data.key && p.userId === data.userId)
            if (index !== -1) {
                const update = state.spritesPositions[index] = {
                    ...state.spritesPositions[index],
                    x: data.x,
                    y: data.y,
                    h: data.h,
                    w: data.w
                }
                return { spritesPositions: [...state.spritesPositions, update] }
            } else {
                return { spritesPositions: [...state.spritesPositions, data] }
            }
        })
        set((state) => ({ refreshKey: state.refreshKey + 1 }))

    },
}))