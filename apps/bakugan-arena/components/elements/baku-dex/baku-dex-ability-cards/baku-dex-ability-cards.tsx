'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex";
import { Input } from "@/components/ui/input";
import { AbilityCardsList } from "@bakugan-arena/game-data";
import { useTranslations } from "next-intl";

export default function BakuDexAbilityCards() {
    const t = useTranslations('bakuDex')
    const tCommon = useTranslations('common')
    const [search, setSearch] = useState('')
    const filtered = AbilityCardsList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    {t('abilityCards.title')}
                </CardTitle>
                <div>
                    <Input placeholder={t('abilityCards.search')} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>

            <CardContent className={`${filtered.length > 0 && 'grid grid-cols-1 lg:grid-cols-3 gap-3'}`}>
                {
                    filtered.length > 0 ? filtered.map((c, index) => <ExclusiveAbilityCardDexPreview key={index} nom={c.name} description={c.description} attribut={c.attribut} max={c.maxInDeck} />) : <p className="text-center">{tCommon('empty.noResult')}</p>
                }
            </CardContent>

        </Card>
    )
}
