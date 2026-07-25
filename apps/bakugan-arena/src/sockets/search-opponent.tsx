'use client'

import { useEffect, useState } from "react"
import { useSocket } from "../providers/socket-provider"
import { redirect } from "next/navigation"
import { GetUserDeckType } from "../actions/deck-builder/get-deck-data"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { BBS1Rules, validateDeck } from "@bakugan-arena/game-data"


type PlayerData = {
    userId: string,
    deckId: string
}

export default function UseSearchOpponent() {
    const t = useTranslations('lobby.toasts')
    const tDeck = useTranslations('deckBuilder.checker')
    const socket = useSocket()
    const [waitingOpponent, setWaitingOpponent] = useState(false)

    const emitPlayerData = async ({ data, deck, ranked = true }: { data: PlayerData, deck: GetUserDeckType | undefined, ranked: boolean }) => {
        const { deckId, userId } = data

        if (socket && !waitingOpponent && data.deckId != '' && deck) {
            if (!validateDeck(deck, BBS1Rules).valid) {
                toast.error(tDeck('invalid'))
                return
            }

            socket.emit('search-opponent', ({ userId, deckId, ranked }))
            setWaitingOpponent(true)
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
