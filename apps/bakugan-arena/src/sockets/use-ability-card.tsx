'use client'

import { slots_id, stateType } from "@bakugan-arena/game-data"
import { useSocket } from "../providers/socket-provider"
import useGetRoomState from "./get-room-state"
import { useEffect } from "react"


export default function useActiveAbilityCard({ roomId }: { roomId: string }) {
    const socket = useSocket()
    const { roomState, slots, setRoomState, setSlots } = useGetRoomState({ roomId })

    const ActiveAbilityCard = ({ roomId, abilityId, userId, bakuganKey }: { roomId: string, abilityId: string, userId: string, bakuganKey: string }) => {

        const slotOfUser = slots?.find((s) => s.bakugans.find((b) => b.key === bakuganKey && b.userId === userId))?.id

        if (socket && slotOfUser && roomState) {
            socket.emit('use-ability-card', ({ roomId, abilityId, slot: slotOfUser, userId, bakuganKey }))
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