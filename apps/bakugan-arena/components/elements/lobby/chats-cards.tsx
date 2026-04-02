'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/src/lib/auth-client"
import useChat from "@/src/sockets/useChat"
import { ChatWindowType, useChatStore } from "@/src/store/chat-window-store"
import { MessageType } from "@bakugan-arena/game-data"
import { Send } from "lucide-react"
import { useRef } from "react"


function ChatWindow({ chat }: { chat: ChatWindowType }) {

    const username = authClient.useSession().data?.user.displayUsername
    const userId = authClient.useSession().data?.user.id
    const { sendMessage } = useChat()
    const { messages, targetId, targetName } = chat

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const onSubmit = () => {
        const text = textareaRef.current?.value || ""

        if (text.trim() === "") return
        if (!userId || !username) return

        const message: MessageType = {
            createdAd: Date.now(),
            senderName: username,
            text: text,
            senderId: userId,
            targetId: targetId
        }

        sendMessage({
            message,
            senderId: userId,
            targetId,
            targetName,
            username
        })

        // reset champ
        if (textareaRef.current) {
            textareaRef.current.value = ""
        }
    }

    const textColor: (name: string) => string = (name) => {
        if(name === username) {
            return 'text-blue-500'
        } else {
            return 'text-emerald-500'
        }
    }

    return (
        <Card className="flex flex-col h-full w-full">
            <CardContent className="flex flex-col gap-4 h-full p-4 w-full">
                {/* Messages */}
                <Card className="w-full">
                    <CardContent>
                        <ScrollArea scroll="bottom" className="max-h-36 flex flex-col justify-center items-start gap-1 w-full">
                            {messages.length > 0 ? messages.map((message, index) => (
                                <p key={index} className="text-sm">
                                    <span className={`font-bold ${textColor(message.senderName)}`}>{message.senderName}</span>: {message.text}
                                </p>
                            )) : <p className="text-sm text-muted-foreground">No messages yet.</p>}
                        </ScrollArea>
                    </CardContent>
                </Card>
                {/* Barre d'envoi */}
                <div className="flex items-end gap-2 border rounded-2xl p-2 shadow-sm bg-background">
                    <Textarea
                        ref={textareaRef}
                        placeholder="Écris ton message..."
                        className="min-h-10 max-h-30 resize-none border-0 focus-visible:ring-0"
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

            </CardContent>
        </Card>
    )
}

export default function ChatsCard() {

    const chats = useChatStore((state) => state.chats)
    if (chats.length > 0) return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center text-lg lg:text-2xl">
                    Chats
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs className="w-100">
                    <TabsList>
                        {chats.map((chat) => (
                            <TabsTrigger key={chat.targetId} value={chat.targetId}>
                                {chat.targetName}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {chats.map((chat) => (
                        <TabsContent key={chat.targetId} value={chat.targetId} className="w-full">
                            <ChatWindow chat={chat} />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}

