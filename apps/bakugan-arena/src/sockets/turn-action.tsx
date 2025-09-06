'use client'

import { useEffect } from "react"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { stateType } from "@bakugan-arena/game-data"

export default function useTurnAction({ roomId, userId }: { roomId: string, userId: string }) {
    const socket = useSocket()
    const { setRoomState, getRoomData } = useGetRoomState({ roomId })

    const turnAction = () => {
        if (socket) {
            socket.emit('turn-action', ({roomId, userId}))
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