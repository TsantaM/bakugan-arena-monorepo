import { create } from "zustand"

type BattlefieldBattleLogStore = {
    enabled: boolean
    setEnabled: (enabled: boolean) => void
}

export const useBattlefieldBattleLogStore = create<BattlefieldBattleLogStore>((set) => ({
    enabled: true,
    setEnabled: (enabled) => set({ enabled }),
}))
