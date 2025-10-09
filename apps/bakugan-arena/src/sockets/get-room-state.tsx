'use client'

import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import { attribut, deckType, portalSlotsType, stateType } from "@bakugan-arena/game-data";
import { useGlobalGameState } from "../store/global-game-state-store";


export default function useGetRoomState({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const [roomState, setRoomState] = useState<stateType | undefined>()
    const [slots, setSlots] = useState<portalSlotsType>()
    const [decksState, setDecksState] = useState<deckType[] | undefined>()
    const [finished, setFinished] = useState(false)
    const [winner, setWinner] = useState<string | null>()
    const { setGlobalState, setSlots: initializeSlots } = useGlobalGameState()
    const slotsToMap = useGlobalGameState((state) => state.portalSlots)
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
                setGlobalState(state)

                setRoomState(state)
                setSlots(state?.protalSlots)
                setDecksState(state?.decksState)
                if(slotsToMap.length === 0 && state) {
                    initializeSlots(state.protalSlots)
                }
                if (state && state.status.finished === true) {
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
        decksState,
        getRoomData,
        finished,
        winner
    }
}