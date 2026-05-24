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

export default function DeckPreview( {data} : {data: GetUserDeckType}) {

    const queryClient = useQueryClient()

    const deleteDeckFunction = async() => {
        return await DeleteDeck(data.id)
    }

    const bakugans = BakuganList.filter((b) => data.bakugans.includes(b.key))

    const deleteDeckMutation = useMutation({
        mutationKey: ['delete-deck'],
        mutationFn: deleteDeckFunction,
        onSuccess: () => {
            toast.success('Deck has been deleted')
            queryClient.invalidateQueries({queryKey: ['get-users-deck']})
        },
        onError: (err) => {
            toast.error(`Error during deleting : ${err}`)
        }
    })

    function CopyToClipboard() {
        const code = encodeDeck(data)

        if(!code) {
            toast.error('This deck is empty, cannot be shared')
            return
        }

        navigator.clipboard.writeText(code)
        toast.success('Deck code copied to clipboard')
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>
                        {data.name}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={CopyToClipboard}>
                            <Share2/>
                        </Button>
                        <Button variant='outline' asChild ><Link href={`/dashboard/deck-builder/edit-deck?id=${data.id}`}><Edit/></Link></Button>
                        <Button variant='destructive' onClick={() => deleteDeckMutation.mutate()}><Trash/></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
                { bakugans.length > 0 ? bakugans.map((b, index) => <Image key={index} alt={`${b.name} ${b.attribut}`} src={`/images/bakugans/sphere/${b.image}/${b.attribut.toUpperCase()}.png`} width={50} height={50}/>) : 'No bakugan in this deck'}
            </CardContent>
            <Toaster/>
        </Card>
    )
}