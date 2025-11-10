
import { AnimationDirectivesTypes } from '@bakugan-arena/game-data';
import { create } from 'zustand';


interface AnimationStore {
    Animations: AnimationDirectivesTypes[],
    setAnimationAndMessages: (animations: AnimationDirectivesTypes[]) => void
    clearStore: () => void
    removeFirst: () => void
}


export const useAnimationStore = create<AnimationStore>((set) => ({
    Animations: [],
    setAnimationAndMessages(animations) {
        set(() => ({ Animations: animations }))
    },
    clearStore() {
        set(() => ({ Animations: [] }))
    },
    removeFirst() {
        set((state) => ({ Animations: state.Animations.splice(1) }))
    },
}))