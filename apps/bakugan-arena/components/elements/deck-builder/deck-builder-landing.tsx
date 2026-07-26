'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Section from "@/components/ui/section";
import CreateDeckButton from "./create-deck-button";
import DeckPreview from "./deck-preview";
import { useQuery } from "@tanstack/react-query";
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data";
import ImportDeck from "./import-deck";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeckBuilerLanding() {
    const t = useTranslations('deckBuilder')

    const GetUsersDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: GetUserDecks,
    })

    const decks = GetUsersDecksQuery.data
    const isLoading = GetUsersDecksQuery.isPending && !decks

    return (
        <Section className="md:p-0">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <CreateDeckButton />
                        <ImportDeck />
                    </div>
                </CardHeader>
                <CardContent className={decks && decks.length > 0 ? 'grid grid-cols-1 lg:grid-cols-3 gap-3' : 'flex flex-col gap-3'}>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-xl" />
                        ))
                    ) : decks && decks.length > 0 ? (
                        decks.map((d) => <DeckPreview key={d.id} data={d} />)
                    ) : (
                        <p className="text-center">{t('empty')}</p>
                    )}
                </CardContent>
            </Card>
        </Section>
    )
}
