'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSocket } from "@/src/providers/socket-provider"
import { Message } from "@bakugan-arena/game-data"
import { MessagesSquare } from "lucide-react"
import { useEffect, useState } from "react"

function MessageParagraph({ message }: { message: Message }) {

    const { userName, text, description } = message

    return (

        userName !== undefined ? <p>
            <span className={`font-bold`}>{userName} :</span> {text}
        </p>

            : description ? <p className="mb-1 ml-3 text-xs text-neutral-400">{text}</p> : <p className="ml-3 text-sm">{text}</p>

    )
}

function TurnMessagesContainer({ turn, messages }: { turn: number, messages: Message[] }) {
    console.log(turn)
    console.log(messages)
    return (

        <div className="flex flex-col gap-3 bg-neutral-950 text-neutral-200 p-4">
            <div className="p-4 bg-neutral-500 w-full">
                <p className="font-bold">Turn {turn}</p>
            </div>
            

            {
                messages.map((message, index) => <  MessageParagraph message={message} key={index}/>)
            }

        </div>

    )
}

type messagesContainerType = {
    turn: number,
    messages: Message[]
}

export default function MessagesModal({ player, opponent }: { player: string | undefined | null, opponent: string | undefined | null }) {

    const [messagesContainer, setMessagesContainer] = useState<messagesContainerType[]>([])
    const socket = useSocket()

    const addMessagesToContainer = (messages: Message[]) => {
        setMessagesContainer(prev => {
            let updated = [...prev];

            messages.forEach(msg => {
                const index = updated.findIndex(c => c.turn === msg.turn);

                if (index !== -1) {
                    // Vérifie si le message existe déjà
                    const exists = updated[index].messages.some(
                        m => JSON.stringify(m) === JSON.stringify(msg)
                    );
                    if (!exists) {
                        updated[index] = {
                            ...updated[index],
                            messages: [...updated[index].messages, msg]
                        };
                    }
                } else {
                    updated.push({
                        turn: msg.turn,
                        messages: [msg]
                    });
                }
            });

            return updated;
        });
    };

    const addMessageToContainer = (message: Message) => {
        setMessagesContainer(prev => {
            const index = prev.findIndex(c => c.turn === message.turn);

            if (index !== -1) {
                const exists = prev[index].messages.some(
                    m => JSON.stringify(m) === JSON.stringify(message)
                );
                if (exists) return prev; // déjà présent, on ne fait rien

                return prev.map((c, i) =>
                    i === index
                        ? { ...c, messages: [...c.messages, message] }
                        : c
                );
            }

            // nouveau turn
            return [
                ...prev,
                { turn: message.turn, messages: [message] }
            ];
        });
    };


    useEffect(() => {

        if (!socket) return;

        const onInitMessage = (messages: Message[]) => {
            // On remplit le container via ta fonction
            addMessagesToContainer(messages);

        };

        const onGameMessage = (message: Message) => {

            // On ajoute aussi dans le container
            addMessageToContainer(message);

        };

        socket.on('init-game-messages', onInitMessage);
        socket.on('game-messages', onGameMessage);

        return () => {
            socket.off('init-game-messages', onInitMessage);
            socket.off('game-messages', onGameMessage);
        };

    }, [socket]);


    useEffect(() => { console.log(messagesContainer) }, [messagesContainer])

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

                {
                    messagesContainer.map(m => < TurnMessagesContainer messages={m.messages} turn={m.turn} key={m.turn} />)
                }
            </ScrollArea>
        </DialogContent>

    </Dialog>

}
