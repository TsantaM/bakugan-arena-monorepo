'use client'

import { authClient } from "@/src/lib/auth-client"
import { Message } from "@bakugan-arena/game-data"
import { resolveBattleMessage } from "@bakugan-arena/i18n"
import { useLocale } from "next-intl"

export function MessageParagraph({ message }: { message: Message }) {
    const username = authClient.useSession().data?.user.displayUsername
    const locale = useLocale()
    const { userName, description } = message
    const text = resolveBattleMessage(message, locale)
    const isMe = userName === username

    return (
        <div className="text-sm leading-5">
            {userName ? (
                <p>
                    <span
                        className={`font-semibold ${isMe ? "text-blue-400" : "text-emerald-400"}`}
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
