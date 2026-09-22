'use client'

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSocket } from "../providers/socket-provider"
import { useMatchmakingStore } from "../store/matchmaking-store"

/**
 * Point d'écoute unique des events « de session » du jeu.
 *
 * Monté une seule fois dans le layout dashboard, donc **actif quelle que soit la
 * page** : une partie qui démarre redirige le joueur où qu'il se trouve.
 *
 * Règle : tout event qui doit agir hors d'un écran précis se branche ICI, jamais
 * dans un composant de page. Un composant de page ne garde que les events qui
 * n'ont de sens que pendant qu'il est affiché (animations de partie, messages
 * d'un salon ouvert…).
 */
export default function GameEventsListener() {
    const socket = useSocket()
    const router = useRouter()
    const pathname = usePathname()
    const stopSearch = useMatchmakingStore((s) => s.stopSearch)

    useEffect(() => {
        if (!socket) return

        /**
         * Émis pour TOUTES les créations de partie : file classée, match contre
         * un bot, et défi accepté. C'est le seul signal « ta partie commence ».
         */
        const onMatchFound = (roomId: string) => {
            stopSearch()

            if (typeof roomId !== 'string' || roomId === '') return

            const target = `/dashboard/battlefield?id=${roomId}`
            // `redirect()` de next/navigation ne fonctionne pas dans un callback
            // socket : il lève NEXT_REDIRECT que personne n'attrape ici.
            if (pathname !== '/dashboard/battlefield') {
                router.push(target)
            } else {
                router.replace(target)
            }
        }

        /**
         * Accusé de réception de `cancel-search-opponent` : le serveur ne le
         * renvoie qu'à l'auteur de l'annulation (jamais à l'adversaire), donc
         * pas de toast « l'adversaire a annulé » ici.
         */
        const onSearchCancelled = () => {
            stopSearch()
        }

        socket.on('match-found', onMatchFound)
        socket.on('search-cancelled', onSearchCancelled)

        return () => {
            socket.off('match-found', onMatchFound)
            socket.off('search-cancelled', onSearchCancelled)
        }
    }, [socket, router, pathname, stopSearch])

    return null
}
