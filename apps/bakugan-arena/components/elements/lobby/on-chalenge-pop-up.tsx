'use client'
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chalengeAcceptSocketProps } from "@bakugan-arena/game-data/src/type/sockets-props-types";
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

export default function OnChalengePopUp() {

    const socket = useSocket()
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const user = authClient.useSession()
    const id = user.data ? user.data?.user.id : ''
    const [chalenge, setChalenge] = useState<{
        chalengerName: string,
        chalengerId: string
    } | undefined>(undefined)

    const getUserDecks = async () => {
        return await GetUserDecks()
    }

    const getUserDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: getUserDecks
    })

    const selectedDeckBakugans = getUserDecksQuery.data?.find((d) => d.id === value)?.bakugans
    const selectedDeckBakugansData = BakuganList.filter((b) => selectedDeckBakugans?.includes(b.key))


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
                    <DialogTitle>Select a deck for chalenge</DialogTitle>
                    <DialogDescription>
                        {chalenge?.chalengerName} chalenge you !
                    </DialogDescription>
                </DialogHeader>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild className="w-full">
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {getUserDecksQuery.data && value
                                ? getUserDecksQuery.data.find((d) => d.id === value)?.name
                                : "Select deck..."}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full">
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

                <DialogFooter>
                    <Button onClick={() => {
                        if (value === '') return
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

                    }}>Accept</Button>
                    <DialogClose asChild>
                        <Button variant='destructive'>Reject</Button>
                    </DialogClose>
                </DialogFooter>

            </DialogContent>
        </Dialog>


    </>)
}