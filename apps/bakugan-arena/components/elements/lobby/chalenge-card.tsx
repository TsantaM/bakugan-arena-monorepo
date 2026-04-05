'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/src/store/chat-window-store"
import { BakuganList, chalengeAcceptSocketProps, chalengeSomeoneSocketProps } from "@bakugan-arena/game-data"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data"
import Link from "next/link"
import Image from "next/image"
import { useSocket } from "@/src/providers/socket-provider"
import { authClient } from "@/src/lib/auth-client"

export default function ChalengeCard({ chalenge, targetId, isChalenged }: {
    chalenge: null | {
        deck: string | undefined,
        waitingForResponse: boolean
    },
    targetId: string,
    isChalenged: null | {
        deck: string | undefined
        waitingForResponse: boolean
    }
}) {

    const username = authClient.useSession().data?.user.displayUsername
    const userId = authClient.useSession().data?.user.id
    const socket = useSocket()
    const toggleDeck = useChatStore((state) => state.toggleDeck)
    const clearIsChalenged = useChatStore((state) => state.clearIsChalenged)
    const toggleDeckInIsChalenged = useChatStore((state) => state.toggleDeckInIsChalenged)
    const setWaiting = useChatStore((state) => state.setWaiting)
    const [open, setOpen] = useState(false)
    const [show, setShow] = useState(false)
    const getUserDecks = async () => {
        return await GetUserDecks()
    }

    const getUserDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: getUserDecks
    })

    const selectedDeckBakugans = getUserDecksQuery.data?.find((d) => d.id === chalenge?.deck)?.bakugans
    const selectedDeckBakugansData = BakuganList.filter((b) => selectedDeckBakugans?.includes(b.key))

    const sendChalenge: () => void = () => {
        if (!socket) return
        if (!chalenge?.deck) return
        if (!userId) return
        const data: chalengeSomeoneSocketProps = {
            userId: userId,
            chalengerName: username || 'Player Name',
            deckId: chalenge.deck,
            targetId: targetId
        }
        socket.emit('chalenge-someone', data)
        setWaiting(targetId, true)
    }

    const acceptChalenge: () => void = () => {
        if (!socket) return
        if (!isChalenged) return
        if (!isChalenged?.deck) return
        if (!userId) return

        const data: chalengeAcceptSocketProps = {
            chalengerId: targetId,
            deckId: isChalenged.deck,
            userId: userId
        }

        socket.emit('chalenge-accept', data)
        clearIsChalenged(targetId)

    }

    return (
        <>

            {
                isChalenged !== null ? <Card>
                    <CardContent className="flex flex-col gap-3">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild className="m-auto">
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {getUserDecksQuery.data && isChalenged?.deck
                                        ? getUserDecksQuery.data.find((d) => d.id === isChalenged.deck)?.name
                                        : "Select deck..."}
                                    <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-75">
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
                                                        toggleDeckInIsChalenged(targetId, currentValue)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    {d.name}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto",
                                                            isChalenged?.deck === d.id ? "opacity-100" : "opacity-0"
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
                            isChalenged?.deck && <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        {getUserDecksQuery.data?.find((d) => d.id === isChalenged?.deck)?.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-center items-center gap-5">
                                    {
                                        getUserDecksQuery.data
                                            ?.find((d) => d.id === isChalenged?.deck)
                                            ?.bakugans.map((b, index) => {
                                                const bakugan = BakuganList.find((ba) => ba.key === b);

                                                if (!bakugan) return null;

                                                return (
                                                    <Image
                                                        key={index}
                                                        alt={`${bakugan.name} ${bakugan.attribut}`}
                                                        src={`/images/bakugans/sphere/${bakugan.image}/${bakugan.attribut.toUpperCase()}.png`}
                                                        width={50}
                                                        height={50}
                                                    />
                                                );
                                            })
                                    }
                                </CardContent>
                            </Card>
                        }

                    </CardContent>

                    <CardFooter className="flex justify-end gap-1">
                        <Button disabled={!isChalenged?.deck ? true : false} className="font-bold" onClick={acceptChalenge}>
                            {!isChalenged?.deck ? 'Chose a deck' : 'Accept'}
                        </Button>
                        <Button variant="destructive" className="font-bold" >Reject</Button>
                    </CardFooter>
                </Card> :
                    !show ? <Button variant="outline" className="w-full" onClick={() => setShow(true)}>Chalenge</Button> : <Card>
                        <CardContent className="flex flex-col gap-3">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild className="m-auto">
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {getUserDecksQuery.data && chalenge?.deck
                                            ? getUserDecksQuery.data.find((d) => d.id === chalenge.deck)?.name
                                            : "Select deck..."}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-75">
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
                                                            toggleDeck(targetId, currentValue)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        {d.name}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                chalenge?.deck === d.id ? "opacity-100" : "opacity-0"
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
                                chalenge?.deck && <Card>
                                    <CardHeader>
                                        <CardTitle className="text-center">
                                            {getUserDecksQuery.data?.find((d) => d.id === chalenge.deck)?.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex justify-center items-center gap-5">
                                        {
                                            selectedDeckBakugansData.map((b, index) =>
                                                <Image key={index} alt={`${b.name} ${b.attribut}`} src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} width={50} height={50} />
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            }

                        </CardContent>

                        <CardFooter className="flex justify-end gap-1">
                            <Button disabled={!chalenge?.deck || chalenge?.waitingForResponse ? true : false} className="font-bold" onClick={sendChalenge}>
                                {chalenge?.waitingForResponse ? 'Waiting response...' : !chalenge?.deck ? 'Chose a deck' : 'Challenge'}
                            </Button>
                            <Button variant="destructive" className="font-bold" onClick={() => { setShow(false) }} >Cancel</Button>
                        </CardFooter>
                    </Card>
            }

        </>
    )
}