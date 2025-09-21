'use client'

import { slots_id, stateType } from "@bakugan-arena/game-data"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"


export default function useActiveAbilityCard({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })

    const ActiveAbilityCard = ({ roomId, abilityId, userId, bakuganKey, slot_to_move, target_slot, target, slotToDrag, bakuganToAdd }: { roomId: string, abilityId: string, userId: string, bakuganKey: string, target_slot: slots_id | '', slot_to_move: slots_id | '', target?: string | '', slotToDrag: slots_id | '', bakuganToAdd: string }) => {

        const slotOfUser = slots?.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id

        if (socket && slotOfUser && roomState) {
            socket.emit('use-ability-card', ({ roomId, abilityId, slot: slotOfUser, userId, bakuganKey, target_slot: target_slot, slot_to_move: slot_to_move, target: target, slotToDrag: slotToDrag, bakuganToAdd: bakuganToAdd }))
        }
    }

    useEffect(() => {
        if (socket) {
            socket.on('update-room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
                setSlots(state?.protalSlots)
            })
        }
    }, [socket])

    return {
        ActiveAbilityCard
    }

}