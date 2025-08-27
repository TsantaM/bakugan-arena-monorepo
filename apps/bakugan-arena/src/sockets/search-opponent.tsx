'use client'

import { useEffect, useState } from "react"
import { useSocket } from "../providers/socket-provider"
import { redirect } from "next/navigation"
import { GetUserDeckType } from "../actions/deck-builder/get-deck-data"
import { toast } from "sonner"


type PlayerData = {
    userId: string,
    deckId: string
}

export default function UseSearchOpponent() {
    const socket = useSocket()
    const [waitingOpponent, setWaitingOpponent] = useState(false)

    const emitPlayerData = async ({ data, deck }: { data: PlayerData, deck: GetUserDeckType | undefined }) => {
        const { deckId, userId } = data

        if (socket && !waitingOpponent && data.deckId != '' && deck) {
            const abilityCards = deck.ability.length + deck.exclusiveAbilities.length
            const gateCards = deck.gateCards.length
            if (gateCards >= 3) {
                if (abilityCards >= 3) {
                    socket?.emit('search-opponent', ({ userId, deckId }))
                    setWaitingOpponent(true)
                } else {
                    toast.error('You should have minimum 3 Ability Cards in your deck')
                }
            } else {
                toast.error('You should have minimum 3 Gate Cards in your deck')
            }
        }
    }

    useEffect(() => {
        if (!socket) return

        socket.on('match-found', (roomId) => {
            console.log('Match found', roomId)
            redirect(`/dashboard/battlefield?id=${roomId}`)
        })
    }, [socket])

    return {
        waitingOpponent,
        emitPlayerData
    }

}