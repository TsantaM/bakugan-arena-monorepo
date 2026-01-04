'use client'

import useGetRoomState from "@/src/sockets/get-room-state"
import PlayerCards, { player } from "./players-cards"
import { useGlobalGameState } from "@/src/store/global-game-state-store"
import GameFinishedScreen from "./game-finished-screen"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSocket } from "@/src/providers/socket-provider"
import { AnimationDirectivesTypes } from "@bakugan-arena/game-data"
import { useAnimationStore } from "@/src/store/animations-store"

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
    const { clearStore, setAnimationAndMessages, Animations } = useAnimationStore()
    const socket = useSocket()

    useEffect(() => {
        clearStore()
        if (!socket) return
        socket.emit('init-room-state', ({ roomId }))
        cleanState()
    }, [socket])

    useEffect(() => {
        if (!socket) return
        socket.on('animations', (animations: AnimationDirectivesTypes[]) => {
            setAnimationAndMessages(animations)
        })

    }, [socket])

    return (
        <>
            {/* {
                finished && <GameFinishedScreen userId={userId} />
            } */}

            {
                roomState && <PlayerCards player={player} opponent={opponent} roomId={roomId} userId={userId} />
            }

        </>
    )
}