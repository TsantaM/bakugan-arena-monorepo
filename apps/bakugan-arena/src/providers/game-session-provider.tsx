'use client'

import MatchmakingBanner from "@/components/elements/dashboard/matchmaking-banner"
import { Toaster } from "@/components/ui/sonner"
import ChalengeSomeoneListener from "../global-listener/chalenge-someone-listener"
import ChatListener from "../global-listener/chat-global-listener"
import GameEventsListener from "../global-listener/game-events-listener"
import UsersStoreUpdateListener from "../global-listener/users-store-update-listener"
import { SocketProvider } from "./socket-provider"

/**
 * Session de jeu temps réel : socket unique + listeners globaux + indicateurs
 * persistants.
 *
 * Monté dans le layout RACINE, donc actif sur **toutes** les routes (dashboard,
 * baku-dex, pages publiques…). C'est ce qui garantit qu'une partie qui démarre
 * redirige le joueur où qu'il soit dans l'application.
 *
 * Ne pas le remonter dans un layout enfant : ça ouvrirait une seconde socket et
 * dupliquerait tous les listeners. Pour un visiteur non connecté,
 * `SocketProvider` n'ouvre aucune connexion et chaque listener est inerte.
 *
 * Porte aussi le `<Toaster />` unique de l'application : les listeners globaux
 * émettent des toasts hors de toute page, et plusieurs Toaster montés en même
 * temps afficheraient chaque toast en double.
 */
export default function GameSessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider>
            <UsersStoreUpdateListener />
            <ChatListener />
            <GameEventsListener />
            <ChalengeSomeoneListener />
            {children}
            <MatchmakingBanner />
            <Toaster />
        </SocketProvider>
    )
}
