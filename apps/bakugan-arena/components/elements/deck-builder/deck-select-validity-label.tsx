'use client'

import { cn } from "@/lib/utils"
import { BBS1Rules, validateDeck, type GetDeckDataType } from "@bakugan-arena/game-data"
import { CircleAlert, CircleCheck } from "lucide-react"
import { useTranslations } from "next-intl"

type DeckSelectValidityProps = {
    deck: GetDeckDataType
    className?: string
}

export default function DeckSelectValidityLabel({
    deck,
    className,
}: DeckSelectValidityProps) {
    const tRanked = useTranslations("lobby.ranked")
    const valid = validateDeck(deck, BBS1Rules).valid

    return (
        <div className={cn("flex w-full items-center gap-2", !valid && "opacity-60", className)}>
            <span className="truncate">{deck.name}</span>
            {valid ? (
                <CircleCheck className="ms-auto size-4 shrink-0 text-green-500" />
            ) : (
                <span className="ms-auto flex shrink-0 items-center gap-1 text-destructive">
                    <CircleAlert className="size-4" />
                    <span className="text-xs">{tRanked("invalidDeck")}</span>
                </span>
            )}
        </div>
    )
}

export function isDeckPlayable(deck: GetDeckDataType): boolean {
    return validateDeck(deck, BBS1Rules).valid
}
