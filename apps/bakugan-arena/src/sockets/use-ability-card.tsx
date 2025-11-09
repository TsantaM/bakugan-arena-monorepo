'use client'

import { bakuganToMoveType, slots_id, stateType, useAbilityCardProps, useAbilityCardPropsFront } from "@bakugan-arena/game-data"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"
import { useAninmationInProcess, useChangePowerLevelAnimation, useGameFinishedAnimation, useGateCardStateChangeAnimation, useSetBakuganAnimation, useSetGateCardAnimation } from "../store/global-animation-timeline-store"
import { useGlobalGameState } from "../store/global-game-state-store"
import gsap from "gsap"

export default function useActiveAbilityCard({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })
    const setSlotToMap = useGlobalGameState((state) => state.setSlots)
    const { tl: setGateTimeline } = useSetGateCardAnimation((state) => state.tl)
    const { tl: setBakuganTimeline } = useSetBakuganAnimation((state) => state.tl)
    const { tl: gateCardStateChange } = useGateCardStateChangeAnimation((state) => state.tl)
    const { tl: powerLevelChange } = useChangePowerLevelAnimation((state) => state.tl)
    const { tl: gameFinished} = useGameFinishedAnimation((state) => state.tl)
    
    const setInProcess = useAninmationInProcess((state) => state.setInProcess)

    const ActiveAbilityCard = ({ roomId, abilityId, userId, bakuganKey, slot_to_move, target_slot, target, slotToDrag, bakuganToAdd, bakuganToMove, destination, zone }: useAbilityCardPropsFront) => {

        const slotOfUser = slots?.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id
        if (socket && roomState) {

            if (!slotOfUser && zone !== '' && zone) {

                const activeCardProps: useAbilityCardProps = {
                    roomId: roomId,
                    abilityId: abilityId,
                    slot: zone,
                    userId: userId,
                    bakuganKey: bakuganKey,
                    target_slot: target_slot,
                    slot_to_move: slot_to_move,
                    target: target,
                    slotToDrag: slotToDrag,
                    bakuganToAdd: bakuganToAdd,
                    bakuganToMove: bakuganToMove,
                    destination: destination
                }

                socket.emit('use-ability-card', (activeCardProps))

            } else {
                if (slotOfUser) {
                    const activeCardProps: useAbilityCardProps = {
                        roomId: roomId,
                        abilityId: abilityId,
                        slot: slotOfUser,
                        userId: userId,
                        bakuganKey: bakuganKey,
                        target_slot: target_slot,
                        slot_to_move: slot_to_move,
                        target: target,
                        slotToDrag: slotToDrag,
                        bakuganToAdd: bakuganToAdd,
                        bakuganToMove: bakuganToMove,
                        destination: destination
                    }

                    socket.emit('use-ability-card', (activeCardProps))
                }
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
        ActiveAbilityCard
    }

}