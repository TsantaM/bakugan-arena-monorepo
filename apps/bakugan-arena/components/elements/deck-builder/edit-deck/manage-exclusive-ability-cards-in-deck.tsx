'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ExclusiveAbilityCardPreviewDeckEditor } from "./cards-preview-deck-editor"
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
import { toast } from "sonner"
import { AddExclusiveAbilityCardToDeck } from "@/src/actions/deck-builder/edit-deck-action"
import { BakuganList } from "@bakugan-arena/game-data"
import { ExclusiveAbilitiesList } from "@bakugan-arena/game-data"

export default function ManageExclusiveAbilityCardsInDeck({ deckId, bakugans, countBakugans, exclusiveAbilities }: { deckId: string, bakugans: string[], countBakugans: number, exclusiveAbilities: string[] | undefined }) {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const queryClient = useQueryClient()

    const bakuganInDeck = BakuganList.filter((b) => bakugans.includes(b.key))
    const abilities = bakuganInDeck.map((b) => b.exclusiveAbilities).flat()
    const cardInDeck = ExclusiveAbilitiesList.filter((c) => exclusiveAbilities?.includes(c.key))
    const deckCards = exclusiveAbilities ? exclusiveAbilities?.map((c) => ExclusiveAbilitiesList.find(card => card.key === c)) : []

    const notInDeckExclusiveAbilities = ExclusiveAbilitiesList.filter((c) => abilities.includes(c.key)).filter((c) => {
        const exemplary = cardInDeck.filter((a) => a.key === c.key).length

        return exemplary < c.maxInDeck
    })


    const addCardToDeck = async (cardId: string) => {
        return await AddExclusiveAbilityCardToDeck({ cardId, deckId })
    }

    const addCardToDeckMutation = useMutation({
        mutationKey: ['add-ability-card-to-deck'],
        mutationFn: addCardToDeck,
        onSuccess: () => {
            toast.success("Ability card has been added to deck")
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
            setValue('')
        }
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Exclu. Cards</CardTitle>
                        <div className="flex items-center gap-3">
                            <p>{exclusiveAbilities ? exclusiveAbilities.length : 0} / 3</p>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-50 lg:w-75 justify-between"
                                        disabled={addCardToDeckMutation.isPending || exclusiveAbilities?.length === 3 || countBakugans === 0 ? true : false}
                                    >
                                        {value ? (
                                            (() => {
                                                const selectedCard = notInDeckExclusiveAbilities.find(
                                                    (b) => b.name === value
                                                )

                                                if (!selectedCard) return "Select Ability Cards..."

                                                const { name } = selectedCard

                                                return (
                                                    <>
                                                        {`${name}`}
                                                    </>
                                                )
                                            })()
                                        ) : (
                                            "Select Ability Card..."
                                        )}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-50 lg:w-75 p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Bakugan..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No card found.</CommandEmpty>
                                            <CommandGroup>
                                                {notInDeckExclusiveAbilities.map((b, index) => (
                                                    <CommandItem
                                                        key={index}
                                                        value={b.name}
                                                        onSelect={(currentValue) => {
                                                            setValue(currentValue === value ? "" : currentValue)
                                                            setOpen(false)
                                                            addCardToDeckMutation.mutate(b.key)
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
                <CardContent className={exclusiveAbilities && exclusiveAbilities?.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}>
                    {
                        deckCards.length > 0 ? deckCards?.map((c, index) => <ExclusiveAbilityCardPreviewDeckEditor key={index} nom={c ? c.name : ''} description={c ? c.description : ''} id={c ? c.key : ''} deckId={deckId} />)
                            : <p className="text-center">No exclusive ability cards in this deck</p>
                    }
                </CardContent>
            </Card>
        </>
    )
}