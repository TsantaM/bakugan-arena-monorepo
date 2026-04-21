import type { GetDeckDataType, Rules } from "../type/type-index.js"

type ValidationResult = {
    valid: boolean
    reasons: string[]
}

export const validateDeck = (deck: GetDeckDataType, rules: Rules): ValidationResult => {

    const reasons: string[] = []

    const pool = new Set([
        ...deck.bakugans,
        ...deck.ability,
        ...deck.exclusiveAbilities,
        ...deck.gateCards
    ])

    // -----------------------------
    // 🔴 1. BANS SIMPLES
    // -----------------------------

    const checkSimpleBan = (
        items: string[],
        bannedList: string[],
        label: string
    ) => {
        for (const item of items) {
            if (bannedList.includes(item)) {
                reasons.push(`${item} is banned (${label})`)
            }
        }
    }

    checkSimpleBan(deck.bakugans, rules.bannedBakugans, "Bakugan")
    checkSimpleBan(deck.ability, rules.bannedAbilities, "Ability")
    checkSimpleBan(deck.exclusiveAbilities, rules.bannedExclusives, "Exclusive")
    checkSimpleBan(deck.gateCards, rules.bannedGates, "Gate")

    // -----------------------------
    // 🔴 2. GROUP BANS (MUTUAL EXCLUSION)
    // -----------------------------

    for (const compos of rules.bannedCompos) {

        const group = [
            ...compos.bakugans,
            ...compos.abilities,
            ...compos.exclusives,
            ...compos.gates
        ]

        const present: string[] = []

        for (const item of group) {
            if (pool.has(item)) {
                present.push(item)
            }

            if (present.length >= 2) break
        }

        if (present.length >= 2) {
            reasons.push(
                `Illegal combination: ${present.join(" + ")} (group conflict)`
            )
        }
    }

    // -----------------------------
    // 🔚 RESULTAT
    // -----------------------------

    return {
        valid: reasons.length === 0,
        reasons
    }
}