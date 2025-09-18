'use client'

import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import { attribut, portalSlotsType, stateType } from "@bakugan-arena/game-data";


export default function useGetRoomState({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const [roomState, setRoomState] = useState<stateType | undefined>()
    const [slots, setSlots] = useState<portalSlotsType>()
    const [finished, setFinished] = useState(false)
    const [winner, setWinner] = useState<string | null>()

    const getRoomData = () => {
        if (socket) {
            socket.emit('get-room-state', ({ roomId }))
            socket.on('room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
                setSlots(state?.protalSlots)
            })
        }
    }

    useEffect(() => {
        if (socket) {
            socket.emit('get-room-state', ({ roomId }))
            socket.on('room-state', (state: stateType) => {
                console.log(state)
                setRoomState(state)
                setSlots(state?.protalSlots)
                if(state && state.status.finished === true) {
                    setFinished(true)
                    setWinner(state.status.winner)
                }
            })
        }
    }, [socket, roomId])

    return {
        roomState,
        setRoomState,
        slots,
        setSlots,
        getRoomData,
        finished,
        winner
    }
}