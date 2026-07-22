'use client'

import { authClient } from "@/src/lib/auth-client"
import { useTextDirProps } from "@/hooks/use-text-direction"
import { Message } from "@bakugan-arena/game-data"
import { resolveBattleMessage } from "@bakugan-arena/i18n"
import { useLocale } from "next-intl"

export function MessageParagraph({ message }: { message: Message }) {
    const username = authClient.useSession().data?.user.displayUsername
    const locale = useLocale()
    const textDir = useTextDirProps()
    const { userName, description } = message
    const text = resolveBattleMessage(message, locale)
    const isMe = userName === username

    return (
        <div className="text-sm leading-5">
            {userName ? (
                <p {...textDir}>
                    <span
                        className={`font-semibold ${isMe ? "text-blue-400" : "text-emerald-400"}`}
                    >
                        {userName}
                    </span>
                    <span className="text-neutral-400">:</span>{" "}
                    <span className="text-neutral-200">{text}</span>
                </p>
            ) : description ? (
                <p className="text-xs text-neutral-500 italic" {...textDir}>
                    {text}
                </p>
            ) : (
                <p className="text-neutral-300" {...textDir}>{text}</p>
            )}
        </div>
    )
}
