import { create } from "zustand"

type ReplayBattleLogStore = {
    enabled: boolean
    setEnabled: (enabled: boolean) => void
}

export const useReplayBattleLogStore = create<ReplayBattleLogStore>((set) => ({
    enabled: true,
    setEnabled: (enabled) => set({ enabled }),
}))
