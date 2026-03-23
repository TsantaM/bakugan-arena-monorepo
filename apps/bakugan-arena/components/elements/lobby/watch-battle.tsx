import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSocket } from "@/src/providers/socket-provider";
import Link from "next/link";
import { useEffect, useState } from "react";

type RoomsToWatchType = {
    roomId: string,
    p1: string,
    p2: string
}

export default function WatchBattle() {

    const [open, setOpen] = useState(false)
    const [rooms, setRooms] = useState<RoomsToWatchType[]>([])
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return
        if (!open) return

        socket.emit('get-battle-to-watch', );


    }, [open, socket])

    useEffect(() => {
        if (!socket) return
        if (!open) return

        socket.on('battle-to-watch', (rooms: RoomsToWatchType[]) => {
            setRooms(rooms)
        })

    }, [open, socket])

    return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button className="w-full">Watch Battle</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Watch Battle</DialogTitle>

                <div className='flex flex-col justify-center items-center gap-2 '>
                    {
                        rooms && rooms.length > 0 && rooms.map((r, index) => (
                            <Button key={index} className="w-full" variant={'outline'}>
                                <Link href={`/dashboard/battlefield?id=${r.roomId}`} className="italic">
                                    {r.p1} VS {r.p2}
                                </Link>
                            </Button>
                        ))
                    }
                </div>

            </DialogContent>
        </Dialog>



    )
}