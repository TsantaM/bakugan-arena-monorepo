'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import Image from "next/image"
import { Toaster } from "@/components/ui/sonner"
import { BakuganList } from "@bakugan-arena/game-data"
import BakuganPreviewDeckEditor from "./bakugan-preview-deck-editor"
import { AddBakuganToDeckAction } from "@/src/actions/deck-builder/edit-deck-action"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function ManageBakugansInDeck({ deckId, bakugans }: { deckId: string, bakugans: string[] | undefined }) {

    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    const bakugansInDeck = BakuganList.filter((b) => bakugans?.includes(b.key))
    const bakuganInDeckFamilies = bakugansInDeck.map((b) => b.family)
    const bakuganInDeckBanList = bakugansInDeck.map((b) => b.banList).flat()
    const notInDeckBakugans = BakuganList.filter((b) => !bakuganInDeckFamilies.includes(b.family) && !bakuganInDeckBanList.includes(b.key))

    console.log(notInDeckBakugans)

    const addBakuganToDeck = async (bakuganId: string) => {
        console.log(bakuganId)
        await AddBakuganToDeckAction({ bakuganId, deckId })
    }

    const addBakuganToDeckMutation = useMutation({
        mutationKey: ['add-bakugan-to-deck'],
        mutationFn: addBakuganToDeck,
        onSuccess: () => {
            toast.success("Bakugan has been added to deck")
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
            setValue('')
        },
        onError: (err) => {
            console.log(err)
        }
    })

    return (

        <>
            <Card>

                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Bakugans
                        </CardTitle>
                        <div className='flex items-center gap-3'>
                            <p>{bakugans ? bakugans.length : 0} / 3</p>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-[200px] lg:w-[300px] justify-between"
                                        disabled={addBakuganToDeckMutation.isPending || bakugans?.length === 3 ? true : false}
                                    >
                                        {value ? (
                                            (() => {
                                                const selectedBakugan = BakuganList.find(
                                                    (b) => `${b.name} ${b.attribut}` === value
                                                )

                                                if (!selectedBakugan) return "Select Bakugan..."

                                                const { name, attribut, image } = selectedBakugan
                                                const imageUrl = `/images/bakugans/sphere/${image}/${attribut.toUpperCase()}.png`

                                                return (
                                                    <>
                                                        <Image src={imageUrl} alt={`${name} ${attribut}`} width={20} height={20} />
                                                        {`${name} ${attribut}`}
                                                    </>
                                                )
                                            })()
                                        ) : (
                                            "Select Bakugan..."
                                        )}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] lg:w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Bakugan..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No bakugan found.</CommandEmpty>
                                            <CommandGroup>
                                                {notInDeckBakugans.map((b, index) => (
                                                    <CommandItem
                                                        key={index}
                                                        value={`${b.name} ${b.attribut}`}
                                                        onSelect={(currentValue) => {
                                                            setValue(currentValue === value ? "" : currentValue)
                                                            setOpen(false)
                                                            addBakuganToDeckMutation.mutate(b.key)
                                                        }}
                                                    >
                                                        <Image src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} alt={`${b.name} ${b.attribut}`} width={20} height={20} />
                                                        {`${b.name} ${b.attribut}`}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                value === b.key ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                    </div>
                </CardHeader>

                <CardContent className={"grid grid-cols-1 lg:grid-cols-3 gap-3"}>
                    {
                        bakugansInDeck.map((b, index) => <BakuganPreviewDeckEditor key={index} id={b.key} attribut={b.attribut} image={b.image} nom={b.name} deckId={deckId} />)
                    }
                </CardContent>

            </Card>

            <Toaster />
        </>


    )
}