'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import BakuganPreview from "../preview/bakugan-preview";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BakuganList } from "@bakugan-arena/game-data";
import { useTranslations } from "next-intl";

export default function BakuDex() {
    const t = useTranslations('bakuDex')
    const tCommon = useTranslations('common')
    const [search, setSearch] = useState('')
    const filtered = BakuganList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {t('bakugans.title')}
                </CardTitle>
                <div>
                    <Input placeholder={t('bakugans.search')} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </CardHeader>
            {
                filtered.length > 0 ? <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {
                        filtered.map((d, index) =>
                            <Link key={index} href={`/dashboard/baku-dex/bakugan?id=${d.key}`}>
                                <BakuganPreview data={d} />
                            </Link>
                        )
                    }
                </CardContent> : <CardContent className="flex items-center">
                    <p>{tCommon('empty.noResult')}</p>
                </CardContent>
            }

        </Card>
    )
}
