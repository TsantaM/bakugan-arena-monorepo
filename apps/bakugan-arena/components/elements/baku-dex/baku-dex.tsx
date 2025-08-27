'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import BakuganPreview from "../preview/bakugan-preview";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BakuganList } from "@bakugan-arena/game-data";

export default function BakuDex() {

    const [search, setSearch] = useState('')
    const filtered = BakuganList.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Bakugans
                    </CardTitle>
                    <div>
                        <Input placeholder="Bakugan Name" onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </CardHeader>
                {
                    filtered.length > 0 ? <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {
                            filtered.map((d, index) =>
                                <Link key={index} href={`/baku-dex/bakugan?id=${d.key}`}>
                                    <BakuganPreview data={d} />
                                </Link>
                            )
                        }
                    </CardContent> : <CardContent className="flex items-center">
                        <p>No result</p>
                    </CardContent>
                }

            </Card>
        )
    }
