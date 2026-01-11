import BattleFieldPage from "@/components/elements/battlefield/battlefield-page"
import { RoomDataAction } from "@/src/actions/battlefield/get-players-data"
import { getUser } from "@/src/actions/getUserSession"
import { unauthorized } from "next/navigation"


export default async function BattleField({ searchParams }: { searchParams: { id: string } }) {
    const user = await getUser()
    const roomId = searchParams.id

    const RoomData = await RoomDataAction(roomId)

    if (!user) {
        unauthorized()
    }


    const player = RoomData?.find((d) => d.player.id === user.id)
    const opponent = RoomData?.find((d) => d.player.id != user.id)

    return <BattleFieldPage player={player} opponent={opponent} roomId={roomId} userId={user.id} />

}

