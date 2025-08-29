'use client'

import useGetRoomState from "@/src/sockets/get-room-state"
import PlayerCards, { player } from "./players-cards"

type BattleFieldPageProps = {
    player: player | undefined,
    opponent: player | undefined,
    roomId: string,
    userId: string
}


export default function BattleFieldPage({ player, opponent, roomId, userId }: BattleFieldPageProps) {

    const { roomState } = useGetRoomState({ roomId })
    const turn = roomState && roomState.turnState.turn === userId ? true : false

    return (
        <>

            <h1 className='text-center'> <span>{player?.player.displayUsername}</span> VS <span>{opponent?.player.displayUsername}</span></h1>

            {
                roomState && <PlayerCards player={player} opponent={opponent} roomId={roomId} userId={userId} turn={turn} set_gate={roomState?.turnState.set_new_gate} set_bakugan={roomState?.turnState.set_new_bakugan} use_ability={roomState?.turnState.use_ability_card} />
            }


        </>
    )
}