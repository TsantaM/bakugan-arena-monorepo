'use client'

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useSocket } from "../providers/socket-provider"
import {
    useBattleNotificationsStore,
    type BattleNotificationKind,
    type OpponentActionType,
} from "../store/battle-notifications-store"

const BATTLEFIELD_PATH = '/dashboard/battlefield'

type BattleNotificationPayload = {
    roomId: string
    kind: BattleNotificationKind
    opponentName: string
    at: number
    action?: OpponentActionType
}

/** roomId affiché à l'écran, ou null si on n'est pas sur un battlefield. */
function currentRoomId(pathname: string): string | null {
    if (pathname !== BATTLEFIELD_PATH) return null
    if (typeof window === 'undefined') return null
    // `useSearchParams()` ferait basculer tout l'arbre en rendu client (ce
    // listener est monté dans le layout racine) : on lit la query au moment de
    // l'event, pas au rendu.
    return new URLSearchParams(window.location.search).get('id')
}

/**
 * Notifications de combat reçues hors de la page de combat.
 *
 * Le serveur émet `battle-notification` sur le socket global du joueur sans
 * chercher à savoir où il se trouve (il ne peut pas : seul le client connaît sa
 * route et la visibilité de son onglet). C'est donc ici qu'on décide : si le
 * joueur regarde déjà ce combat, on ignore — l'UI de jeu fait déjà le travail.
 * Sinon, toast + marquage du match dans la sidebar.
 *
 * Monté une seule fois via `GameSessionProvider`, donc actif sur toutes les
 * routes (cf. la règle documentée dans `game-events-listener.tsx`).
 */
export default function BattleNotificationListener() {
    const socket = useSocket()
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations('nav.notifications')

    useEffect(() => {
        if (!socket) return

        const onBattleNotification = (payload: BattleNotificationPayload) => {
            if (!payload?.roomId) return

            const watchingThisBattle =
                currentRoomId(pathname) === payload.roomId &&
                document.visibilityState === 'visible'

            if (watchingThisBattle) return

            useBattleNotificationsStore.getState().notify(payload.roomId, {
                kind: payload.kind,
                opponentName: payload.opponentName,
                at: payload.at,
                action: payload.action,
            })

            const name = payload.opponentName || '?'

            let title: string
            let description: string

            if (payload.kind === 'game-finished') {
                title = t('finished.title')
                description = t('finished.description', { name })
            } else if (payload.kind === 'opponent-action') {
                title = t('opponentAction.title', { name })
                // `has()` plutôt qu'un try/catch : une action ajoutée côté
                // serveur sans sa traduction retombe sur un libellé générique
                // au lieu de faire exploser le toast.
                description = payload.action && t.has(`opponentAction.actions.${payload.action}`)
                    ? t(`opponentAction.actions.${payload.action}`)
                    : t('opponentAction.fallback')
            } else {
                title = t('yourTurn.title')
                description = t('yourTurn.description', { name })
            }

            toast[payload.kind === 'action-required' ? 'warning' : 'info'](title, {
                // Id stable par combat : les actions successives de l'adversaire
                // remplacent le toast en place au lieu d'en empiler un par coup,
                // et le « à toi de jouer » qui suit écrase le dernier « a joué ».
                id: `battle-${payload.roomId}`,
                description,
                action: {
                    label: t('join'),
                    onClick: () => {
                        useBattleNotificationsStore.getState().clear(payload.roomId)
                        router.push(`${BATTLEFIELD_PATH}?id=${payload.roomId}`)
                    },
                },
            })
        }

        socket.on('battle-notification', onBattleNotification)

        return () => {
            socket.off('battle-notification', onBattleNotification)
        }
    }, [socket, router, pathname, t])

    // Revenir sur l'onglet alors qu'on est déjà sur la page du combat vaut
    // lecture : sans ça, la cloche resterait allumée pour un match qu'on regarde.
    useEffect(() => {
        const clearIfWatching = () => {
            if (document.visibilityState !== 'visible') return
            const roomId = currentRoomId(pathname)
            if (roomId) useBattleNotificationsStore.getState().clear(roomId)
        }

        clearIfWatching()
        document.addEventListener('visibilitychange', clearIfWatching)

        return () => {
            document.removeEventListener('visibilitychange', clearIfWatching)
        }
    }, [pathname])

    return null
}
