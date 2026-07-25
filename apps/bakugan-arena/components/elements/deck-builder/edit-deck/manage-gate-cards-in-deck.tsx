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
import { resolveGateCard } from "@bakugan-arena/i18n"
import { useLocale, useTranslations } from "next-intl"

export default function ManageGateCardsInDeckEditor({ deckId, gateCards, bakugans, problemCardKeys }: { deckId: string, gateCards: string[], bakugans: string[], problemCardKeys?: Set<string> }) {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const queryClient = useQueryClient()

    const resolveCard = (c: (typeof GateCardsList)[number]) =>
        resolveGateCard(c.key, locale)

    const deckCards = gateCards ? gateCards?.map((c) => GateCardsList.find(card => card.key === c)) : []
    const cardInDeck = GateCardsList.filter((c) => gateCards.includes(c.key))

    const firstAttribut = BakuganList.filter((b) => bakugans.includes(b.key)).map((a) => a.attribut)
    const secondAttribut = BakuganList.filter((b) => bakugans.includes(b.key)).map((a) => a.seconaryAttribut)
    const bakugansAttribut = [firstAttribut, secondAttribut].flat()
    const bakugansFamilies = cardInDeck.some((card) => card.family) ? [] : BakuganList.filter((b) => bakugans.includes(b.key)).map((a) => a.family)
    const familiesGateCards = GateCardsList.filter((c) => bakugansFamilies.includes(c.family ? c.family : '')).filter((c) => {
        const exemplary = cardInDeck.filter((a) => c.key === a.key).length
        return c.maxInDeck > exemplary
    })
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
            toast.success(t('toasts.gateAdded'))
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
            setValue('')
        }
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
                        <CardTitle>
                            {t('sections.gateCards', { n: gateCards.length })}
                        </CardTitle>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full lg:w-75 justify-between"
                                    disabled={addGateToDeckMutation.isPending || gateCards.length === 5 ? true : false}
                                >
                                    {value ? (
                                        (() => {
                                            const selectedCard = notInDeckCards.find(
                                                (b) => resolveCard(b).name === value || b.key === value
                                            )

                                            if (!selectedCard) return t('select.gateCards')

                                            return (
                                                <>
                                                    {resolveCard(selectedCard).name}
                                                </>
                                            )
                                        })()
                                    ) : (
                                        t('select.gateCard')
                                    )}
                                    <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-50 lg:w-75 p-0">
                                <Command>
                                    <CommandInput placeholder={t('search.bakugan')} className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>{tCommon('empty.noCardFound')}</CommandEmpty>
                                        <CommandGroup>
                                            {notInDeckCards.map((b, index) => {
                                                const displayName = resolveCard(b).name
                                                return (
                                                <CommandItem
                                                    key={index}
                                                    value={displayName}
                                                    onSelect={(currentValue) => {
                                                        setValue(currentValue === value ? "" : currentValue)
                                                        setOpen(false)
                                                        addGateToDeckMutation.mutate(b.key)
                                                    }}
                                                >
                                                    {displayName}
                                                    <Check
                                                        className={cn(
                                                            "ml-auto",
                                                            value === b.key ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            )})}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                </CardHeader>


                <CardContent className={deckCards && deckCards.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}>
                    {
                        deckCards && deckCards.length > 0 ? deckCards.map((b, index) => {
                            const resolved = b
                                ? resolveCard(b)
                                : { name: '', description: '' }
                            return <GateCardPreviewDeckEditor key={index} id={b ? b.key : ''} nom={resolved.name} deckId={deckId} description={resolved.description} flagged={!!b && problemCardKeys?.has(b.key)} />
                        })

                            : <p className='text-center'>{t('emptyStates.noGateCards')}</p>
                    }
                </CardContent>
            </Card>


        </>
    )
}
