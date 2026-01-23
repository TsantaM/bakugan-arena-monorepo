import BattleFieldPage from "@/components/elements/battlefield/battlefield-page"
import { RoomDataAction } from "@/src/actions/battlefield/get-players-data"
import { getUser } from "@/src/actions/getUserSession"
import { unauthorized } from "next/navigation"

type PageProps = {
    searchParams: Promise<{ id: string }>
}


export default async function BattleField({ searchParams }: PageProps) {
    const user = await getUser()
    const {id: roomId} = await searchParams

    const RoomData = await RoomDataAction(roomId)

    if (!user) {
        unauthorized()
    }


    const player = RoomData?.find((d) => d.player.id === user.id)
    const opponent = RoomData?.find((d) => d.player.id != user.id)

    return <BattleFieldPage player={player} opponent={opponent} roomId={roomId} userId={user.id} />

}

