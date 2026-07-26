import { create } from 'zustand'
import type {
    AbilityCardsActionsRequestsType,
    AdditionalActionKind,
    AdditionalTargetResult,
    gateCardActionRequestsType,
} from '@bakugan-arena/game-data'

type AdditionalActionPhase =
    | 'idle'
    | 'choosing'
    | 'waiting-target'
    | 'validating'

type AdditionalActionStore = {
    kind: AdditionalActionKind | null
    abilityRequest: AbilityCardsActionsRequestsType | null
    gateRequest: gateCardActionRequestsType | null
    phase: AdditionalActionPhase
    selectedKey: string | null
    pendingTarget: AdditionalTargetResult | null
    setAbilityRequest: (request: AbilityCardsActionsRequestsType) => void
    setGateRequest: (request: gateCardActionRequestsType) => void
    setPhase: (phase: AdditionalActionPhase) => void
    setSelectedKey: (key: string | null) => void
    setPendingTarget: (payload: AdditionalTargetResult | null) => void
    clear: () => void
}

export const useAdditionalActionStore = create<AdditionalActionStore>((set) => ({
    kind: null,
    abilityRequest: null,
    gateRequest: null,
    phase: 'idle',
    selectedKey: null,
    pendingTarget: null,
    setAbilityRequest: (request) =>
        set({
            kind: 'ability',
            abilityRequest: request,
            gateRequest: null,
            phase: 'choosing',
            selectedKey: null,
            pendingTarget: null,
        }),
    setGateRequest: (request) =>
        set({
            kind: 'gate',
            abilityRequest: null,
            gateRequest: request,
            phase: 'choosing',
            selectedKey: null,
            pendingTarget: null,
        }),
    setPhase: (phase) => set({ phase }),
    setSelectedKey: (selectedKey) => set({ selectedKey }),
    setPendingTarget: (pendingTarget) => set({ pendingTarget }),
    clear: () =>
        set({
            kind: null,
            abilityRequest: null,
            gateRequest: null,
            phase: 'idle',
            selectedKey: null,
            pendingTarget: null,
        }),
}))
