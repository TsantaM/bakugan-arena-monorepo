'use client'
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chalengeAcceptSocketProps } from "@bakugan-arena/game-data";
import { useSocket } from "@/src/providers/socket-provider";
import { useEffect, useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BakuganList } from "@bakugan-arena/game-data";
import { useTranslations } from "next-intl";
import DeckSelectValidityLabel, { isDeckPlayable } from "@/components/elements/deck-builder/deck-select-validity-label";

export default function OnChalengePopUp() {
    const t = useTranslations('lobby.challenge')
    const tRanked = useTranslations('lobby.ranked')
    const tCommon = useTranslations('common')

    const socket = useSocket()
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const user = authClient.useSession()
    const [chalenge, setChalenge] = useState<{
        chalengerName: string,
        chalengerId: string
    } | undefined>(undefined)

    const getUserDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: GetUserDecks
    })

    const decks = getUserDecksQuery.data ?? []
    const selectedDeck = decks.find((d) => d.id === value)
    const selectedDeckPlayable = selectedDeck ? isDeckPlayable(selectedDeck) : false
    const selectedDeckBakugansData = BakuganList.filter((b) => selectedDeck?.bakugans.includes(b.key))

    useEffect(() => {
        if (!socket) return

        socket.on('chalenge', (chalengeData: {
            chalengerName: string;
            chalengerId: string;
        }) => {
            setChalenge(chalengeData)
        })
    }, [socket])


    return (<>

        <Dialog open={chalenge ? true : false} >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('popupTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('popupDescription', { name: chalenge?.chalengerName ?? '' })}
                    </DialogDescription>
                </DialogHeader>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild className="w-full">
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full max-w-full justify-between gap-2"
                        >
                            <span className="min-w-0 truncate text-start">
                            {selectedDeck
                                ? selectedDeck.name
                                : tRanked('selectDeck')}
                            </span>
                            <ChevronsUpDown className="shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full">
                        <Command>
                            <CommandList>
                                <CommandEmpty>
                                    <Button asChild variant='outline' className="h-auto whitespace-normal text-center"><Link href='/dashboard/deck-builder'>{tRanked('noDeckCta')}</Link></Button>
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

                {
                    selectedDeck && <Card>
                        <CardHeader>
                            <CardTitle className="text-center">
                                {selectedDeck.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap justify-center items-center gap-3 sm:gap-5">
                            {
                                selectedDeckBakugansData.map((b, index) =>
                                    <Image key={index} alt={`${b.name} ${b.attribut}`} src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} width={95} height={95} sizes="(max-width: 640px) 64px, 95px" className="size-16 sm:size-[95px]" />
                                )
                            }
                        </CardContent>
                    </Card>
                }

                <DialogFooter>
                    <Button onClick={() => {
                        if (!selectedDeckPlayable) return
                        if (!chalenge) return
                        if (!socket) return
                        const data: chalengeAcceptSocketProps = {
                            userId: user.data?.user.id,
                            deckId: value,
                            chalengerId: chalenge.chalengerId
                        }
                        socket.emit('chalenge-accept', data)
                        setChalenge(undefined)
                        setValue('')

                    }} disabled={!selectedDeckPlayable}>{tCommon('actions.accept')}</Button>
                    <DialogClose asChild>
                        <Button variant='destructive'>{tCommon('actions.reject')}</Button>
                    </DialogClose>
                </DialogFooter>

            </DialogContent>
        </Dialog>


    </>)
}
