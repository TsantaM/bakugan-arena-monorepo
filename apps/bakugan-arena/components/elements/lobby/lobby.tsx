'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { useSocket } from "@/src/providers/socket-provider"
import { redirect } from "next/navigation"
import LauchRanckedGate from "./launch-rancked-game"
import ChalengeSomeone from "./chalenge-someone"
import OnChalengePopUp from "./on-chalenge-pop-up"
import Section from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import Link from "next/link"


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
            <Section className="md:p-0 grid lg:grid-cols-2 gap-3">
                <LauchRanckedGate />
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Other actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button asChild className="w-full" variant="outline" ><Link href={"/dashboard/deck-builder"}>Deck Builder</Link></Button>
                        <ChalengeSomeone />
                        <OnChalengePopUp />
                    </CardContent>
                </Card>
            </Section>

            <Toaster />
        </>
    )

}