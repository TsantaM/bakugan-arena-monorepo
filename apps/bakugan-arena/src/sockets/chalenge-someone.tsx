'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import type {
    ChalengeEndedSocketProps,
    ChalengeFailedSocketProps,
    chalengeAcceptRedirectProps,
    MessageType,
} from "@bakugan-arena/game-data"
import { authClient } from "../lib/auth-client"
import { useChatStore } from "../store/chat-window-store"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

/**
 * Cycle de vie complet d'un défi, branché une seule fois via
 * `GameSessionProvider` — donc actif sur toutes les routes.
 *
 * Les handlers lisent le store avec `useChatStore.getState()` plutôt que via les
 * valeurs du rendu : l'effet n'est réenregistré qu'au changement de socket, une
 * closure sur `chats` y serait périmée dès le premier message.
 */
export default function ChalengeSomeone() {
    const socket = useSocket()
    const t = useTranslations('lobby.challenge')
    const userId = authClient.useSession().data?.user.id

    useEffect(() => {
        if (!socket) return

        const store = () => useChatStore.getState()

        /** Message système dans le fil de discussion du joueur concerné. */
        const systemMessage = (targetId: string, text: string) => {
            const { chats, addMessage } = store()
            const targetName = chats.find((c) => c.targetId === targetId)?.targetName ?? 'Player'

            const message: MessageType = {
                createdAd: Date.now(),
                senderId: targetId,
                targetId,
                senderName: targetName,
                text,
            }

            addMessage({ message, targetId })
        }

        // --- Défi reçu -------------------------------------------------------
        const onChalengeReceive = ({ chalengerId, chalengerName }: {
            chalengerName: string
            chalengerId: string
        }) => {
            const { chats, upsertChat, setFocused, onReceiveChallenge } = store()

            if (!chats.some((c) => c.targetId === chalengerId)) {
                upsertChat({ targetId: chalengerId, targetName: chalengerName })
            }

            setFocused(chalengerId)
            onReceiveChallenge(chalengerId)
            systemMessage(chalengerId, t('received'))
            toast.info(t('popupDescription', { name: chalengerName }))
        }

        // --- Défi accepté ----------------------------------------------------
        const onAcceptChalenge = ({ chalengerId, userId: targetUserId }: chalengeAcceptRedirectProps) => {
            // L'interlocuteur est celui des deux qui n'est pas moi
            const otherId = userId === chalengerId ? targetUserId : chalengerId

            const { clearChallenge, clearIsChalenged, setFocused } = store()

            setFocused(otherId)
            clearChallenge(otherId)
            clearIsChalenged(otherId)
            systemMessage(otherId, t('accepted'))
        }

        // --- Défi refusé (reçu par le challenger) ----------------------------
        const onChalengeRejected = (rejecterId: string) => {
            store().clearChallenge(rejecterId)
            systemMessage(rejecterId, t('rejected'))
            toast.info(t('rejected'))
        }

        // --- Défi annulé (reçu par la cible) ---------------------------------
        const onChalengeCanceled = (chalengerId: string) => {
            store().clearIsChalenged(chalengerId)
            systemMessage(chalengerId, t('canceled'))
            toast.info(t('canceled'))
        }

        // --- Défi terminé sans réponse (délai dépassé / déconnexion) ----------
        const onChalengeEnded = ({ chalengerId, targetId, reason }: ChalengeEndedSocketProps) => {
            const otherId = userId === chalengerId ? targetId : chalengerId
            const { clearChallenge, clearIsChalenged } = store()

            // Les deux côtés sont nettoyés : on ne sait pas lequel on est sans
            // recroiser l'id, et effacer un état déjà nul est sans effet.
            clearChallenge(otherId)
            clearIsChalenged(otherId)

            const label = reason === 'DISCONNECTED' ? t('disconnected') : t('expired')
            systemMessage(otherId, label)
            toast.info(label)
        }

        // --- Envoi refusé par le serveur -------------------------------------
        const onChalengeFailed = ({ targetId, reason }: ChalengeFailedSocketProps) => {
            store().clearChallenge(targetId)

            const label =
                reason === 'TARGET_OFFLINE' ? t('targetOffline')
                    : reason === 'SELF' ? t('self')
                        : t('alreadyPending')

            toast.error(label)
        }

        socket.on('chalenge', onChalengeReceive)
        socket.on('chalenge-accept-redirect', onAcceptChalenge)
        socket.on('chalenge-rejected', onChalengeRejected)
        socket.on('chalenge-canceled', onChalengeCanceled)
        socket.on('chalenge-ended', onChalengeEnded)
        socket.on('chalenge-failed', onChalengeFailed)

        return () => {
            socket.off('chalenge', onChalengeReceive)
            socket.off('chalenge-accept-redirect', onAcceptChalenge)
            socket.off('chalenge-rejected', onChalengeRejected)
            socket.off('chalenge-canceled', onChalengeCanceled)
            socket.off('chalenge-ended', onChalengeEnded)
            socket.off('chalenge-failed', onChalengeFailed)
        }
    }, [socket, userId, t])

    return null
}
