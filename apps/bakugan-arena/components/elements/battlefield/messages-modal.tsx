'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/src/lib/auth-client"
import { useSocket } from "@/src/providers/socket-provider"
import { Message, SendMessageInGameType } from "@bakugan-arena/game-data"
import { MessagesSquare, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type messagesContainerType = {
    turn: number,
    messages: Message[]
}

function MessageParagraph({ message }: { message: Message }) {
    const username = authClient.useSession().data?.user.displayUsername
    const { userName, text, description } = message

    const isMe = userName === username

    return (
        <div className="text-sm leading-5">
            {userName ? (
                <p>
                    <span
                        className={`font-semibold ${isMe ? "text-blue-400" : "text-emerald-400"
                            }`}
                    >
                        {userName}
                    </span>
                    <span className="text-neutral-400">:</span>{" "}
                    <span className="text-neutral-200">{text}</span>
                </p>
            ) : description ? (
                <p className="text-xs text-neutral-500 italic">
                    {text}
                </p>
            ) : (
                <p className="text-neutral-300">{text}</p>
            )}
        </div>
    )
}


function TurnMessagesContainer({ turn, messages }: { turn: number, messages: Message[] }) {
    return (
        <div className="flex flex-col gap-2">
            {/* Turn separator */}
            <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-neutral-700" />
                <span className="text-xs text-neutral-400 font-semibold">
                    Turn {turn}
                </span>
                <div className="flex-1 h-px bg-neutral-700" />
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-1 px-1">
                {messages.map((message, index) => (
                    <MessageParagraph message={message} key={index} />
                ))}
            </div>
        </div>
    )
}

export default function MessagesModal({ player, opponent, roomId, userId }: { player: string | undefined | null, opponent: string | undefined | null, roomId: string, userId: string }) {

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

            return updated.sort((a, b) => a.turn - b.turn);
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

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const onSubmit = () => {
        if(!socket) return
        const text = textareaRef.current?.value || ""
        
        if (text.trim() === "") return

        const message: SendMessageInGameType = {
            roomId: roomId,
            text: text,
            userId: userId
        }

        // console.log("Message à envoyer :", text)
        socket.emit('send-message-in-game', message)

        // reset champ
        if (textareaRef.current) {
            textareaRef.current.value = ""
        }
    }

    useEffect(() => {

        if (!socket) return;

        const onInitMessage = (messages: Message[]) => {
            // On remplit le container via ta fonction
            addMessagesToContainer(messages);

        };

        // const onGameMessage = (message: Message) => {

        //     // On ajoute aussi dans le container
        //     addMessageToContainer(message);

        // };

        socket.on('init-game-messages', onInitMessage);
        // socket.on('game-messages', onGameMessage);

        return () => {
            socket.off('init-game-messages', onInitMessage);
            // socket.off('game-messages', onGameMessage);
        };

    }, [socket]);


    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // 🔒 sécurité (IMPORTANT en prod)
            if (!event.data || event.data.type !== "GAME_MESSAGE") return;

            const messages: Message[] = event.data.payload;

            console.log("Message reçu de l'iframe :", messages);

            const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
            async function showToasts(messages: Message[]) {
                for (const message of messages) {
                    if (!message.description) {
                        const text = message.userName ? `${message.userName} : ${message.text}` : message.text
                        toast.info(text)
                    }

                    addMessageToContainer(message);
                    await delay(500); // Attendre 3 secondes avant d'afficher le message suivant
                }
            }

            showToasts(messages)

            // 👉 ici tu peux déclencher ton UI
            // exemple: envoyer au store ou au modal
            // handleIncomingMessage(message);
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    useEffect(() => {
        if (!socket) return

        socket.on('new-message-in-game', addMessageToContainer)

        return () => {
            socket.off('new-message-in-game', addMessageToContainer)
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
            <ScrollArea className="h-100" scroll="bottom">

                {
                    [...messagesContainer].sort((a, b) => a.turn - b.turn).map(m => < TurnMessagesContainer messages={m.messages} turn={m.turn} key={m.turn} />)
                }
                
            </ScrollArea>

            {/* Barre d'envoi */}
            <div className="flex items-end gap-2 border rounded-2xl p-1 shadow-sm bg-background mt-2">
                <Textarea
                    ref={textareaRef}
                    placeholder="Write your message..."
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

        </DialogContent>

    </Dialog >

}
