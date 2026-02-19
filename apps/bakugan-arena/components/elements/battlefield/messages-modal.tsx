'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSocket } from "@/src/providers/socket-provider"
import { Message } from "@bakugan-arena/game-data"
import { MessagesSquare } from "lucide-react"
import { useEffect, useState } from "react"

export default function MessagesModal({ player, opponent }: { player: string | undefined | null, opponent: string | undefined | null }) {

    const [messages, setMessages] = useState<Message[]>([])
    const socket = useSocket()

    useEffect(() => {

        if (!socket) return

        const onInitMessage = (messages: Message[]) => { setMessages(messages) }
        const onGameMessage = (message: Message) => {
            setMessages(prev => [...prev, message])
        }

        socket.on('init-game-messages', onInitMessage)
        socket.on('game-messages', onGameMessage)

        return () => {
            socket.off('init-game-messages', onInitMessage)
            socket.off('game-messages', onGameMessage)
        }

    }, [socket])


    return <Dialog>

        <DialogTrigger asChild>
            <Button variant='outline' className="absolute bottom-2 left-[50%] translate-x-[-50%]">
                <MessagesSquare />
            </Button>
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>{`${player} VS ${opponent}`}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-100">
                <div className="p-4 flex flex-col">
                    {
                        messages.map((message, index) => <p key={index} className="text-sm">
                            {
                                message.userName ? <>
                                    <span>{`${message.userName}`}</span> : {message.text}
                                </>
                                    : message.text
                            }
                        </p>)
                    }
                </div>
            </ScrollArea>
        </DialogContent>

    </Dialog>

}