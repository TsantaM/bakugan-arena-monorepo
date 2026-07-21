'use client'

import { useEffect, useState } from "react"
import { useSocket } from "../providers/socket-provider"
import { redirect } from "next/navigation"
import { GetUserDeckType } from "../actions/deck-builder/get-deck-data"
import { toast } from "sonner"
import { useTranslations } from "next-intl"


type PlayerData = {
    userId: string,
    deckId: string
}

export default function UseSearchOpponent() {
    const t = useTranslations('lobby.toasts')
    const socket = useSocket()
    const [waitingOpponent, setWaitingOpponent] = useState(false)

    const emitPlayerData = async ({ data, deck, ranked = true }: { data: PlayerData, deck: GetUserDeckType | undefined, ranked: boolean }) => {
        const { deckId, userId } = data

        if (socket && !waitingOpponent && data.deckId != '' && deck) {
            const abilityCards = deck.ability.length + deck.exclusiveAbilities.length
            const gateCards = deck.gateCards.length
            if (gateCards >= 3) {
                if (abilityCards >= 3) {
                    socket?.emit('search-opponent', ({ userId, deckId, ranked }))
                    setWaitingOpponent(true)
                } else {
                    toast.error(t('minAbilityCards'))
                }
            } else {
                toast.error(t('minGateCards'))
            }
        }
    }


    const cancelSearchOpponent = (userId: string) => {
        if (!waitingOpponent) return
        if (socket && waitingOpponent) {
            socket.emit('cancel-search-opponent', { userId })
        }
    }

    useEffect(() => {
        if (!socket) return

        const onMatchFound = (roomId: string) => {
            setWaitingOpponent(false)
            // router.push(`/dashboard/battlefield?id=${roomId}`)
            redirect(`/dashboard/battlefield?id=${roomId}`)
        }

        socket.on('match-found', onMatchFound)

        return () => {
            socket.off('match-found', onMatchFound)
        }

    }, [socket])

    useEffect(() => {
        if (!socket) return

        const onCancelSearch = () => {
            setWaitingOpponent(false)
            toast.error(t('opponentCancelled'))
        }

        socket.on('search-cancelled', onCancelSearch)

        return () => {
            socket.off('search-cancelled', onCancelSearch)
        }

    }, [socket, t])


    return {
        waitingOpponent,
        emitPlayerData,
        cancelSearchOpponent,
        setWaitingOpponent
    }

}