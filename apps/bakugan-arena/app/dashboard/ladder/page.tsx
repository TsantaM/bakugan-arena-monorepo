import LadderTable from "@/components/elements/ladder/ladder-card"
import { GetPlayersLadder } from "@/src/actions/ladder/get-players-ladder"

export default async function LadderPage() {

    const players = await GetPlayersLadder()

    return (
        <>
            <LadderTable players={players} />

        </>
    )
}