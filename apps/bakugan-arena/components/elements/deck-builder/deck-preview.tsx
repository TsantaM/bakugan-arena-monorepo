'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { DeleteDeck } from "@/src/actions/deck-builder/delete-deck"
import { GetUserDeckType } from "@/src/actions/deck-builder/get-deck-data"
import { BakuganList } from "@bakugan-arena/game-data"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Edit, Share2, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { encodeDeck } from "./functions/share-deck-get-code"
import { useTranslations } from "next-intl"

export default function DeckPreview( {data} : {data: GetUserDeckType}) {
    const t = useTranslations('deckBuilder')
    const queryClient = useQueryClient()

    const deleteDeckFunction = async() => {
        return await DeleteDeck(data.id)
    }

    const bakugans = BakuganList.filter((b) => data.bakugans.includes(b.key))

    const deleteDeckMutation = useMutation({
        mutationKey: ['delete-deck'],
        mutationFn: deleteDeckFunction,
        onSuccess: () => {
            toast.success(t('toasts.deleted'))
            queryClient.invalidateQueries({queryKey: ['get-user-decks']})
        },
        onError: (err) => {
            toast.error(t('toasts.deleteError', { err: String(err) }))
        }
    })

    function CopyToClipboard() {
        const code = encodeDeck(data)

        if(!code) {
            toast.error(t('toasts.emptyShare'))
            return
        }

        navigator.clipboard.writeText(code)
        toast.success(t('toasts.codeCopied'))
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex min-w-0 items-center justify-between gap-2">
                    <CardTitle className="min-w-0 truncate">
                        {data.name}
                    </CardTitle>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <Button variant="outline" size="icon" onClick={CopyToClipboard}>
                            <Share2/>
                        </Button>
                        <Button variant='outline' size="icon" asChild ><Link href={`/dashboard/deck-builder/edit-deck?id=${data.id}`}><Edit/></Link></Button>
                        <Button variant='destructive' size="icon" onClick={() => deleteDeckMutation.mutate()}><Trash/></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
                { bakugans.length > 0 ? bakugans.map((b) => (
                    <Image
                        key={b.key}
                        alt={`${b.name} ${b.attribut}`}
                        src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`}
                        width={50}
                        height={50}
                        sizes="50px"
                    />
                )) : t('preview.noBakugan')}
            </CardContent>
            <Toaster/>
        </Card>
    )
}
