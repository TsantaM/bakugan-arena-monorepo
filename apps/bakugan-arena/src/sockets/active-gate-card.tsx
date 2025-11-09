import { activeGateCardProps, stateType } from "@bakugan-arena/game-data"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"
import { useGlobalGameState } from "../store/global-game-state-store"
import { useAninmationInProcess, useChangePowerLevelAnimation, useGameFinishedAnimation, useGateCardStateChangeAnimation, useSetBakuganAnimation, useSetGateCardAnimation } from "../store/global-animation-timeline-store"
import gsap from "gsap"

export default function useActiveGateCard({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })
    const setSlotToMap = useGlobalGameState((state) => state.setSlots)
    const { tl: setGateTimeline } = useSetGateCardAnimation((state) => state.tl)
    const { tl: setBakuganTimeline } = useSetBakuganAnimation((state) => state.tl)
    const { tl: gateCardStateChange } = useGateCardStateChangeAnimation((state) => state.tl)
    const { tl: powerLevelChange } = useChangePowerLevelAnimation((state) => state.tl)
    const { tl: gameFinished} = useGameFinishedAnimation((state) => state.tl)

    const setInProcess = useAninmationInProcess((state) => state.setInProcess)


    const ActiveGateCard = ({ roomId, gateId, slot, userId }: activeGateCardProps) => {
        if (socket && slots && roomState) {
            const activeGateCard: activeGateCardProps = {
                roomId: roomId,
                gateId: gateId,
                slot: slot,
                userId: userId
            }
            socket.emit('active-gate-card', (activeGateCard))
        }
    }

    useEffect(() => {
        if (socket) {
            socket.on('update-room-state', (state: stateType) => {
                setRoomState(state)
                setSlots(state?.protalSlots)
                if (!state) return
                setSlotToMap(state.protalSlots)
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
        ActiveGateCard
    }
}