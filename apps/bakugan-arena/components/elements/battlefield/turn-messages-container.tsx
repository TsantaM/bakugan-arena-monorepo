'use client'

'use client'

import { Message } from "@bakugan-arena/game-data"
import { MessageParagraph } from "./message-paragraph"
import { useTranslations } from "next-intl"

export function TurnMessagesContainer({
    turn,
    messages,
    compact = false,
}: {
    turn: number
    messages: Message[]
    compact?: boolean
}) {
    const t = useTranslations('battlefield')

    return (
        <div className={`flex flex-col ${compact ? "gap-1" : "gap-2"}`}>
            <div className={`flex items-center gap-2 ${compact ? "my-1" : "my-2"}`}>
                <div className="flex-1 h-px bg-neutral-700" />
                <span className="text-xs text-neutral-400 font-semibold">
                    {t('turn', { turn })}
                </span>
                <div className="flex-1 h-px bg-neutral-700" />
            </div>

            <div className={`flex flex-col gap-1 ${compact ? "px-0.5" : "px-1"}`}>
                {messages.map((message, index) => (
                    <MessageParagraph message={message} key={index} />
                ))}
            </div>
        </div>
    )
}
