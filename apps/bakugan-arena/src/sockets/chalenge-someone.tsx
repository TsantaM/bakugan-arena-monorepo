'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import { chalengeAcceptRedirectProps, MessageType } from "@bakugan-arena/game-data"
import { authClient } from "../lib/auth-client"
import { useChatStore } from "../store/chat-window-store"

export default function ChalengeSomeone() {

    const { clearChallenge, chats, addMessage, onReceiveChallenge, upsertChat, setFocused } = useChatStore()
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
                    senderId: chalengerId,
                    senderName: chalengerName,
                    text: 'Chalenge you !',
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
                const message: MessageType = {
                    createdAd: Date.now(),
                    senderId: chalengerId,
                    senderName: username || 'Player',
                    targetId: senderId,
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

    return null

}