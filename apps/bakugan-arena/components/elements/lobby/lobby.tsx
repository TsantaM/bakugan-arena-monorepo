'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { useSocket } from "@/src/providers/socket-provider"
import { redirect } from "next/navigation"
import LauchRanckedGate from "./launch-rancked-game"
import Section from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import RoomsOfPlayer from "./rooms-of-player"
import WatchBattle from "./watch-battle"
import FindUserComponent from "./find-user"
import ChatsCard from "./chats-cards"
import { useTranslations } from "next-intl"

export default function Lobby() {
    const t = useTranslations('lobby')
    const tNav = useTranslations('nav')
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
                <ChatsCard />
                <RoomsOfPlayer />
                <LauchRanckedGate />
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {t('otherActions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button asChild className="w-full" variant="outline" ><Link href={"/dashboard/tutorial"}>{tNav('tutorial')}</Link></Button>
                        <Button asChild className="w-full" variant="outline" ><Link href={"/dashboard/deck-builder"}>{tNav('deckBuilder')}</Link></Button>
                        <Button asChild className="w-full" variant="outline" ><Link href={"/dashboard/ladder"}>{tNav('ladder')}</Link></Button>
                        <FindUserComponent />
                        <WatchBattle />
                    </CardContent>
                </Card>
            </Section>

            <Toaster />
        </>
    )
}
