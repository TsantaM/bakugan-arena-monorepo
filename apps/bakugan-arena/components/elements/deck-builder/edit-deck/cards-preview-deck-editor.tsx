'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { RemoveAbilityCardFromDeck, RemoveExclusiveAbilityCardFromDeck, RemoveGateCardFromDeck } from "@/src/actions/deck-builder/edit-deck-action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function CardPreviewDeckEditor({ id, deckId, nom, attribut, description, flagged }: { id: string, deckId: string, nom: string, attribut?: string, description: string, flagged?: boolean }) {
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

            <Card className={cn(flagged && "border-destructive ring-1 ring-destructive/40")}>
                <CardHeader>
                    <div className='flex min-w-0 items-start justify-between gap-2'>
                        <CardTitle className="flex min-w-0 items-center gap-2">
                            {attribut && <Image src={`/images/attributs/${attribut.toUpperCase()}.png`} alt={attribut} width={25} height={25} className="shrink-0" />}
                            <span className="min-w-0 break-words">{nom}</span>
                        </CardTitle>

                        <Button size="sm" className="shrink-0" disabled={RemoveAbilityFromDeckMutation.isPending ? true : false} variant='outline' onClick={() => RemoveAbilityFromDeckMutation.mutate()}><Trash /> <span className="hidden sm:inline">{tCommon('actions.remove')}</span></Button>
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

export function ExclusiveAbilityCardPreviewDeckEditor({ id, deckId, nom, description, flagged }: { id: string, deckId: string, nom: string, description: string, flagged?: boolean }) {
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

            <Card className={cn(flagged && "border-destructive ring-1 ring-destructive/40")}>
                <CardHeader>
                    <div className='flex min-w-0 items-start justify-between gap-2'>
                        <CardTitle className="min-w-0 break-words">{nom}</CardTitle>
                        <Button size="sm" className="shrink-0" disabled={RemoveExclusiveAbilityFromDeckMutation.isPending ? true : false} variant='outline' onClick={() => RemoveExclusiveAbilityFromDeckMutation.mutate()}><Trash /> <span className="hidden sm:inline">{tCommon('actions.remove')}</span></Button>
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

export function GateCardPreviewDeckEditor({ id, deckId, nom, description, flagged }: { id: string, deckId: string, nom: string, description: string, flagged?: boolean }) {
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

            <Card className={cn(flagged && "border-destructive ring-1 ring-destructive/40")}>
                <CardHeader>
                    <div className='flex min-w-0 items-start justify-between gap-2'>
                        <CardTitle className="min-w-0 break-words">{nom}</CardTitle>
                        <Button size="sm" className="shrink-0" disabled={RemoveGateCardDeckMutation.isPending ? true : false} variant='outline' onClick={() => RemoveGateCardDeckMutation.mutate()}><Trash /> <span className="hidden sm:inline">{tCommon('actions.remove')}</span></Button>
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
