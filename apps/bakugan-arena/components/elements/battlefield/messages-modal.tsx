'use client'

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
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

            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={t('messages.aria')}
                        className={
                            embedded
                                ? "shrink-0"
                                : !isReplay
                                    ? "absolute bottom-2 left-[50%] z-30 shrink-0 translate-x-[-50%]"
                                    : "absolute bottom-2 left-[calc(50%-9.5rem)] z-30 shrink-0"
                        }
                    >
                        <MessagesSquare />
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b pr-12 text-left">
                        <SheetTitle className="truncate">
                            {tCommon('labels.vs', { p1: player ?? '', p2: opponent ?? '' })}
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className="min-h-0 flex-1 px-4" scroll="bottom">
                        <div className="flex flex-col gap-2 py-2">
                            {[...messagesContainer]
                                .sort((a, b) => a.turn - b.turn)
                                .map((m) => (
                                    <TurnMessagesContainer
                                        messages={m.messages}
                                        turn={m.turn}
                                        key={m.turn}
                                    />
                                ))}
                        </div>
                    </ScrollArea>

                    {!isReplay && (
                        <SheetFooter className="border-t">
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
                        </SheetFooter>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
