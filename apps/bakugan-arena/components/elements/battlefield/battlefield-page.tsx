'use client'

import useGetRoomState from "@/src/sockets/get-room-state"
import PlayerCards, { player } from "./players-cards"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import GameFinishedScreen from "./game-finished-screen"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type BattleFieldPageProps = {
    player: player | undefined,
    opponent: player | undefined,
    roomId: string,
    userId: string
}


export default function BattleFieldPage({ player, opponent, roomId, userId }: BattleFieldPageProps) {

    const router = useRouter()
    const { roomState } = useGetRoomState({ roomId })
    const cleanState = useGlobalGameState((state) => state.cleanState)
    const finished = useGlobalGameState((state) => state.gameState?.status.finished)

    useEffect(() => {
        cleanState()
    }, [router, roomId])

    return (
        <>
            {
                finished && <GameFinishedScreen userId={userId} />
            }

            {
                roomState && <PlayerCards player={player} opponent={opponent} roomId={roomId} userId={userId} />
            }

        </>
    )
}