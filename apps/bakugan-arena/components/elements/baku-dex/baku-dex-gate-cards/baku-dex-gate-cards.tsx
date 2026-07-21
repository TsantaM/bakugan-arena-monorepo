'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GateCardsList } from "@bakugan-arena/game-data"
import { useState } from "react"
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex"
import { useTranslations } from "next-intl"

export default function BakuDexGateCard() {
    const t = useTranslations('bakuDex')
    const tCommon = useTranslations('common')
    const [search, setSearch] = useState('')
    const filtered = GateCardsList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))


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
                        return <ExclusiveAbilityCardDexPreview key={index} nom={c.name} description={c.description} max={c.maxInDeck} />
                    }) : <p className="text-center">{tCommon('empty.noResult')}</p>
                }
            </CardContent>

        </Card>
    )
}
