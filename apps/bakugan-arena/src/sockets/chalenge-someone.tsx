'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import { chalengeAcceptRedirectProps, MessageType } from "@bakugan-arena/game-data"
import { authClient } from "../lib/auth-client"
import { useChatStore } from "../store/chat-window-store"

export default function ChalengeSomeone() {

    const { clearChallenge, chats, addMessage, onReceiveChallenge, upsertChat, setFocused, clearIsChalenged } = useChatStore()
    const socket = useSocket()
    const userId = authClient.useSession().data?.user.id
    const username = authClient.useSession().data?.user.displayUsername


    useEffect(() => {
        if (!socket) return

        const onChalengeReceive = (chalengeData: {
            chalengerName: string;
            chalengerId: string;
        }) => {

            const { chalengerId, chalengerName } = chalengeData

            const chat = chats.find((c) => c.targetId === chalengerId)
            if (!chat) {
                upsertChat({ targetId: chalengerId, targetName: chalengerName })
            }

            setFocused(chalengerId)
            onReceiveChallenge(chalengerId)
            addMessage({
                message: {
                    createdAd: Date.now(),
                    senderName: chalengerName,
                    senderId: chalengerId,
                    text: 'Chalenge !',
                    targetId: chalengerId

                }, targetId: chalengerId
            })

        }

        socket.on('chalenge', onChalengeReceive)

        return () => {
            socket.off('chalenge', onChalengeReceive)
        }

    }, [socket])

    // Chalenge Accepted

    useEffect(() => {
        if (!socket) return

        const onAcceptChalenge = (chalengeAcceptData: chalengeAcceptRedirectProps) => {
            const { chalengerId, userId: senderId } = chalengeAcceptData
            if (!userId) return


            if (userId === senderId) {
                setFocused(chalengerId)
                clearChallenge(chalengerId)
                const senderName = chats.find((c) => c.targetId === senderId)?.targetName
                const message: MessageType = {
                    createdAd: Date.now(),
                    senderId: chalengerId,
                    targetId: senderId,
                    senderName: senderName || 'Player',
                    text: 'Chalenge Accepted !'
                }
                addMessage({ message, targetId: chalengerId })
                clearChallenge(chalengerId)

            } else {
                setFocused(senderId)
                clearChallenge(senderId)
                const chat = chats.find((c) => c.targetId === senderId)
                if (!chat) return
                const message: MessageType = {
                    createdAd: Date.now(),
                    senderId: chat.targetId,
                    senderName: chat.targetName,
                    targetId: userId,
                    text: 'Chalenge Accepted !'
                }
                addMessage({ message, targetId: senderId })
                clearChallenge(senderId)

            }

        }


        socket.on('chalenge-accept-redirect', onAcceptChalenge)

        return () => {
            socket.off('chalenge-accept-redirect', onAcceptChalenge)
        }

    }, [socket])

    // Chalenge Reject
    useEffect(() => {
        if (!socket) return

        const onChalengeRejected = (chalengerId: string) => {
            const senderName = chats.find((c) => c.targetId === chalengerId)?.targetName

            addMessage({
                targetId: chalengerId,
                message: {
                    createdAd: Date.now(),
                    senderId: chalengerId,
                    targetId: chalengerId,
                    senderName: senderName || 'Player',
                    text: `Chalenge rejected !`
                }
            })
            clearChallenge(chalengerId)
        }

        socket.on('chalenge-rejected', onChalengeRejected)

        return () => {
            socket.off('chalenge-rejected', onChalengeRejected)
        }

    }, [socket])

    // Chalenge Canceled
    useEffect(() => {
        if (!socket) return

        const onChalengeCanceled = (chalengeCanceled: string) => {
            // alert('canceled')
            const senderName = chats.find((c) => c.targetId === chalengeCanceled)?.targetName

            addMessage({
                targetId: chalengeCanceled,
                message: {
                    createdAd: Date.now(),
                    senderId: chalengeCanceled,
                    targetId: chalengeCanceled,
                    senderName: senderName || 'Player',
                    text: `Chalenge canceled !`
                }
            })
            clearIsChalenged(chalengeCanceled)
        }

        socket.on('chalenge-canceled', onChalengeCanceled)

        return () => {
            socket.off('chalenge-canceled', onChalengeCanceled)
        }

    }, [socket])

    return null

}