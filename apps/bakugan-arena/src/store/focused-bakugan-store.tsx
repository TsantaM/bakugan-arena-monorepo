'use client'

import { bakuganOnSlot } from '@bakugan-arena/game-data';
import {create} from 'zustand';

interface FocusedBakugan {
    usersBakugan: bakuganOnSlot | undefined,
    setUsersBakugan: (bakugan: bakuganOnSlot) => void,
    opponentBakugan: bakuganOnSlot | undefined,
    setOpponentBakugan: (bakugan: bakuganOnSlot) => void,
    reset: () => void
}

export const useFocusedBakugan = create<FocusedBakugan>((set) => ({
    usersBakugan: undefined,
    setUsersBakugan(bakugan) {
        set(() => ({usersBakugan : bakugan}))
    },
    opponentBakugan: undefined,
    setOpponentBakugan(bakugan) {
        set(() => ({opponentBakugan : bakugan}))
    },  
    reset() {
        set(() => ({usersBakugan : undefined}))
        set(() => ({opponentBakugan : undefined}))
    },
}))