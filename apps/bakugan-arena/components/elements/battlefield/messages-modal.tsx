'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useSocket } from "@/src/providers/socket-provider"
import { Message, SendMessageInGameType } from "@bakugan-arena/game-data"
import { MessagesSquare, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BattleLogPanel, type BattleLogTurn } from "./battle-log-panel"
import { TurnMessagesContainer } from "./turn-messages-container"
import { useTranslations } from "next-intl"

const LOG_HIDE_DELAY_MS = 1800

function mergeMessagesIntoTurns(
    prev: BattleLogTurn[],
    messages: Message[]
): BattleLogTurn[] {
    let updated = [...prev]

    messages.forEach((msg) => {
        const index = updated.findIndex((c) => c.turn === msg.turn)

        if (index !== -1) {
            const exists = updated[index].messages.some(
                (m) => JSON.stringify(m) === JSON.stringify(msg)
            )
            if (!exists) {
                updated[index] = {
                    ...updated[index],
                    messages: [...updated[index].messages, msg],
                }
            }
        } else {
            updated.push({
                turn: msg.turn,
                messages: [msg],
            })
        }
    })

    return updated.sort((a, b) => a.turn - b.turn)
}

export default function MessagesModal({
    player,
    opponent,
    roomId,
    userId,
    isReplay = false,
    battleLogEnabled = true,
    embedded = false,
}: {
    player: string | undefined | null
    opponent: string | undefined | null
    roomId: string
    userId: string
    isReplay?: boolean
    battleLogEnabled?: boolean
    embedded?: boolean
}) {
    const t = useTranslations('battlefield')
    const tCommon = useTranslations('common')
    const [messagesContainer, setMessagesContainer] = useState<BattleLogTurn[]>([])
    const [liveLogTurns, setLiveLogTurns] = useState<BattleLogTurn[]>([])
    const [isLogVisible, setIsLogVisible] = useState(false)
    const [battleLogRoot, setBattleLogRoot] = useState<Element | null>(null)
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const battleLogEnabledRef = useRef(battleLogEnabled)
    const socket = useSocket()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (!embedded) {
            setBattleLogRoot(null)
            return
        }
        setBattleLogRoot(document.querySelector("[data-battlefield-root]"))
    }, [embedded])

    useEffect(() => {
        battleLogEnabledRef.current = battleLogEnabled
        if (!battleLogEnabled) {
            clearHideTimeout()
            setIsLogVisible(false)
            setLiveLogTurns([])
        }
    }, [battleLogEnabled])

    const clearHideTimeout = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
        }
    }

    const showBattleLog = () => {
        if (!battleLogEnabledRef.current) return
        clearHideTimeout()
        setIsLogVisible(true)
    }

    const scheduleHideBattleLog = () => {
        if (!battleLogEnabledRef.current) return
        clearHideTimeout()
        hideTimeoutRef.current = setTimeout(() => {
            setIsLogVisible(false)
            setLiveLogTurns([])
            hideTimeoutRef.current = null
        }, LOG_HIDE_DELAY_MS)
    }

    const addMessagesToContainer = (messages: Message[]) => {
        setMessagesContainer((prev) => mergeMessagesIntoTurns(prev, messages))
    }

    const addMessagesToLiveLog = (messages: Message[]) => {
        setLiveLogTurns((prev) => mergeMessagesIntoTurns(prev, messages))
    }

    const addMessageToContainer = (message: Message) => {
        addMessagesToContainer([message])
    }

    const onSubmit = () => {
        if (!socket) return
        const text = textareaRef.current?.value || ""

        if (text.trim() === "") return

        const message: SendMessageInGameType = {
            roomId: roomId,
            text: text,
            userId: userId,
        }

        socket.emit("send-message-in-game", message)

        if (textareaRef.current) {
            textareaRef.current.value = ""
        }
    }

    useEffect(() => {
        if (!socket) return

        const onInitMessage = (messages: Message[]) => {
            addMessagesToContainer(messages)
        }

        socket.on("init-game-messages", onInitMessage)

        return () => {
            socket.off("init-game-messages", onInitMessage)
        }
    }, [socket])

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data?.type) return

            if (event.data.type === "GAME_MESSAGE") {
                const messages: Message[] = event.data.payload ?? []
                if (!Array.isArray(messages) || messages.length === 0) return

                addMessagesToContainer(messages)

                if (battleLogEnabledRef.current) {
                    showBattleLog()
                    addMessagesToLiveLog(messages)
                }
                return
            }

            if (
                event.data.type === "GAME_TURN_END" ||
                event.data.type === "GAME_ANIMATIONS_DONE"
            ) {
                scheduleHideBattleLog()
            }
        }

        window.addEventListener("message", handleMessage)

        return () => {
            window.removeEventListener("message", handleMessage)
            clearHideTimeout()
        }
    }, [])

    useEffect(() => {
        if (!socket) return

        socket.on("new-message-in-game", addMessageToContainer)

        return () => {
            socket.off("new-message-in-game", addMessageToContainer)
        }
    }, [socket])

    return (
        <>
            {(() => {
                const battleLog = (
                    <BattleLogPanel
                        turns={liveLogTurns}
                        visible={battleLogEnabled && isLogVisible}
                    />
                )

                if (embedded && battleLogRoot) {
                    return createPortal(battleLog, battleLogRoot)
                }

                return battleLog
            })()}

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        aria-label={t('messages.aria')}
                        className={
                            embedded
                                ? undefined
                                : !isReplay
                                    ? "absolute bottom-2 left-[50%] z-30 translate-x-[-50%]"
                                    : "absolute bottom-2 left-[calc(50%-9.5rem)] z-30"
                        }
                    >
                        <MessagesSquare />
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tCommon('labels.vs', { p1: player ?? '', p2: opponent ?? '' })}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-100" scroll="bottom">
                        {[...messagesContainer]
                            .sort((a, b) => a.turn - b.turn)
                            .map((m) => (
                                <TurnMessagesContainer
                                    messages={m.messages}
                                    turn={m.turn}
                                    key={m.turn}
                                />
                            ))}
                    </ScrollArea>

                    {!isReplay && (
                        <div className="flex items-end gap-2 border rounded-2xl p-1 shadow-sm bg-background mt-2">
                            <Textarea
                                ref={textareaRef}
                                placeholder={tCommon('placeholders.writeMessage')}
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
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
