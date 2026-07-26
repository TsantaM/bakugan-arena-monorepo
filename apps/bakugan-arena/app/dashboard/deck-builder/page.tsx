import DeckBuilerLanding from "@/components/elements/deck-builder/deck-builder-landing";
import { GetUserDecks } from "@/src/actions/deck-builder/get-deck-data";
import { getUser } from "@/src/actions/getUserSession";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { unauthorized } from "next/navigation";

export default async function DeckBuilerPage() {
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
            <DeckBuilerLanding />
        </HydrationBoundary>
    )
}
