'use client'

import { Button } from "@/components/ui/button"
import { authClient } from "@/src/lib/auth-client"
import { useMatchmakingStore } from "@/src/store/matchmaking-store"
import UseSearchOpponent from "@/src/sockets/search-opponent"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

/**
 * Indicateur de recherche visible sur toutes les pages du dashboard.
 * Sans lui, quitter le lobby fait perdre au joueur toute trace de sa recherche
 * en cours (et tout moyen de l'annuler).
 */
export default function MatchmakingBanner() {
    const t = useTranslations('lobby.ranked')
    const tCommon = useTranslations('common')
    const searching = useMatchmakingStore((s) => s.searching)
    const { cancelSearchOpponent } = UseSearchOpponent()
    const userId = authClient.useSession().data?.user.id

    if (!searching) return null

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur"
        >
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            <span className="text-sm">{t('waitingOpponent')}</span>
            <Button
                size="sm"
                variant="destructive"
                className="h-7 rounded-full px-3"
                onClick={() => userId && cancelSearchOpponent(userId)}
            >
                {tCommon('actions.cancel')}
            </Button>
        </div>
    )
}
