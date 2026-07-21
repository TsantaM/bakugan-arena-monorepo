'use client'

import { TurnMessagesContainer } from "./turn-messages-container"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import type { Message } from "@bakugan-arena/game-data"
import { useTranslations } from "next-intl"

export type BattleLogTurn = {
    turn: number
    messages: Message[]
}

type BattleLogPanelProps = {
    turns: BattleLogTurn[]
    visible: boolean
    className?: string
}

export function BattleLogPanel({ turns, visible, className }: BattleLogPanelProps) {
    const t = useTranslations('battlefield')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [turns, visible])

    if (!visible) return null

    return (
        <div
            ref={scrollRef}
            className={cn(
                "absolute inset-x-0 bottom-0 z-20 w-full max-h-[35%] overflow-y-auto",
                "border-t border-white/10 bg-black/65 p-3 shadow-lg backdrop-blur-sm",
                "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
                className
            )}
            aria-live="polite"
        >
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                {t('battleLogs.heading')}
            </p>
            <div className="pr-1">
                {[...turns]
                    .sort((a, b) => a.turn - b.turn)
                    .map((turn) => (
                        <TurnMessagesContainer
                            key={turn.turn}
                            turn={turn.turn}
                            messages={turn.messages}
                            compact
                        />
                    ))}
            </div>
        </div>
    )
}
