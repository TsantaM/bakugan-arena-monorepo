'use client'

import { Button } from "@/components/ui/button"
import { CreateDeckAction } from "@/src/actions/deck-builder/create-deck-action"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateDeckButton() {

    const queryClient = useQueryClient()
    const router = useRouter()
    const createDeck = async () => {
        return await CreateDeckAction()
    }

    const createNewDeckMutation = useMutation({
        mutationFn: createDeck,
        mutationKey: ['createDeck'],
        onSuccess: (deckId) => {
            if (deckId) {
                queryClient.invalidateQueries({ queryKey: ['get-user-decks'] })
                router.push(`/dashboard/deck-builder/edit-deck?id=${deckId}`)
            }
        },
        onError: (error) => {
            console.error("Error creating deck:", error)
        }
    })

    return (
        <Button variant='outline' className="cursor-pointer" disabled={createNewDeckMutation.isPending ? true : false} onClick={() => createNewDeckMutation.mutate()}>
            <Plus /> New Deck
        </Button>
    )
}