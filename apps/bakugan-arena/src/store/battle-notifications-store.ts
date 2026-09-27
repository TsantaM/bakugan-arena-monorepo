import { create } from 'zustand'

export type BattleNotificationKind = 'action-required' | 'opponent-action' | 'game-finished'

export type OpponentActionType =
    | 'set-bakugan'
    | 'select-gate'
    | 'set-gate'
    | 'activate-gate'
    | 'use-ability'
    | 'change-attribute'
    | 'pass-turn'
    | 'resolve-ability'
    | 'resolve-gate'

export type BattleNotification = {
    kind: BattleNotificationKind
    opponentName: string
    at: number
    action?: OpponentActionType
}

type BattleNotificationsStore = {
    /** Notifications en attente, indexées par roomId. */
    byRoom: Record<string, BattleNotification>
    notify: (roomId: string, notification: BattleNotification) => void
    clear: (roomId: string) => void
    clearAll: () => void
}

/**
 * Notifications de combat non lues, alimentées par
 * `BattleNotificationListener` et consommées par la sidebar.
 *
 * Une seule notification par room : la plus récente remplace la précédente.
 * Un combat où l'adversaire enchaîne trois actions reste une seule entrée qui
 * clignote, pas une pile à écouler.
 *
 * Volontairement non persisté : une notification ne vaut que pour la session en
 * cours, l'état réel de la partie est de toute façon resservi par le serveur au
 * retour sur la page.
 */
export const useBattleNotificationsStore = create<BattleNotificationsStore>((set) => ({
    byRoom: {},
    notify: (roomId, notification) =>
        set((state) => ({ byRoom: { ...state.byRoom, [roomId]: notification } })),
    clear: (roomId) =>
        set((state) => {
            if (!state.byRoom[roomId]) return state
            const byRoom = { ...state.byRoom }
            delete byRoom[roomId]
            return { byRoom }
        }),
    clearAll: () => set({ byRoom: {} }),
}))
