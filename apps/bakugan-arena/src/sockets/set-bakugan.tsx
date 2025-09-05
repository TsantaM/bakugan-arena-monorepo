'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState, { stateType } from "./get-room-state"

export default function useSetBakugan({ roomId, userId }: { roomId: string, userId: string }) {

    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })


    const SetBakugan = ({ bakuganKey, slot }: { bakuganKey: string, slot: string }) => {
        if (socket && slots && roomState) {
            socket.emit('set-bakugan', ({ roomId, bakuganKey, slot, userId }))
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
        SetBakugan
    }
} 