import EditDeck from "@/components/elements/deck-builder/edit-deck"
import { GetDeckData } from "@/src/actions/deck-builder/get-deck-data"
import { getUser } from "@/src/actions/getUserSession"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { notFound, unauthorized } from "next/navigation"

type PageProps = {
    searchParams: Promise<{ id: string }>
}

export default async function EditDeckPage({ searchParams }: PageProps) {
    const user = await getUser()
    if (!user) {
        unauthorized()
    }

    const { id } = await searchParams

    if (!id) {
        notFound()
    }

    const queryClient = new QueryClient()
    const deck = await queryClient.fetchQuery({
        queryKey: ['get-deck-data', id],
        queryFn: () => GetDeckData(id),
    })

    if (!deck) {
        notFound()
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditDeck id={id} />
        </HydrationBoundary>
    )
}
