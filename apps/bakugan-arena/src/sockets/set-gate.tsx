'use client'

import { toast } from "sonner"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"
import { stateType } from "@bakugan-arena/game-data"
import { useAninmationInProcess, useChangePowerLevelAnimation, useGameFinishedAnimation, useGateCardStateChangeAnimation, useSetBakuganAnimation, useSetGateCardAnimation } from "../store/global-animation-timeline-store"
import { useGlobalGameState } from "../store/global-game-state-store"
import gsap from "gsap"

export default function useSetGate({ roomId, userId }: { roomId: string, userId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })
    const setSlotToMap = useGlobalGameState((state) => state.setSlots)
    const { tl: setGateTimeline } = useSetGateCardAnimation((state) => state.tl)
    const { tl: setBakuganTimeline } = useSetBakuganAnimation((state) => state.tl)
    const { tl: gateCardStateChange } = useGateCardStateChangeAnimation((state) => state.tl)
    const { tl: powerLevelChange } = useChangePowerLevelAnimation((state) => state.tl)
    const { tl: gameFinished} = useGameFinishedAnimation((state) => state.tl)

    const setInProcess = useAninmationInProcess((state) => state.setInProcess)


    const SetGateCard = ({ gateId, slot }: { gateId: string, slot: string }) => {

        if (socket && slots && roomState) {
            const usable_slot = slots?.find((s) => s.id === slot)?.can_set
            if (usable_slot && roomState.turnState.set_new_gate) {
                socket.emit('set-gate', ({ roomId, gateId, slot, userId }))
            } else {
                toast.error('You cannot set gate card')
            }
        }

    }

    useEffect(() => {
        if (socket) {
            socket.on('update-room-state', (state: stateType) => {
                setRoomState(state)
                setSlots(state?.protalSlots)
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
                    .add(gameFinished)

                globalTimeLine.play()

                return () => {
                    globalTimeLine.kill()
                }
            })
        }
    }, [socket])

    return {
        SetGateCard
    }
}