'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import { useChatStore } from "../store/chat-window-store"
import { ReceiveMessageSocketType, SendMessageSocketType } from "@bakugan-arena/game-data"
import { authClient } from "../lib/auth-client"

export default function useChat() {

    const socket = useSocket()
    const userId = authClient.useSession().data?.user.id

    const { addMessage, upsertChat, chats } = useChatStore()
    const sendMessage = ({ targetId, message, username, senderId, targetName }: SendMessageSocketType) => {
        if (!socket) return
        socket.emit('chat-message', { targetId, message, username, senderId, targetName })
    }

    useEffect(() => {

        if (!socket) return

        socket.on('receive-message', ({ targetId, targetName, message }: ReceiveMessageSocketType) => {

            if (userId === message.senderId) {
                const chat = chats.find((c) => c.targetId === message.targetId)
                if (!chat) {
                    upsertChat({ targetId: targetId, targetName: targetName })
                }

                addMessage({ targetId: message.targetId, message })

            } else {
                const chat = chats.find((c) => c.targetId === message.senderId)
                if (!chat) {
                    upsertChat({ targetId: message.senderId, targetName: message.senderName })
                }
                addMessage({ targetId: message.senderId, message })
            }


        })


    }, [socket])

    return {
        sendMessage
    }
}