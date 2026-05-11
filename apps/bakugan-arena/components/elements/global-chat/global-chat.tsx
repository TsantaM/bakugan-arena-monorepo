'use client'

import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { GlobalChatMessage, SendedMessage } from "@bakugan-arena/game-data"
import { useEffect, useMemo, useRef, useState } from "react"
import { useGlobalChatMessageStore } from "./global-chat-store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessagesSquare, Send } from "lucide-react"
import { ConnectedUsersStore } from "@/src/store/connected-users-store"

export default function GlobalChat() {

    const socket = useSocket()

    const session = authClient.useSession()
    const userData = session.data

    const userId = userData?.user.id
    const username = userData?.user.displayUsername

    const connectedUsers = ConnectedUsersStore((state) => state.users)
    const messages = useGlobalChatMessageStore((state) => state.messages)
    const setMessages = useGlobalChatMessageStore((state) => state.setMessages)
    const addMessage = useGlobalChatMessageStore((state) => state.addMessage)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [open, setOpen] = useState(false)

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    const notificationCount = useMemo(() => {

        if (!userId) return 0

        return messages.filter((message) => {
            return !message.viewers.includes(userId)
        }).length

    }, [messages, userId])

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const onSubmit = () => {

        if (!socket) return

        const text = textareaRef.current?.value || ""

        if (text.trim() === "") return

        if (!userId || !username) {
            textareaRef.current!.value = ""
            return
        }

        const message: SendedMessage = {
            text,
            userId,
            username
        }

        socket.emit('send-message-global', message)

        textareaRef.current!.value = ""
    }

    /*
    |--------------------------------------------------------------------------
    | Load messages when dialog opens
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!socket) return

        if (!open) return

        socket.emit('get-all-messages')

    }, [socket, open])

    /*
    |--------------------------------------------------------------------------
    | Socket : all messages
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!socket) return

        const handleMessages = (messages: GlobalChatMessage[]) => {
            setMessages({ messages })
        }

        socket.on('get-all-messages', handleMessages)

        return () => {
            socket.off('get-all-messages', handleMessages)
        }

    }, [socket, setMessages])

    /*
    |--------------------------------------------------------------------------
    | Socket : new message
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!socket) return

        const handleNewMessage = (message: GlobalChatMessage) => {
            addMessage({ message })
            if (open && userId) {
                socket.emit("receive-message-response", { message, userId })
            }
        }

        socket.on('new-message-global', handleNewMessage)

        return () => {
            socket.off('new-message-global', handleNewMessage)
        }

    }, [socket, addMessage, open, userId])

    /*
    |--------------------------------------------------------------------------
    | Dialog opened effect
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!open) return
        if (!userId) return
        if (!socket) return

        const messagesToUpdate = messages.filter((message) => !message.viewers.includes(userId))
        if (messagesToUpdate.length === 0) return

        socket.emit('on-open-update-messages', { userId, messagesToUpdate })
        /*
        --------------------------------------------------
        Ajoute ici ta logique :
        - marquer messages comme lus
        - envoyer viewers au serveur
        - scroll bottom
        - analytics
        etc...
        --------------------------------------------------
        */

        console.log("Dialog opened")

    }, [open, socket])

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='outline'
                    className="relative"
                >
                    <MessagesSquare />
                    {
                        notificationCount > 0 && (
                            <div className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center bg-red-500 text-white">
                                {notificationCount}
                            </div>
                        )
                    }

                </Button>

            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Global Chat
                    </DialogTitle>
                    <span className={`text-sm ${connectedUsers.length === 0 ? 'text-gray-500' : 'text-green-500'}`} >{`${connectedUsers.length} online`}</span>
                </DialogHeader>

                <ScrollArea className="h-100 overflow-y-hidden" scroll="bottom">
                    <div>
                        {
                            messages.map((m) => (

                                <p
                                    key={m.id}
                                    className={`
                                        text-sm
                                        leading-5
                                        wrap-break-words
                                    `}
                                >
                                    <span className={`font-semibold ${m.username === username ? 'text-blue-400' : 'text-emerald-500'
                                        }`}>
                                        {m.username} :
                                    </span>
                                    {" "}
                                    <span>
                                        {m.text}
                                    </span>
                                </p>
                            ))
                        }
                    </div>
                </ScrollArea>

                <div className="flex items-end gap-2 border rounded-2xl p-1 shadow-sm bg-background mt-2">
                    <Textarea
                        ref={textareaRef}
                        placeholder="Write your message..."
                        className="min-h-10 max-h-30 max-w-100 resize-none border-0 focus-visible:ring-0"
                        onKeyDown={(e) => {

                            if (e.key === "Enter" && !e.shiftKey) {

                                e.preventDefault()

                                onSubmit()
                            }
                        }}
                    />

                    <Button
                        size="icon"
                        onClick={onSubmit}
                        className="rounded-full"
                    >
                        <Send className="w-4 h-4" />
                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    )
}