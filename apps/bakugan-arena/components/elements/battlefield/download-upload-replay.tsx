'use client'

import { Button } from "@/components/ui/button"
import { ConvertReplayToJson } from "@/src/actions/battlefield/convert-replay-to-json"
import { UploadReplay } from "@/src/actions/replay/uploard-raplay-action"
import { Room, useRoomsStore } from "@/src/store/rooms-store"
import { useSocketStore } from "@/src/store/socket-id-store"
import { AnimationDirectivesTypes, playerDataType } from "@bakugan-arena/game-data"
import { useMutation } from "@tanstack/react-query"
import { Download, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"

export default function DownloadAndUploadReplay({ roomId, player1, player2 }: { roomId: string, player1: playerDataType, player2: playerDataType }) {

    const room = useRoomsStore((state) => state.rooms).find((r) => r.roomId === roomId)
    const updateRoom = useRoomsStore((state) => state.updateRoom)
    const socket = useSocketStore((state) => state.socket)
    const [animations, setAnimations] = useState<AnimationDirectivesTypes[] | undefined>(undefined)

    useEffect(() => {
        if (!socket) return

        socket.on('final-room-state', (room: Room) => {
            // alert('eh')
            // console.log(room)
            updateRoom(room)
            if (!room.animations) return
            setAnimations(room.animations)
        })

    }, [socket])


    async function handleDownload() {
        // console.log(room)
        if (!room) return
        if (!player1) return
        if (!player2) return
        if (!animations) return
        // console.log(animations)

        const json = await ConvertReplayToJson({ replay: animations, player1, player2, roomId })

        const blob = new Blob([json], {
            type: "application/json"
        })

        const fileName: string = `Bakugan-Arena-${player1.displayUsername}-VS-${player2.displayUsername}-${roomId}.json`

        const url = URL.createObjectURL(blob)

        const a = document.createElement('a');
        a.href = url
        a.download = fileName

        a.click()
        URL.revokeObjectURL(url)

    }

    // ================== UPLOAD MUTATION ==================
    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!room || !player1 || !player2 || !animations) {
                throw new Error("Missing data for upload")
            }

            return await UploadReplay({
                roomId,
                player1,
                player2,
                replay: animations
            })
        },
        onSuccess: () => {
            toast.success("Replay upload success")
        },
        onError: (error) => {
           toast.error(`Replay upload failed, ${error}`)
        }
    })


    // ================== HANDLE UPLOAD ==================
    function handleUpload() {
        if (!room || !player1 || !player2 || !animations) return
        uploadMutation.mutate()
    }

    // const checker = !room || !room.finished && !room.animations ? true : false

    if (!room) return null
    if (!room.finished && !room.animations) return null
    if (!player1 || !player2) return null

    return (
        <div className="flex items-center gap-2 absolute bottom-2 left-2">

            <Button variant='outline' onClick={handleDownload} ><Download /> Download Replay</Button>
            <Button variant='outline' onClick={handleUpload} ><Upload /> Upload Replay</Button>

            <Toaster/>
            
        </div>
    )
}