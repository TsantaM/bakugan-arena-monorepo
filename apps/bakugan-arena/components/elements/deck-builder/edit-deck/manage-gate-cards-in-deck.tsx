'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { GateCardPreviewDeckEditor } from "./cards-preview-deck-editor"
import { useState } from "react"
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
import { toast } from "sonner"
import { AddGateCardToDeck } from "@/src/actions/deck-builder/edit-deck-action"
import { GateCardsList } from "@bakugan-arena/game-data"
import { BakuganList } from "@bakugan-arena/game-data"

export default function ManageGateCardsInDeckEditor({ deckId, gateCards, bakugans }: { deckId: string, gateCards: string[], bakugans: string[] }) {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const queryClient = useQueryClient()

    const deckCards = gateCards ? gateCards?.map((c) => GateCardsList.find(card => card.key === c)) : []
    const cardInDeck = GateCardsList.filter((c) => gateCards.includes(c.key))

    const bakugansAttribut = BakuganList.filter((b) => bakugans.includes(b.key)).map((a) => a.attribut)
    const bakugansFamilies = BakuganList.filter((b) => bakugans.includes(b.key)).map((a) => a.family)
    const familiesGateCards = GateCardsList.filter((c) => bakugansFamilies.includes(c.family ? c.family : '')).filter((c) => {
        const exemplary = cardInDeck.filter((a) => c.key === a.key).length
        return c.maxInDeck > exemplary
    })
    console.log(familiesGateCards)
    const notInDeckCards = [GateCardsList.filter((c) => c.attribut ? bakugansAttribut.includes(c.attribut) : c).filter((c) => !c.family).filter((c) => {
        const exemplary = cardInDeck.filter((a) => c.key === a.key).length

        return c.maxInDeck > exemplary
    }), familiesGateCards].flat()

    const addGateToDeck = async (cardId: string) => {
        return await AddGateCardToDeck({ cardId, deckId })
    }


    const addGateToDeckMutation = useMutation({
        mutationKey: ['add-gate-to-deck'],
        mutationFn: addGateToDeck,
        onSuccess: () => {
            toast.success('New get as been added successfuly')
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
            setValue('')
        }
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle>
                            Gate Cards
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <p>{gateCards.length} / 5</p>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-[200px] lg:w-[300px] justify-between"
                                        disabled={addGateToDeckMutation.isPending || gateCards.length === 5 ? true : false}
                                    >
                                        {value ? (
                                            (() => {
                                                const selectedCard = notInDeckCards.find(
                                                    (b) => b.name === value
                                                )

                                                if (!selectedCard) return "Select gate Cards..."

                                                const { name } = selectedCard

                                                return (
                                                    <>
                                                        {`${name}`}
                                                    </>
                                                )
                                            })()
                                        ) : (
                                            "Select Gate Card..."
                                        )}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] lg:w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Bakugan..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No card found.</CommandEmpty>
                                            <CommandGroup>
                                                {notInDeckCards.map((b, index) => (
                                                    <CommandItem
                                                        key={index}
                                                        value={b.name}
                                                        onSelect={(currentValue) => {
                                                            setValue(currentValue === value ? "" : currentValue)
                                                            setOpen(false)
                                                            addGateToDeckMutation.mutate(b.key)
                                                        }}
                                                    >
                                                        {b.name}
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


                <CardContent className={deckCards && deckCards.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}>
                    {
                        deckCards && deckCards.length > 0 ? deckCards.map((b, index) => <GateCardPreviewDeckEditor key={index} id={b ? b.key : ''} nom={b ? b.name : ''} deckId={deckId} description={b ? b.description : ''} />)

                            : <p className='text-center'>No Gate Card in the deck</p>
                    }
                </CardContent>
            </Card>


        </>
    )
}