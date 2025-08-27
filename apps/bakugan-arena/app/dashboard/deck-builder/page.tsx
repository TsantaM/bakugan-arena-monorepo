import DeckBuilerLanding from "@/components/elements/deck-builder/deck-builder-landing";
import { getUser } from "@/src/actions/getUserSession";
import { unauthorized } from "next/navigation";

export default async function DeckBuilerPage() {
    const user = await getUser()

    if(!user) {
        unauthorized()
    }

    return (
        <>
            <DeckBuilerLanding />
        </>
    )
}