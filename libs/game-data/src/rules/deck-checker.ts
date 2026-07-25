import { AbilityCardsList } from "../battle-brawlers/ability-cards.js"
import { BakuganList } from "../battle-brawlers/bakugans.js"
import { ExclusiveAbilitiesList } from "../battle-brawlers/exclusive-abilities.js"
import { GateCardsList } from "../battle-brawlers/gate-gards.js"
import type { GetDeckDataType, Rules } from "../type/type-index.js"

export type DeckCardKind = "bakugans" | "abilities" | "exclusiveAbilities" | "gates"

export type DeckIssueCode =
    | "BANNED_CARD"
    | "ILLEGAL_COMBO"
    | "OVER_LIMIT"
    | "MAX_PER_DECK"
    | "FAMILY_CONFLICT"
    | "STARTER_BAN"
    | "INCOMPLETE"

export type DeckIssueCard = {
    key: string
    kind: DeckCardKind
}

export type DeckIssue = {
    code: DeckIssueCode
    cards: DeckIssueCard[]
    meta?: {
        section?: "bakugans" | "ability" | "exclusiveAbilities" | "gateCards"
        max?: number
        min?: number
        current?: number
    }
}

export type ValidationResult = {
    valid: boolean
    issues: DeckIssue[]
    /** @deprecated Prefer `issues` — raw keys for backward compatibility */
    reasons: string[]
}

const SECTION_LIMITS = {
    bakugans: { max: 3, min: 3 },
    ability: { max: 6, min: 0 },
    exclusiveAbilities: { max: 3, min: 0 },
    gateCards: { max: 5, min: 3 },
} as const

const MIN_ABILITY_TOTAL = 3

function detectCardKind(key: string): DeckCardKind {
    if (BakuganList.some((b) => b.key === key)) return "bakugans"
    if (AbilityCardsList.some((a) => a.key === key)) return "abilities"
    if (ExclusiveAbilitiesList.some((a) => a.key === key)) return "exclusiveAbilities"
    if (GateCardsList.some((g) => g.key === key)) return "gates"
    return "abilities"
}

function toIssueCard(key: string, kind?: DeckCardKind): DeckIssueCard {
    return { key, kind: kind ?? detectCardKind(key) }
}

function countOccurrences(items: string[]): Map<string, number> {
    const counts = new Map<string, number>()
    for (const item of items) {
        counts.set(item, (counts.get(item) ?? 0) + 1)
    }
    return counts
}

export const validateDeck = (deck: GetDeckDataType, rules: Rules): ValidationResult => {
    const issues: DeckIssue[] = []

    const pool = new Set([
        ...deck.bakugans,
        ...deck.ability,
        ...deck.exclusiveAbilities,
        ...deck.gateCards,
    ])

    // -----------------------------
    // 1. BANS SIMPLES
    // -----------------------------

    const checkSimpleBan = (
        items: string[],
        bannedList: string[],
        kind: DeckCardKind,
    ) => {
        for (const item of items) {
            if (bannedList.includes(item)) {
                issues.push({
                    code: "BANNED_CARD",
                    cards: [toIssueCard(item, kind)],
                })
            }
        }
    }

    checkSimpleBan(deck.bakugans, rules.bannedBakugans, "bakugans")
    checkSimpleBan(deck.ability, rules.bannedAbilities, "abilities")
    checkSimpleBan(deck.exclusiveAbilities, rules.bannedExclusives, "exclusiveAbilities")
    checkSimpleBan(deck.gateCards, rules.bannedGates, "gates")

    // -----------------------------
    // 2. GROUP BANS (MUTUAL EXCLUSION)
    // -----------------------------

    for (const compos of rules.bannedCompos) {
        const group = [
            ...compos.bakugans.map((key) => toIssueCard(key, "bakugans")),
            ...compos.abilities.map((key) => toIssueCard(key, "abilities")),
            ...compos.exclusives.map((key) => toIssueCard(key, "exclusiveAbilities")),
            ...compos.gates.map((key) => toIssueCard(key, "gates")),
        ]

        const present = group.filter((card) => pool.has(card.key))

        if (present.length >= 2) {
            issues.push({
                code: "ILLEGAL_COMBO",
                cards: present,
            })
        }
    }

    // -----------------------------
    // 3. SECTION SIZE LIMITS
    // -----------------------------

    const sectionChecks: Array<{
        section: keyof typeof SECTION_LIMITS
        items: string[]
    }> = [
        { section: "bakugans", items: deck.bakugans },
        { section: "ability", items: deck.ability },
        { section: "exclusiveAbilities", items: deck.exclusiveAbilities },
        { section: "gateCards", items: deck.gateCards },
    ]

    for (const { section, items } of sectionChecks) {
        const { max } = SECTION_LIMITS[section]
        if (items.length > max) {
            issues.push({
                code: "OVER_LIMIT",
                cards: items.map((key) =>
                    toIssueCard(
                        key,
                        section === "bakugans"
                            ? "bakugans"
                            : section === "ability"
                              ? "abilities"
                              : section === "exclusiveAbilities"
                                ? "exclusiveAbilities"
                                : "gates",
                    ),
                ),
                meta: { section, max, current: items.length },
            })
        }
    }

    // -----------------------------
    // 4. MAX PER DECK
    // -----------------------------

    const checkMaxPerDeck = (
        items: string[],
        kind: DeckCardKind,
        getMax: (key: string) => number,
    ) => {
        for (const [key, count] of countOccurrences(items)) {
            const max = getMax(key)
            if (max > 0 && count > max) {
                issues.push({
                    code: "MAX_PER_DECK",
                    cards: [toIssueCard(key, kind)],
                    meta: { max, current: count },
                })
            }
        }
    }

    checkMaxPerDeck(
        deck.ability,
        "abilities",
        (key) => AbilityCardsList.find((a) => a.key === key)?.maxInDeck ?? 0,
    )
    checkMaxPerDeck(
        deck.exclusiveAbilities,
        "exclusiveAbilities",
        (key) => ExclusiveAbilitiesList.find((a) => a.key === key)?.maxInDeck ?? 0,
    )
    checkMaxPerDeck(
        deck.gateCards,
        "gates",
        (key) => GateCardsList.find((g) => g.key === key)?.maxInDeck ?? 0,
    )

    // -----------------------------
    // 5. FAMILY CONFLICTS
    // -----------------------------

    const families = new Map<string, string[]>()
    for (const key of deck.bakugans) {
        const bakugan = BakuganList.find((b) => b.key === key)
        if (!bakugan) continue
        const existing = families.get(bakugan.family) ?? []
        existing.push(key)
        families.set(bakugan.family, existing)
    }

    for (const keys of families.values()) {
        if (keys.length >= 2) {
            issues.push({
                code: "FAMILY_CONFLICT",
                cards: keys.map((key) => toIssueCard(key, "bakugans")),
            })
        }
    }

    // -----------------------------
    // 6. STARTER / BAKUGAN BAN LIST
    // -----------------------------

    for (const key of deck.bakugans) {
        const bakugan = BakuganList.find((b) => b.key === key)
        if (!bakugan?.banList?.length) continue

        const conflicts = deck.bakugans.filter(
            (other) => other !== key && bakugan.banList.includes(other),
        )

        if (conflicts.length > 0) {
            issues.push({
                code: "STARTER_BAN",
                cards: [key, ...conflicts].map((k) => toIssueCard(k, "bakugans")),
            })
        }
    }

    // Deduplicate starter ban pairs (A bans B and B bans A)
    const seenStarterPairs = new Set<string>()
    const dedupedIssues: DeckIssue[] = []
    for (const issue of issues) {
        if (issue.code !== "STARTER_BAN") {
            dedupedIssues.push(issue)
            continue
        }
        const pairKey = issue.cards
            .map((c) => c.key)
            .sort()
            .join("|")
        if (seenStarterPairs.has(pairKey)) continue
        seenStarterPairs.add(pairKey)
        dedupedIssues.push(issue)
    }
    issues.length = 0
    issues.push(...dedupedIssues)

    // -----------------------------
    // 7. INCOMPLETE DECK (playability)
    // -----------------------------

    if (deck.bakugans.length < SECTION_LIMITS.bakugans.min) {
        issues.push({
            code: "INCOMPLETE",
            cards: deck.bakugans.map((key) => toIssueCard(key, "bakugans")),
            meta: {
                section: "bakugans",
                min: SECTION_LIMITS.bakugans.min,
                current: deck.bakugans.length,
            },
        })
    }

    const abilityTotal = deck.ability.length + deck.exclusiveAbilities.length
    if (abilityTotal < MIN_ABILITY_TOTAL) {
        issues.push({
            code: "INCOMPLETE",
            cards: [
                ...deck.ability.map((key) => toIssueCard(key, "abilities")),
                ...deck.exclusiveAbilities.map((key) =>
                    toIssueCard(key, "exclusiveAbilities"),
                ),
            ],
            meta: {
                section: "ability",
                min: MIN_ABILITY_TOTAL,
                current: abilityTotal,
            },
        })
    }

    if (deck.gateCards.length < SECTION_LIMITS.gateCards.min) {
        issues.push({
            code: "INCOMPLETE",
            cards: deck.gateCards.map((key) => toIssueCard(key, "gates")),
            meta: {
                section: "gateCards",
                min: SECTION_LIMITS.gateCards.min,
                current: deck.gateCards.length,
            },
        })
    }

    return {
        valid: issues.length === 0,
        issues,
        reasons: issues.map((issue) => issue.code),
    }
}
