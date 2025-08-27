import Lobby from "@/components/elements/lobby/lobby"
import { getUser } from "@/src/actions/getUserSession"
import { unauthorized } from "next/navigation"


export default async function DashboardPage() {

    const user = await getUser()

    if (!user) {
        unauthorized()
    }

    return (
        <Lobby />
    )
}