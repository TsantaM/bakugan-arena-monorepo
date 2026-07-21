'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRoomsStore } from "@/src/store/rooms-store"
import Link from "next/link"
import RemoveRoomButton from "./remove-room-button"
import { useTranslations } from "next-intl"

export default function RoomsOfPlayer() {
    const t = useTranslations('lobby.rooms')
    const tCommon = useTranslations('common')

    const rooms = useRoomsStore((state) => state.rooms)
    if (rooms.length === 0) return null
    return <>

        <Card>
            <CardHeader>
                <CardTitle>
                    {t('title')}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="max-h-100">
                    <ul className="p-4 flex flex-col gap-3 w-full">

                        {rooms.map((room) => (
                            <li key={room.roomId} className="w-full flex items-center gap-2">
                                <Button variant={'outline'} className="flex-1" asChild>
                                    <Link href={`/dashboard/battlefield?id=${room.roomId}`}>
                                        {tCommon('labels.vs', { p1: room.p1, p2: room.p2 })}
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
