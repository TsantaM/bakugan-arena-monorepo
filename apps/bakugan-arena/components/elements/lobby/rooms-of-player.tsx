'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function RoomsOfPlayer(
    { rooms }: { rooms: { p1: string, p2: string, roomId: string }[] }
) {
    return <>

        <Card>
            <CardHeader>
                <CardTitle>
                    Your in process games
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ul className="flex flex-col gap-3 w-full">

                    {rooms.map((room, index) => <li key={index} className="w-full"><Button variant={'outline'} className="w-full" asChild><Link href={`/dashboard/battlefield?id=${room.roomId}`}>{`${room.p1} VS ${room.p2}`}</Link></Button></li>)}

                </ul>
            </CardContent>

        </Card>


    </>

}