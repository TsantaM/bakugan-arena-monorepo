'use client'

import useGetRoomState from "@/src/sockets/get-room-state"
import PlayerCards, { player } from "./players-cards"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGlobalGameState } from "@/src/store/global-game-state-store"

type BattleFieldPageProps = {
    player: player | undefined,
    opponent: player | undefined,
    roomId: string,
    userId: string
}


export default function BattleFieldPage({ player, opponent, roomId, userId }: BattleFieldPageProps) {

    const { roomState, finished, winner} = useGetRoomState({ roomId })
    const state = useGlobalGameState((state) => state.gameState)
    console.log( 'BattleFieldPage' , state)
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

            {
                roomState && <PlayerCards player={player} opponent={opponent} roomId={roomId} userId={userId} />
            }

        </>
    )
}