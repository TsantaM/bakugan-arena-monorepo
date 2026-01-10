'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { useSocket } from "@/src/providers/socket-provider"
import { redirect } from "next/navigation"
import LauchRanckedGate from "./launch-rancked-game"
import ChalengeSomeone from "./chalenge-someone"
import OnChalengePopUp from "./on-chalenge-pop-up"


export default function Lobby() {

    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on('chalenge-accept-redirect', (roomId) => {
            redirect(`/dashboard/battlefield?id=${roomId}`)
        })
    }, [socket])

    return (
        <>
            <div className="grid lg:grid-cols-2 gap-3">
                <LauchRanckedGate />
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Other actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChalengeSomeone />
                        <OnChalengePopUp />
                    </CardContent>
                </Card>
            </div>

            <Toaster />
        </>
    )
    
}