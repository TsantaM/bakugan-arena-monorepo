'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GateCardsList } from "@bakugan-arena/game-data"
import { resolveGateCard } from "@bakugan-arena/i18n"
import { useState } from "react"
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex"
import { useLocale, useTranslations } from "next-intl"

export default function BakuDexGateCard() {
    const t = useTranslations('bakuDex')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const [search, setSearch] = useState('')

    const cards = GateCardsList.map((c) => {
        const resolved = resolveGateCard(c.key, locale)
        return { ...c, displayName: resolved.name, displayDescription: resolved.description }
    })

    const filtered = cards.filter((d) =>
        d.displayName.toLowerCase().includes(search.toLowerCase())
        || d.key.toLowerCase().includes(search.toLowerCase())
    )


    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    {t('gateCards.title', { count: filtered.length })}
                </CardTitle>
                <div>
                    <Input placeholder={t('gateCards.search')} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>

            <CardContent className={`${filtered.length > 0 && 'grid grid-cols-1 lg:grid-cols-3 gap-3'}`}>
                {
                    filtered.length > 0 ? filtered.map((c, index) => {
                        return <ExclusiveAbilityCardDexPreview key={index} nom={c.displayName} description={c.displayDescription} max={c.maxInDeck} />
                    }) : <p className="text-center">{tCommon('empty.noResult')}</p>
                }
            </CardContent>

        </Card>
    )
}
