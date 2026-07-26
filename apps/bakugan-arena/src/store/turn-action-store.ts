import { create } from 'zustand'
import type {
    ActivePlayerActionRequestType,
    InactivePlayerActionRequestType,
    TurnActionCommitPayload,
} from '@bakugan-arena/game-data'

type TurnActionPhase =
    | 'idle'
    | 'choosing'
    | 'waiting-target'
    | 'validating'

type TurnActionStore = {
    request: ActivePlayerActionRequestType | InactivePlayerActionRequestType | null
    phase: TurnActionPhase
    selectedKey: string | null
    pendingCommit: TurnActionCommitPayload | null
    setRequest: (
        request: ActivePlayerActionRequestType | InactivePlayerActionRequestType | null,
    ) => void
    setPhase: (phase: TurnActionPhase) => void
    setSelectedKey: (key: string | null) => void
    setPendingCommit: (payload: TurnActionCommitPayload | null) => void
    clear: () => void
}

export const useTurnActionStore = create<TurnActionStore>((set) => ({
    request: null,
    phase: 'idle',
    selectedKey: null,
    pendingCommit: null,
    setRequest: (request) =>
        set({
            request,
            phase: request ? 'choosing' : 'idle',
            selectedKey: null,
            pendingCommit: null,
        }),
    setPhase: (phase) => set({ phase }),
    setSelectedKey: (selectedKey) => set({ selectedKey }),
    setPendingCommit: (pendingCommit) => set({ pendingCommit }),
    clear: () =>
        set({
            request: null,
            phase: 'idle',
            selectedKey: null,
            pendingCommit: null,
        }),
}))
