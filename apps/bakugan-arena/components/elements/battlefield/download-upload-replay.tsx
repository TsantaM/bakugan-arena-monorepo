'use client'

import { Button } from "@/components/ui/button"
import { Room, useRoomsStore } from "@/src/store/rooms-store"
import { useSocketStore } from "@/src/store/socket-id-store"
import { AnimationDirectivesTypes } from "@bakugan-arena/game-data"
import { Download, Upload } from "lucide-react"
import { useEffect, useState } from "react"

export default function DownloadAndUploadReplay({ roomId }: { roomId: string }) {

    const room = useRoomsStore((state) => state.rooms).find((r) => r.roomId === roomId)
    const updateRoom = useRoomsStore((state) => state.updateRoom)
    const socket = useSocketStore((state) => state.socket)
    const [animations, setAnimations] = useState<AnimationDirectivesTypes[] | undefined>(undefined)

    useEffect(() => {
        if (!socket) return

        socket.on('final-room-state', (room: Room) => {
            alert('eh')
            console.log(room)
            updateRoom(room)
            if (!room.animations) return
            setAnimations(room.animations)
        })

    }, [socket])


    function handleDownload() {
        console.log(room)
        if (!room) return
        if (!animations) return
        console.log(animations)
    }

    function handleUpload() {
        console.log(room)
        if (!room) return
        if (!animations) return
        console.log(animations)
    }

    // const checker = !room || !room.finished && !room.animations ? true : false

    if (!room) return null
    if (!room.finished && !room.animations) return null

    return (
        <div className="flex items-center gap-2 absolute bottom-2 left-2">

            <Button variant='outline' onClick={handleDownload} ><Download /> Download Replay</Button>
            <Button variant='outline' onClick={handleUpload} ><Upload /> Upload Replay</Button>

        </div>
    )
}