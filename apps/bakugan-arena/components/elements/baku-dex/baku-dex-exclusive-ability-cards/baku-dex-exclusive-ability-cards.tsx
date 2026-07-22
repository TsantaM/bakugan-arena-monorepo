'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex";
import { useState } from "react";
import { ExclusiveAbilitiesList } from "@bakugan-arena/game-data";
import { BakuganList } from "@bakugan-arena/game-data";
import { resolveAbilityCard } from "@bakugan-arena/i18n";
import { useLocale, useTranslations } from "next-intl";

export default function BakuDexExclusiveAbilityCards() {
    const t = useTranslations('bakuDex')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const [search, setSearch] = useState('')

    const cards = ExclusiveAbilitiesList.map((c) => {
        const resolved = resolveAbilityCard(c.key, locale)
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
                    {t('exclusiveAbilityCards.title')}
                </CardTitle>
                <div>
                    <Input placeholder={t('exclusiveAbilityCards.search')} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>

            <CardContent className={`${filtered.length > 0 && 'grid grid-cols-1 lg:grid-cols-3 gap-3'}`}>
                {
                    filtered.length > 0 ? filtered.map((c, index) => {
                        const compatibles = BakuganList.filter((b) => b.exclusiveAbilities.includes(c.key))
                    return <ExclusiveAbilityCardDexPreview key={index} nom={c.displayName} description={c.displayDescription} max={c.maxInDeck} bakugan={compatibles} />
                }) : <p className="text-center">{tCommon('empty.noResult')}</p>
                }
            </CardContent>

        </Card>
    )
}
