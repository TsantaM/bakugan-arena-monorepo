'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex";
import { useState } from "react";
import { ExclusiveAbilitiesList } from "@bakugan-arena/game-data";
import { BakuganList } from "@bakugan-arena/game-data";

export default function BakuDexExclusiveAbilityCards() {


    const [search, setSearch] = useState('')
    const filtered = ExclusiveAbilitiesList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    Ability Cards
                </CardTitle>
                <div>
                    <Input placeholder="Ability Card Name" onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>

            <CardContent className={`${filtered.length > 0 && 'grid grid-cols-1 lg:grid-cols-3 gap-3'}`}>
                {
                    filtered.length > 0 ? filtered.map((c, index) => {
                        const compatibles = BakuganList.filter((b) => b.exclusiveAbilities.includes(c.key))
                    return <ExclusiveAbilityCardDexPreview key={index} nom={c.name} description={c.description} max={c.maxInDeck} bakugan={compatibles} />
                }) : <p className="text-center">No result</p>
                }
            </CardContent>

        </Card>
    )
}