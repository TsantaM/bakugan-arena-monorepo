'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data";
import { FindUser } from "@/src/actions/get-users-data";
import { authClient } from "@/src/lib/auth-client";
import { useSocket } from "@/src/providers/socket-provider";
import { BakuganList } from "@bakugan-arena/game-data";
import { chalengeSomeoneSocketProps } from "@bakugan-arena/game-data";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ChalengeSomeone() {
    const socket = useSocket()
    const [displayUserName, setDisplayUserName] = useState('')
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const user = authClient.useSession()
    const id = user.data ? user.data?.user.id : ''

    const getUserDecks = async () => {
        return await GetUserDecks()
    }

    const findUserClientSide = async () => {
        return await FindUser({ displayUserName })
    }
    const getUserDecksQuery = useQuery({
        queryKey: ['get-user-decks'],
        queryFn: getUserDecks
    })

    const findUser = useQuery({
        queryKey: ['find-user-deck', displayUserName],
        queryFn: findUserClientSide
    })

    const challengeSomeone = ({ targetId }: { targetId: string }) => {
        if (!socket) return
        if (value === "") {
            toast('Select a deck first to challenge someone')
            return
        }

        const data: chalengeSomeoneSocketProps = {
            userId: id,
            deckId: value,
            targetId: targetId,
            chalengerName: user.data?.user.displayUsername || ''
        }

        socket.emit('chalenge-someone', data)

    }

    const selectedDeckBakugans = getUserDecksQuery.data?.find((d) => d.id === value)?.bakugans
    const selectedDeckBakugansData = BakuganList.filter((b) => selectedDeckBakugans?.includes(b.key))
    const users = findUser?.data?.map((d) => d)

    return (<>

        <Dialog onOpenChange={() => setValue('')}>
            <DialogTrigger asChild>
                <Button className="w-full">Chalenge someone</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    Find user for chalenge
                </DialogTitle>
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

                <Input placeholder="Find a user to chaleng" onChange={(e) => setDisplayUserName(e.target.value)} value={displayUserName} />
                <div className='flex flex-col justify-center items-center gap-2 '>
                    {
                        users && users.length > 0 && users.map((u, index) => (
                            <div key={index} className='flex justify-between items-center w-[95%]'>
                                <p className="text-sm">{u.displayUsername}</p>
                                <Button onClick={() => challengeSomeone({ targetId: u.id })} >Challenge</Button>
                            </div>
                        ))
                    }
                </div>

            </DialogContent>
        </Dialog>


    </>)


}