'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState, { stateType } from "./get-room-state"

export default function useTurnAction({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { setRoomState, getRoomData } = useGetRoomState({ roomId })

    const turnAction = () => {
        if (socket) {
            socket.emit('turn-action', ({roomId}))
            console.log('turn action')
        }
    }


    useEffect(() => {
        if (socket) {
            socket.on('turn-action', (state: stateType) => {
                console.log('turn action', state)
                setRoomState(state)
                getRoomData()
            })
        }
    }, [socket])

    return {
        turnAction
    }
}