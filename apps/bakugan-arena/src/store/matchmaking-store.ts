import { create } from 'zustand'

/**
 * État de recherche d'adversaire — global et indépendant de la page affichée.
 *
 * La recherche vit côté serveur (`waitingMap`) tant que la socket est ouverte :
 * l'état local doit donc survivre à la navigation, sinon le joueur perd son
 * indicateur et son bouton d'annulation en quittant le lobby.
 */
type MatchmakingStore = {
    searching: boolean
    deckId: string | null
    ranked: boolean
    startedAt: number | null
    startSearch: (params: { deckId: string; ranked: boolean }) => void
    stopSearch: () => void
}

export const useMatchmakingStore = create<MatchmakingStore>((set) => ({
    searching: false,
    deckId: null,
    ranked: true,
    startedAt: null,
    startSearch: ({ deckId, ranked }) =>
        set({ searching: true, deckId, ranked, startedAt: Date.now() }),
    stopSearch: () =>
        set({ searching: false, deckId: null, startedAt: null }),
}))
