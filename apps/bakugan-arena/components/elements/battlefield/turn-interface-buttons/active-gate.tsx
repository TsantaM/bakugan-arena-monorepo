'use client'

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import useGetRoomState from "@/src/sockets/get-room-state"

export default function ActivateGateCard({ roomId, userId, setActiveGate }: { roomId: string, userId: string, setActiveGate: (active: boolean) => void }) {

    const { roomState } = useGetRoomState({ roomId })
    const battleSlotGateHowner = roomState?.protalSlots.find((p) => p.id === roomState.battleState.slot)?.portalCard?.userId


    if (roomState && roomState.battleState.battleInProcess && !roomState.battleState.paused && battleSlotGateHowner && battleSlotGateHowner === userId) {
        return (
            <div className="flex items-center gap-5">
                <Label htmlFor="active-gate">Active Gate Card</Label>
                <Switch id="active-gate" disabled={battleSlotGateHowner !== userId ? true : false} onCheckedChange={(val) => setActiveGate(val)} />
            </div>
        )
    }
}