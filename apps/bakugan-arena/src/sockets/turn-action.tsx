'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { stateType } from "@bakugan-arena/game-data"
import { useGlobalGameState } from "../store/global-game-state-store"
import { useAninmationInProcess, useChangePowerLevelAnimation, useGameFinishedAnimation, useGateCardStateChangeAnimation, useSetBakuganAnimation, useSetGateCardAnimation } from "../store/global-animation-timeline-store"
import gsap from "gsap"

export default function useTurnAction({ roomId, userId }: { roomId: string, userId: string }) {
    const socket = useSocket()
    const { setRoomState, getRoomData } = useGetRoomState({ roomId })
    const setSlotToMap = useGlobalGameState((state) => state.setSlots)
    const { tl: setGateTimeline } = useSetGateCardAnimation((state) => state.tl)
    const { tl: setBakuganTimeline } = useSetBakuganAnimation((state) => state.tl)
    const { tl: gateCardStateChange } = useGateCardStateChangeAnimation((state) => state.tl)
    const { tl: powerLevelChange } = useChangePowerLevelAnimation((state) => state.tl)
    const { tl: gameFinished} = useGameFinishedAnimation((state) => state.tl)
    
    const setInProcess = useAninmationInProcess((state) => state.setInProcess)

    const turnAction = () => {
        if (socket) {
            socket.emit('turn-action', ({ roomId, userId }))
            socket.emit('clean-animation-table', ({ roomId }))
        }
    }


    useEffect(() => {
        if (socket) {
            socket.on('turn-action', (state: stateType) => {
                setRoomState(state)
                getRoomData()
                if (!state) return
                setSlotToMap(state?.protalSlots)
                const globalTimeLine = gsap.timeline({
                    paused: true,
                    onStart: () => setInProcess(true),
                    onComplete: () => setInProcess(false)
                })
                globalTimeLine
                    .add(setGateTimeline)
                    .add(setBakuganTimeline)
                    .add(gateCardStateChange)
                    .add(powerLevelChange)
                    .add(gameFinished
                        
                    )
                globalTimeLine.play()

                return () => {
                    globalTimeLine.kill()
                }
            })
        }
    }, [socket])

    return {
        turnAction
    }
}