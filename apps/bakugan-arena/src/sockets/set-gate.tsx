'use client'

import { toast } from "sonner"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"
import { stateType } from "@bakugan-arena/game-data"

export default function useSetGate({ roomId, userId }: { roomId: string, userId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })

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
        if(socket) {
            socket.on('update-room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
                setSlots(state?.protalSlots)
            })
        }
    }, [socket])

    return {
        SetGateCard
    }
}