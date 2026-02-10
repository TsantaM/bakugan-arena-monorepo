// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { useEffect, useState } from "react"
// import { Toaster } from "@/components/ui/sonner"
// import { useSocket } from "@/src/providers/socket-provider"
// import { redirect, useRouter } from "next/navigation"
// import LauchRanckedGate from "./launch-rancked-game"
// import ChalengeSomeone from "./chalenge-someone"
// import OnChalengePopUp from "./on-chalenge-pop-up"
// import Section from "@/components/ui/section"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { authClient } from "@/src/lib/auth-client"
// import RoomsOfPlayer from "./rooms-of-player"


// export default function Lobby() {

//     const router = useRouter()
//     const socket = useSocket()
//     const [Rooms, setRooms] = useState<{ p1: string, p2: string, roomId: string }[]>([])
//     const user = authClient.useSession()

//     // useEffect(() => {
//     //     if (!socket) return
//     //     if (!user.data?.user.id) return
//     //     const userId = user.data.user.id
//     //     socket.emit('get-rooms-user-id', userId)

//     // }, [socket, router])

//     // useEffect(() => {
//     //     if (!socket) return
//     //     socket.on('get-rooms-user-id', (rooms: { p1: string, p2: string, roomId: string }[]) => {
//     //         if (rooms === Rooms) return
//     //         setRooms(rooms)
//     //     })

//     // }, [socket])

//     useEffect(() => {
//         if (!socket) return

//         socket.on('chalenge-accept-redirect', (roomId) => {
//             redirect(`/dashboard/battlefield?id=${roomId}`)
//         })
//     }, [socket])

//     return (
//         <>
//             <Section className="md:p-0 grid lg:grid-cols-2 gap-3">
//                 <LauchRanckedGate />
//                 {
//                     Rooms.length > 0 && <RoomsOfPlayer rooms={Rooms}/>
//                 }
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>
//                             Other actions
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent className="flex flex-col gap-3">
//                         <Button asChild className="w-full" variant="outline" ><Link href={"/dashboard/deck-builder"}>Deck Builder</Link></Button>
//                         <ChalengeSomeone />
//                         <OnChalengePopUp />
//                     </CardContent>
//                 </Card>
//             </Section>

//             <Toaster />
//         </>
//     )

// }

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