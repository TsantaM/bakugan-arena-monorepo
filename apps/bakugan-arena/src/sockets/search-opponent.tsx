'use client'

import { useCallback } from "react"
import { useSocket } from "../providers/socket-provider"
import { GetUserDeckType } from "../actions/deck-builder/get-deck-data"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { BBS1Rules, validateDeck } from "@bakugan-arena/game-data"
import { useMatchmakingStore } from "../store/matchmaking-store"

type PlayerData = {
    userId: string,
    deckId: string
}

/**
 * Émetteurs de matchmaking. **N'écoute aucun event** : `match-found` et
 * `search-cancelled` sont traités une seule fois par `GameEventsListener`
 * (monté dans le layout dashboard), pour que la redirection fonctionne depuis
 * n'importe quelle page.
 */
export default function UseSearchOpponent() {
    const tDeck = useTranslations('deckBuilder.checker')
    const socket = useSocket()

    const searching = useMatchmakingStore((s) => s.searching)
    const startSearch = useMatchmakingStore((s) => s.startSearch)
    const stopSearch = useMatchmakingStore((s) => s.stopSearch)

    const emitPlayerData = useCallback(async (
        { data, deck, ranked = true }: { data: PlayerData, deck: GetUserDeckType | undefined, ranked: boolean }
    ) => {
        const { deckId, userId } = data

        if (!socket || searching || deckId === '' || !deck) return

        if (!validateDeck(deck, BBS1Rules).valid) {
            toast.error(tDeck('invalid'))
            return
        }

        socket.emit('search-opponent', { userId, deckId, ranked })
        startSearch({ deckId, ranked })
    }, [socket, searching, startSearch, tDeck])

    const cancelSearchOpponent = useCallback((userId: string) => {
        if (!socket || !searching) return

        socket.emit('cancel-search-opponent', { userId })
        stopSearch()
    }, [socket, searching, stopSearch])

    return {
        waitingOpponent: searching,
        emitPlayerData,
        cancelSearchOpponent,
        setWaitingOpponent: stopSearch,
    }
}
