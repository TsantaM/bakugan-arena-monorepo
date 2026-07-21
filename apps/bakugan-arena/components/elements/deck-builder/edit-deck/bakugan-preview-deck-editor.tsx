'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RemoveBakuganInDeckAction } from "@/src/actions/deck-builder/edit-deck-action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";


export default function BakuganPreviewDeckEditor({ nom, image, attribut, id, deckId }: { nom: string, image: string, attribut: string, id: string, deckId: string }) {
    const t = useTranslations('deckBuilder')
    const tCommon = useTranslations('common')
    const queryClient = useQueryClient();

    const RemoveBakuganFromDeck = async ({ id }: { id: string }) => {
        return await RemoveBakuganInDeckAction({ bakuganId: id, deckId }) // deckId should be passed from props or context
    }

    const RemoveBakuganFromDeckMutation = useMutation({
        mutationKey: ['remove-bakugan-from-deck'],
        mutationFn: RemoveBakuganFromDeck,
        onSuccess: () => {
            toast.success(t('toasts.bakuganRemoved'))
            queryClient.invalidateQueries({ queryKey: ['get-deck-data'] })
            queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })

        },
        onError: (error) => {
            toast.error(t('toasts.bakuganRemoveFailed') + error.message)
        }
    })


    return (
        <>
            <Card>
                <CardHeader>
                    <Image src={`/images/bakugans/sphere/${image}/${attribut.toUpperCase()}.png`} alt={`${nom} ${attribut}`} width={75} height={75} />

                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            {`${nom} ${attribut}`}
                        </CardTitle>
                        <Button disabled={RemoveBakuganFromDeckMutation.isPending ? true : false} onClick={() => RemoveBakuganFromDeckMutation.mutate({ id })} variant='outline'><Trash /> {tCommon('actions.remove')}</Button>
                    </div>
                </CardContent>
            </Card>

        </>
    )
}
