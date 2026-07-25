'use client'

import { formatDeckIssue } from "@/components/elements/deck-builder/format-deck-issue"
import { cn } from "@/lib/utils"
import {
    BBS1Rules,
    type GetDeckDataType,
    validateDeck,
} from "@bakugan-arena/game-data"
import { CircleAlert, CircleCheck, CircleX } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

type DeckValidityBadgeProps = {
    deck: GetDeckDataType
    /** compact = icon only; inline = icon + short label; panel = full issues list */
    variant?: "compact" | "inline" | "panel"
    className?: string
}

export default function DeckValidityBadge({
    deck,
    variant = "compact",
    className,
}: DeckValidityBadgeProps) {
    const t = useTranslations("deckBuilder")
    const locale = useLocale()
    const result = validateDeck(deck, BBS1Rules)
    const issueMessages = result.issues.map((issue) =>
        formatDeckIssue(issue, locale, (key, values) => t(key, values)),
    )

    if (variant === "panel") {
        return (
            <div
                className={cn(
                    "rounded-md border p-3 text-sm",
                    result.valid
                        ? "border-green-500/40 bg-green-500/5"
                        : "border-destructive/40 bg-destructive/5",
                    className,
                )}
            >
                <div className="flex items-center gap-2 font-medium">
                    {result.valid ? (
                        <CircleCheck className="size-5 text-green-500" />
                    ) : (
                        <CircleX className="size-5 text-destructive" />
                    )}
                    <span className={result.valid ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                        {result.valid
                            ? t("checker.valid")
                            : t("checker.issuesCount", { count: result.issues.length })}
                    </span>
                </div>

                {!result.valid && (
                    <>
                        <p className="mt-2 text-muted-foreground">{t("checker.panelHint")}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            {issueMessages.map((message, index) => (
                                <li key={`${message}-${index}`}>{message}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        )
    }

    if (variant === "inline") {
        return (
            <div className={cn("flex items-center gap-1.5 text-sm", className)}>
                {result.valid ? (
                    <CircleCheck className="size-4 shrink-0 text-green-500" />
                ) : (
                    <CircleAlert className="size-4 shrink-0 text-destructive" />
                )}
                <span className={result.valid ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                    {result.valid
                        ? t("checker.valid")
                        : t("checker.issuesCount", { count: result.issues.length })}
                </span>
            </div>
        )
    }

    return result.valid ? (
        <CircleCheck className={cn("size-5 text-green-500", className)} aria-label={t("checker.valid")} />
    ) : (
        <CircleX
            className={cn("size-5 text-destructive", className)}
            aria-label={t("checker.issuesCount", { count: result.issues.length })}
        />
    )
}

export function useDeckValidation(deck: GetDeckDataType) {
    const t = useTranslations("deckBuilder")
    const locale = useLocale()
    const result = validateDeck(deck, BBS1Rules)
    const issueMessages = result.issues.map((issue) =>
        formatDeckIssue(issue, locale, (key, values) => t(key, values)),
    )
    return { ...result, issueMessages }
}
