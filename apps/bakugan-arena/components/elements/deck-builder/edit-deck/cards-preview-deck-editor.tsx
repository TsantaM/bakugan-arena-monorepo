'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { RemoveAbilityCardFromDeck, RemoveExclusiveAbilityCardFromDeck, RemoveGateCardFromDeck } from "@/src/actions/deck-builder/edit-deck-action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function CardPreviewDeckEditor({ id, deckId, nom, attribut, description }: { id: string, deckId: string, nom: string, attribut?: string, description: string }) {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const queryClient = useQueryClient()

    const RemoveAbilityFromDeckFunction = async () => {
        return await RemoveAbilityCardFromDeck({ cardId: id, deckId })
    }

    const RemoveAbilityFromDeckMutation = useMutation({
        mutationKey: ['remove-ability-card-from-deck'],
        mutationFn: RemoveAbilityFromDeckFunction,
        onSuccess: () => {
            toast.success(t('toasts.abilityRemoved'))
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })

        },
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className="flex items-center gap-2">
                            {attribut && <Image src={`/images/attributs/${attribut.toUpperCase()}.png`} alt={attribut} width={25} height={25} />}
                            {nom}
                        </CardTitle>

                        <Button disabled={RemoveAbilityFromDeckMutation.isPending ? true : false} variant='outline' onClick={() => RemoveAbilityFromDeckMutation.mutate()}><Trash /> {tCommon('actions.remove')}</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {description}
                </CardContent>

                <Toaster />

            </Card>

        </>
    )
}

export function ExclusiveAbilityCardPreviewDeckEditor({ id, deckId, nom, description }: { id: string, deckId: string, nom: string, description: string }) {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const queryClient = useQueryClient()

    const RemoveExclusiveAbilityFromDeckFunction = async () => {

        const cardId = id

        return await RemoveExclusiveAbilityCardFromDeck({ cardId, deckId })
    }

    const RemoveExclusiveAbilityFromDeckMutation = useMutation({
        mutationKey: ['remove-exclusive-ability-card-from-deck'],
        mutationFn: RemoveExclusiveAbilityFromDeckFunction,
        onSuccess: () => {
            toast.success(t('toasts.exclusiveRemoved'))
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })

        },
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle>{nom}</CardTitle>
                        <Button disabled={RemoveExclusiveAbilityFromDeckMutation.isPending ? true : false} variant='outline' onClick={() => RemoveExclusiveAbilityFromDeckMutation.mutate()}><Trash /> {tCommon('actions.remove')}</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {description}
                </CardContent>

                <Toaster />

            </Card>

        </>
    )
}

export function GateCardPreviewDeckEditor({ id, deckId, nom, description }: { id: string, deckId: string, nom: string, description: string }) {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const queryClient = useQueryClient()

    const RemoveGateCardFromDeckFunction = async () => {
        return await RemoveGateCardFromDeck({ cardId: id, deckId })
    }

    const RemoveGateCardDeckMutation = useMutation({
        mutationKey: ['remove-exclusive-ability-card-from-deck'],
        mutationFn: RemoveGateCardFromDeckFunction,
        onSuccess: () => {
            toast.success(t('toasts.gateRemoved'))
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })

        },
    })

    return (
        <>

            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle>{nom}</CardTitle>
                        <Button disabled={RemoveGateCardDeckMutation.isPending ? true : false} variant='outline' onClick={() => RemoveGateCardDeckMutation.mutate()}><Trash /> {tCommon('actions.remove')}</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {description}
                </CardContent>

                <Toaster />

            </Card>

        </>
    )
}
