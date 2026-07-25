import { BakuganList, type DeckIssue, type DeckIssueCard } from "@bakugan-arena/game-data"
import {
    resolveAbilityCard,
    resolveGameDataName,
    resolveGateCard,
} from "@bakugan-arena/i18n"

export function resolveDeckIssueCardName(card: DeckIssueCard, locale: string): string {
    if (card.kind === "bakugans") {
        const bakugan = BakuganList.find((b) => b.key === card.key)
        return resolveGameDataName(
            "bakugans",
            card.key,
            locale,
            bakugan?.name ?? card.key,
        )
    }

    if (card.kind === "gates") {
        return resolveGateCard(card.key, locale).name
    }

    // abilities + exclusiveAbilities
    return resolveAbilityCard(card.key, locale).name
}

export function formatDeckIssue(
    issue: DeckIssue,
    locale: string,
    t: (key: string, values?: Record<string, string | number>) => string,
): string {
    const names = issue.cards.map((card) => resolveDeckIssueCardName(card, locale))
    const cards = names.join(" + ")

    switch (issue.code) {
        case "BANNED_CARD":
            return t("checker.issues.banned", { card: names[0] ?? "" })
        case "ILLEGAL_COMBO":
            return t("checker.issues.illegalCombo", { cards })
        case "OVER_LIMIT":
            return t("checker.issues.overLimit", {
                section: t(`checker.sections.${issue.meta?.section ?? "bakugans"}`),
                current: issue.meta?.current ?? 0,
                max: issue.meta?.max ?? 0,
            })
        case "MAX_PER_DECK":
            return t("checker.issues.maxPerDeck", {
                card: names[0] ?? "",
                current: issue.meta?.current ?? 0,
                max: issue.meta?.max ?? 0,
            })
        case "FAMILY_CONFLICT":
            return t("checker.issues.familyConflict", { cards })
        case "STARTER_BAN":
            return t("checker.issues.starterBan", { cards })
        case "INCOMPLETE":
            return t("checker.issues.incomplete", {
                section: t(`checker.sections.${issue.meta?.section ?? "bakugans"}`),
                current: issue.meta?.current ?? 0,
                min: issue.meta?.min ?? 0,
            })
        default:
            return cards
    }
}

export function getProblemCardKeys(issues: DeckIssue[]): Set<string> {
    const highlightCodes = new Set([
        "BANNED_CARD",
        "ILLEGAL_COMBO",
        "MAX_PER_DECK",
        "FAMILY_CONFLICT",
        "STARTER_BAN",
    ])

    return new Set(
        issues
            .filter((issue) => highlightCodes.has(issue.code))
            .flatMap((issue) => issue.cards.map((c) => c.key)),
    )
}
