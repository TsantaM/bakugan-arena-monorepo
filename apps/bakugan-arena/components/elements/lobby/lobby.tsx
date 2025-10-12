'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { authClient } from "@/src/lib/auth-client"
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data"
import { BakuganList } from "@bakugan-arena/game-data"
import UseSearchOpponent from "@/src/sockets/search-opponent"
import { Toaster } from "@/components/ui/sonner"


export default function Lobby() {

    const { emitPlayerData, waitingOpponent } = UseSearchOpponent()
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const user = authClient.useSession()
    const id = user.data ? user.data?.user.id : ''
    const data = {
        userId: id,
        deckId: value
    }

    const getUserDecks = async () => {
        return await GetUserDecks()
    }

    const getUserDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: getUserDecks,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })

    const selectedDeckBakugans = getUserDecksQuery.data?.find((d) => d.id === value)?.bakugans
    const selectedDeckBakugansData = BakuganList.filter((b) => selectedDeckBakugans?.includes(b.key))

    const deck = getUserDecksQuery.data?.find((d) => d.id === value)

    return (
        <>

            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-lg lg:text-2xl">
                        Choice a deck and launch a game
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-16">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild className="m-auto">
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[300px] justify-between"
                            >
                                {getUserDecksQuery.data && value
                                    ? getUserDecksQuery.data.find((d) => d.id === value)?.name
                                    : "Select deck..."}
                                <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[300px]">
                            <Command>
                                <CommandList>
                                    <CommandEmpty>
                                        <Button asChild variant='outline'><Link href='/dashboard/deck-builder'>No deck ! Go to deck builder</Link></Button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {getUserDecksQuery.data && getUserDecksQuery.data.map((d, index) => (
                                            <CommandItem
                                                key={index}
                                                value={d.id}
                                                onSelect={(currentValue) => {
                                                    setValue(currentValue === value ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                {d.name}
                                                <Check
                                                    className={cn(
                                                        "ml-auto",
                                                        value === d.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>


                    {
                        value && <Card>
                            <CardHeader>
                                <CardTitle className="text-center">
                                    {getUserDecksQuery.data?.find((d) => d.id === value)?.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center gap-5">
                                {
                                    selectedDeckBakugansData.map((b, index) =>
                                        <Image key={index} alt={`${b.name} ${b.attribut}`} src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} width={95} height={95} />
                                    )
                                }
                            </CardContent>
                        </Card>
                    }

                </CardContent>

                <CardFooter className="flex">
                    <Button disabled={!value || value === '' ? true : false} className="w-full text-xl font-bold" onClick={() => emitPlayerData({ data, deck })}>{waitingOpponent ? 'Waiting opponent ...' : !value || value === '' ? 'Chose a deck' : 'Start Battle !'}</Button>
                </CardFooter>
            </Card>

            <Toaster />
        </>
    )
}