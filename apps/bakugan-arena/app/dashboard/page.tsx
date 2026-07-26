import Lobby from "@/components/elements/lobby/lobby"
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data"
import { getUser } from "@/src/actions/getUserSession"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { unauthorized } from "next/navigation"

export default async function DashboardPage() {
    const user = await getUser()

    if (!user) {
        unauthorized()
    }

    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['get-user-decks'],
        queryFn: GetUserDecks,
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Lobby />
        </HydrationBoundary>
    )
}
