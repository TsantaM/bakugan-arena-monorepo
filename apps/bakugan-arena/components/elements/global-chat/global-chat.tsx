'use client'

import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { GlobalChatMessage, SendedMessage } from "@bakugan-arena/game-data"
import { useEffect, useMemo, useRef, useState } from "react"
import { useGlobalChatMessageStore } from "./global-chat-store"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessagesSquare, Send, X } from "lucide-react"
import { ConnectedUsersStore } from "@/src/store/connected-users-store"
import { useTranslations } from "next-intl"

export default function GlobalChat() {
    const t = useTranslations('lobby.globalChat')
    const tCommon = useTranslations('common')

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
    | Load messages when drawer opens
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
    | Drawer opened effect
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

    }, [open, socket, messages, userId])

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative shrink-0"
                    aria-label={t('title')}
                >
                    <MessagesSquare />
                    {notificationCount > 0 && (
                        <div className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {notificationCount}
                        </div>
                    )}
                </Button>
            </DrawerTrigger>

            <DrawerContent className="flex h-full max-h-none flex-col data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
                <DrawerHeader className="flex flex-row items-start justify-between gap-2 border-b pb-4 text-left">
                    <div className="min-w-0 flex-1">
                        <DrawerTitle>{t('title')}</DrawerTitle>
                        <DrawerDescription className={connectedUsers.length === 0 ? "text-muted-foreground" : "text-green-500"}>
                            {tCommon('status.onlineCount', { count: connectedUsers.length })}
                        </DrawerDescription>
                    </div>
                    <DrawerClose asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            aria-label={tCommon('actions.close')}
                        >
                            <X />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <ScrollArea className="min-h-0 flex-1 px-4" scroll="bottom">
                    <div className="flex flex-col gap-1 py-2">
                        {messages.map((m) => (
                            <p
                                key={m.id}
                                className="text-sm leading-5 wrap-break-words"
                            >
                                <span className={`font-semibold ${m.username === username ? 'text-blue-400' : 'text-emerald-500'}`}>
                                    {m.username} :
                                </span>
                                {" "}
                                <span>{m.text}</span>
                            </p>
                        ))}
                    </div>
                </ScrollArea>

                <DrawerFooter className="border-t pt-4">
                    <div className="flex w-full items-end gap-2 rounded-2xl border bg-background p-1 shadow-sm">
                        <Textarea
                            ref={textareaRef}
                            placeholder={tCommon('placeholders.writeMessage')}
                            className="max-h-30 min-h-10 flex-1 resize-none border-0 focus-visible:ring-0"
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
                            className="shrink-0 rounded-full"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}