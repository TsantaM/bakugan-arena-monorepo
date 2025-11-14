'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import Image from "next/image"
import { useState } from "react"
import { AddAbilityCardToDeck } from "@/src/actions/deck-builder/edit-deck-action"
import { toast } from "sonner"
import CardPreviewDeckEditor from "./cards-preview-deck-editor"
import { AbilityCardsList } from "@bakugan-arena/game-data"
import { BakuganList } from "@bakugan-arena/game-data"


export default function ManageAbilityCardsInDeck({ deckId, abilityCards, countBakugans, bakugans }: { deckId: string, abilityCards: string[] | undefined, countBakugans: number, bakugans: string[] }) {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const queryClient = useQueryClient()

    // Récupère l'attribut des bakugans dans l'équite
    const firstAttribut = [... new Set(BakuganList.filter((b) => bakugans.includes(b.key)).map((b) => b.attribut))]
    const secondAttribut = [... new Set(BakuganList.filter((b) => bakugans.includes(b.key)).map((b) => b.seconaryAttribut))]
    const bakugansAttribut = [firstAttribut, secondAttribut].flat()

    const deckAbilityCards = AbilityCardsList.filter((c) => abilityCards?.includes(c.key))
    const deckCards = abilityCards ? abilityCards?.map((c) => AbilityCardsList.find(card => card.key === c)) : []

    const notInDeckAttributLessAbilities = AbilityCardsList.filter((a) => !a.attribut).filter((c) => {
        const exemplary = deckCards.filter((a) => a?.key === c.key).length

        return c.maxInDeck > exemplary
    })

    const notInDeckAbilities = [AbilityCardsList.filter((c) => c.attribut !== undefined && bakugansAttribut.includes(c.attribut) || secondAttribut.includes(c.attribut)).filter((c) => {
        const exemplary = deckCards.filter((a) => a?.key === c.key).length

        return c.maxInDeck > exemplary
    }), notInDeckAttributLessAbilities].flat()

    const addCardToDeck = async (cardId: string) => {
        return await AddAbilityCardToDeck({ cardId, deckId })
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
                        <CardTitle>
                            Ability Cards
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <p>{abilityCards ? abilityCards?.length : 0} / 6</p>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-[200px] lg:w-[300px] justify-between"
                                        disabled={addCardToDeckMutation.isPending || abilityCards?.length === 6 || countBakugans === 0 ? true : false}
                                    >
                                        {notInDeckAbilities && value ? (
                                            (() => {
                                                const selectedCard = notInDeckAbilities.find(
                                                    (b) => b.name === value
                                                )

                                                if (!selectedCard) return "Select Ability Cards..."

                                                const { name, attribut } = selectedCard
                                                const imageUrl = `/images/attribut/${attribut?.toUpperCase()}.png`

                                                return (
                                                    <>
                                                        <Image src={imageUrl} alt={`${attribut}`} width={20} height={20} />
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
                                <PopoverContent className="w-[200px] lg:w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search Ability Card..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No card found.</CommandEmpty>
                                            <CommandGroup>
                                                {notInDeckAbilities.map((b, index) => (
                                                    <CommandItem
                                                        key={index}
                                                        value={b.name}
                                                        onSelect={(currentValue) => {
                                                            setValue(currentValue === value ? "" : currentValue)
                                                            setOpen(false)
                                                            addCardToDeckMutation.mutate(b.key)
                                                        }}
                                                    >
                                                        {b.attribut && <Image src={`/images/attributs/${b.attribut?.toUpperCase()}.png`} alt={b.attribut} width={20} height={20} />
                                                        }                                                        {b.name}
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

                <CardContent className={deckAbilityCards.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}>
                    {
                        deckCards.length > 0 ? deckCards.map((c, index) => <CardPreviewDeckEditor key={index} nom={c ? c.name : ''} description={c ? c.description : ''} attribut={c && c.attribut} id={c ? c.key : ''} deckId={deckId} />)

                            : <p className='text-center'>No Ability Cards in the deck</p>
                    }
                </CardContent>

            </Card>

        </>
    )
}