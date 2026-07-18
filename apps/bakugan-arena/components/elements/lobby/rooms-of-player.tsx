'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRoomsStore } from "@/src/store/rooms-store"
import Link from "next/link"
import RemoveRoomButton from "./remove-room-button"

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

                        {rooms.map((room) => (
                            <li key={room.roomId} className="w-full flex items-center gap-2">
                                <Button variant={'outline'} className="flex-1" asChild>
                                    <Link href={`/dashboard/battlefield?id=${room.roomId}`}>
                                        {`${room.p1} VS ${room.p2}`}
                                    </Link>
                                </Button>
                                <RemoveRoomButton roomId={room.roomId} finished={room.finished} />
                            </li>
                        ))}

                    </ul>
                </ScrollArea>
            </CardContent>

        </Card>


    </>

}