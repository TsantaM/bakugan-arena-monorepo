import { slots_id, stateType } from "@bakugan-arena/game-data"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"

export default function useActiveGateCard({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })

    const ActiveGateCard = ({ roomId, gateId, slot, userId}: { roomId: string, gateId: string, slot: slots_id, userId: string }) => {
        if (socket && slots && roomState) {
            socket.emit('active-gate-card', ({ roomId, gateId, slot, userId }))
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
        ActiveGateCard
    }
}