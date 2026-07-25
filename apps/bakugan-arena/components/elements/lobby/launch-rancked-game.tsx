'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import DeckSelectValidityLabel, { isDeckPlayable } from "@/components/elements/deck-builder/deck-select-validity-label"
import { cn } from "@/lib/utils"
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data"
import { authClient } from "@/src/lib/auth-client"
import UseSearchOpponent from "@/src/sockets/search-opponent"
import { BakuganList } from "@bakugan-arena/game-data"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"

export default function LauchRanckedGate() {
    const t = useTranslations('lobby.ranked')
    const tCommon = useTranslations('common')

    const { emitPlayerData, waitingOpponent, cancelSearchOpponent } = UseSearchOpponent()
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const user = authClient.useSession()
    const id = user.data ? user.data?.user.id : ''
    const data = {
        userId: id,
        deckId: value
    }

    const getUserDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: GetUserDecks
    })

    const decks = getUserDecksQuery.data ?? []
    const selectedDeck = decks.find((d) => d.id === value)
    const selectedDeckPlayable = selectedDeck ? isDeckPlayable(selectedDeck) : false
    const selectedDeckBakugansData = BakuganList.filter((b) => selectedDeck?.bakugans.includes(b.key))
    const hasValidDeck = decks.some(isDeckPlayable)

    return (<>

        <Card>
            <CardHeader>
                <CardTitle className="text-center text-lg lg:text-2xl">
                    {t('title')}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-16">

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild className="m-auto">
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full max-w-full justify-between gap-2"
                        >
                            <span className="min-w-0 truncate text-start">
                            {selectedDeck
                                ? selectedDeck.name
                                : t('selectDeck')}
                            </span>
                            <ChevronsUpDown className="shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-75">
                        <Command>
                            <CommandList>
                                <CommandEmpty>
                                    <div className="flex flex-col items-center gap-2 p-2">
                                        <p className="text-center text-sm text-muted-foreground">{t('noValidDeckHint')}</p>
                                        <Button asChild variant='outline' className="h-auto whitespace-normal text-center"><Link href='/dashboard/deck-builder'>{t('noDeckCta')}</Link></Button>
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {decks.map((d) => {
                                        const playable = isDeckPlayable(d)
                                        return (
                                            <CommandItem
                                                key={d.id}
                                                value={d.id}
                                                disabled={!playable}
                                                onSelect={(currentValue) => {
                                                    if (!playable) return
                                                    setValue(currentValue === value ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                <DeckSelectValidityLabel deck={d} />
                                                {playable && (
                                                    <Check
                                                        className={cn(
                                                            "ms-1 shrink-0",
                                                            value === d.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                )}
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {!hasValidDeck && decks.length > 0 && (
                    <p className="text-center text-sm text-muted-foreground">{t('noValidDeckHint')}</p>
                )}

                {
                    selectedDeck && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">
                                    {selectedDeck.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap justify-center items-center gap-3 sm:gap-5">
                                {
                                    selectedDeckBakugansData.map((b, index) =>
                                        <Image key={index} alt={`${b.name} ${b.attribut}`} src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} width={95} height={95} className="size-16 sm:size-[95px]" />
                                    )
                                }
                            </CardContent>
                        </Card>
                    )
                }

            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                <Button disabled={!selectedDeckPlayable || waitingOpponent} className="w-full h-auto whitespace-normal text-xl font-bold" onClick={() => emitPlayerData({ data, deck: selectedDeck, ranked: true })}>{waitingOpponent ? t('waitingOpponent') : !value || value === '' ? t('chooseDeck') : t('startBattle')}</Button>
                <Button variant="destructive" className="w-full text-xl font-bold" onClick={() => {
                    cancelSearchOpponent(data.userId)
                    setValue('')
                }}>{tCommon('actions.cancel')}</Button>

                <div>
                    <p className="text-destructive font-bold">{t('disclaimerTitle')}</p>
                    <p className="text-sm">{t('disclaimerBody')}</p>
                    <p className="text-sm">
                        {t.rich('disclaimerDiscord', {
                            discord: (chunks) => (
                                <Link href="https://discord.gg/8HfPK5RVuk" target="_blank">
                                    {chunks}
                                </Link>
                            ),
                            active: (chunks) => <span className="font-semibold">{chunks}</span>,
                        })}
                    </p>
                </div>
            </CardFooter>
        </Card>


    </>)
}
