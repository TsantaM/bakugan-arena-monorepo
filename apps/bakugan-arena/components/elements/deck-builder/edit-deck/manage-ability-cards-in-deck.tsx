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
import { resolveAbilityCard } from "@bakugan-arena/i18n"
import { useLocale, useTranslations } from "next-intl"


export default function ManageAbilityCardsInDeck({ deckId, abilityCards, countBakugans, bakugans, problemCardKeys }: { deckId: string, abilityCards: string[] | undefined, countBakugans: number, bakugans: string[], problemCardKeys?: Set<string> }) {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const locale = useLocale()
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const queryClient = useQueryClient()

    const resolveCard = (c: (typeof AbilityCardsList)[number]) =>
        resolveAbilityCard(c.key, locale)

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
            toast.success(t('toasts.abilityAdded'))
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
            setValue('')
        }
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <CardTitle>
                            {t('sections.abilityCards', { n: abilityCards ? abilityCards?.length : 0 })}
                        </CardTitle>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full max-w-full lg:w-75 justify-between gap-2 overflow-hidden"
                                    disabled={addCardToDeckMutation.isPending || abilityCards?.length === 6 || countBakugans === 0 ? true : false}
                                >
                                    {notInDeckAbilities && value ? (
                                        (() => {
                                            const selectedCard = notInDeckAbilities.find(
                                                (b) => resolveCard(b).name === value || b.key === value
                                            )

                                            if (!selectedCard) return t('select.abilityCards')

                                            const { attribut } = selectedCard
                                            const imageUrl = `/images/attribut/${attribut?.toUpperCase()}.png`

                                            return (
                                                <>
                                                    <Image src={imageUrl} alt={`${attribut}`} width={20} height={20} />
                                                    {resolveCard(selectedCard).name}
                                                </>
                                            )
                                        })()
                                    ) : (
                                        t('select.abilityCard')
                                    )}
                                    <ChevronsUpDown className="shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full lg:w-75 p-0">
                                <Command>
                                    <CommandInput placeholder={t('search.abilityCard')} className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>{tCommon('empty.noCardFound')}</CommandEmpty>
                                        <CommandGroup>
                                            {notInDeckAbilities.map((b, index) => {
                                                const displayName = resolveCard(b).name
                                                return (
                                                <CommandItem
                                                    key={index}
                                                    value={displayName}
                                                    onSelect={(currentValue) => {
                                                        setValue(currentValue === value ? "" : currentValue)
                                                        setOpen(false)
                                                        addCardToDeckMutation.mutate(b.key)
                                                    }}
                                                >
                                                    {b.attribut && <Image src={`/images/attributs/${b.attribut?.toUpperCase()}.png`} alt={b.attribut} width={20} height={20} />
                                                    }                                                        {displayName}
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

                <CardContent className={deckAbilityCards.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}>
                    {
                        deckCards.length > 0 ? deckCards.map((c, index) => {
                            const resolved = c
                                ? resolveCard(c)
                                : { name: '', description: '' }
                            return <CardPreviewDeckEditor key={index} nom={resolved.name} description={resolved.description} attribut={c && c.attribut} id={c ? c.key : ''} deckId={deckId} flagged={!!c && problemCardKeys?.has(c.key)} />
                        })

                            : <p className='text-center'>{t('emptyStates.noAbilityCards')}</p>
                    }
                </CardContent>

            </Card>

        </>
    )
}
