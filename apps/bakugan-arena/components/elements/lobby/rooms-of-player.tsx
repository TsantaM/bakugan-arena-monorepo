'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRoomsStore } from "@/src/store/rooms-store"
import Link from "next/link"

export default function RoomsOfPlayer() {

    const rooms = useRoomsStore((state) => state.rooms)
    if (rooms.length === 0) return null
    return <>

        <Card>
            <CardHeader>
                <CardTitle>
                    Your in process games
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="max-h-100">
                    <ul className="p-4 flex flex-col gap-3 w-full">

                        {rooms.map((room, index) => <li key={index} className="w-full"><Button variant={'outline'} className="w-full" asChild><Link href={`/dashboard/battlefield?id=${room.roomId}`}>{`${room.p1} VS ${room.p2}`}</Link></Button></li>)}

                    </ul>
                </ScrollArea>
            </CardContent>

        </Card>


    </>

}