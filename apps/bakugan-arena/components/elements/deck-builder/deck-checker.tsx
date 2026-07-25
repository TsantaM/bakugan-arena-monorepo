'use client'

import DeckValidityBadge from "@/components/elements/deck-builder/deck-validity-badge"
import { GetDeckDataType } from "@bakugan-arena/game-data"

export default function DeckChecker({ deck }: { deck: GetDeckDataType }) {
    return <DeckValidityBadge deck={deck} variant="panel" />
}
