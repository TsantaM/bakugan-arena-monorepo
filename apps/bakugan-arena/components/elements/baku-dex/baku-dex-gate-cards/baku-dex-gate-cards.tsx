'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GateCardsList } from "@bakugan-arena/game-data"
import { useState } from "react"
import ExclusiveAbilityCardDexPreview from "../baku-dex-preview/exclusive-ability-card-dex"

export default function BakuDexGateCard() {
    const [search, setSearch] = useState('')
    const filtered = GateCardsList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))


    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    Gate Cards ({filtered.length})
                </CardTitle>
                <div>
                    <Input placeholder="Gate Card Name" onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>

            <CardContent className={`${filtered.length > 0 && 'grid grid-cols-1 lg:grid-cols-3 gap-3'}`}>
                {
                    filtered.length > 0 ? filtered.map((c, index) => {
                        return <ExclusiveAbilityCardDexPreview key={index} nom={c.name} description={c.description} max={c.maxInDeck} />
                    }) : <p className="text-center">No result</p>
                }
            </CardContent>

        </Card>
    )
}