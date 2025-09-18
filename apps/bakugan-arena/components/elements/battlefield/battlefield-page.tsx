'use client'

import useGetRoomState from "@/src/sockets/get-room-state"
import PlayerCards, { player } from "./players-cards"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type BattleFieldPageProps = {
    player: player | undefined,
    opponent: player | undefined,
    roomId: string,
    userId: string
}


export default function BattleFieldPage({ player, opponent, roomId, userId }: BattleFieldPageProps) {

    const { roomState, finished, winner} = useGetRoomState({ roomId })
    const turn = roomState && roomState.turnState.turn === userId ? true : false

    if(finished) {
        return (
            <section className="h-screen flex flex-col items-center justify-center gap-3">
            
                <h1>The game is finished</h1>
                {
                    winner !== null ? <p>{winner === userId ? `You Win` : `You Lose`}</p> : <p>Match null</p>
                }
                

                <Button asChild><Link href='/dashboard'>Return to Lobby</Link></Button>
            </section>
        )
    }

    return (
        <>

            <h1 className='text-center'> <span>{player?.player.displayUsername}</span> VS <span>{opponent?.player.displayUsername}</span></h1>
            <p className='text-center'>{roomState?.turnState.turnCount} { roomState?.battleState.battleInProcess && !roomState?.battleState.paused && `(${roomState?.battleState.turns})`}</p>
            {
                roomState && <PlayerCards player={player} opponent={opponent} roomId={roomId} userId={userId} turn={turn} set_gate={roomState?.turnState.set_new_gate} set_bakugan={roomState?.turnState.set_new_bakugan} use_ability={roomState?.turnState.use_ability_card} />
            }

        </>
    )
}