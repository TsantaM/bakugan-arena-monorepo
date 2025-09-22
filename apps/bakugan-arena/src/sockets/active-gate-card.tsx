import { activeGateCardProps, slots_id, stateType } from "@bakugan-arena/game-data"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"

export default function useActiveGateCard({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })

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