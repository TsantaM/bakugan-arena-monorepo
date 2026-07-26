'use client'

import { Button } from "@/components/ui/button"
import { ConvertReplayToJson } from "@/src/actions/battlefield/convert-replay-to-json"
import { UploadReplay } from "@/src/actions/replay/uploard-raplay-action"
import { uploadReplayToBlob } from "@/src/lib/replay/replay-blob"
import { Room, useRoomsStore } from "@/src/store/rooms-store"
import { useSocketStore } from "@/src/store/socket-id-store"
import { playerDataType, replayDataType, replayEntryType, replaySnapshotType } from "@bakugan-arena/game-data"
import { useMutation } from "@tanstack/react-query"
import { Download, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"
import { useTranslations } from "next-intl"

export default function DownloadAndUploadReplay({ roomId, player1, player2 }: {
    roomId: string
    player1: playerDataType | undefined
    player2: playerDataType | undefined
}) {
    const t = useTranslations('replay')
    const room = useRoomsStore((state) => state.rooms).find((r) => r.roomId === roomId)
    const updateRoom = useRoomsStore((state) => state.updateRoom)
    const socket = useSocketStore((state) => state.socket)
    const [replay, setReplay] = useState<replayEntryType[] | undefined>(undefined)
    const [initialSnapshot, setInitialSnapshot] = useState<replaySnapshotType | undefined>(undefined)

    useEffect(() => {
        if (!socket) return

        socket.on('final-room-state', (room: Room) => {
            updateRoom(room)
            if (!room.replay) return
            setReplay(room.replay)
            setInitialSnapshot(room.initialSnapshot)
        })

    }, [socket, updateRoom])

    /**
     * Aligne player1/player2 sur players[0]/players[1] (room.p1/p2),
     * même perspective que la capture des snapshots eliminated.*.
     */
    const getOrderedPlayers = () => {
        if (!player1 || !player2 || !room) return null

        const roomP1IsPlayer1 = player1.id === room.p1
        return {
            orderedPlayer1: roomP1IsPlayer1 ? player1 : player2,
            orderedPlayer2: roomP1IsPlayer1 ? player2 : player1,
        }
    }

    function buildReplayData(
        orderedPlayer1: NonNullable<playerDataType>,
        orderedPlayer2: NonNullable<playerDataType>,
    ): replayDataType {
        return {
            roomId,
            player1: orderedPlayer1,
            player2: orderedPlayer2,
            initialSnapshot: initialSnapshot!,
            replay: replay!,
        }
    }

    async function handleDownload() {
        if (!room) return
        if (!replay) return
        if (!initialSnapshot) return

        const ordered = getOrderedPlayers()
        if (!ordered) return

        const { orderedPlayer1, orderedPlayer2 } = ordered

        const json = await ConvertReplayToJson({
            replay,
            initialSnapshot,
            player1: orderedPlayer1,
            player2: orderedPlayer2,
            roomId,
        })

        const blob = new Blob([json], {
            type: "application/json"
        })

        const fileName: string = `Bakugan-Arena-${orderedPlayer1.displayUsername}-VS-${orderedPlayer2.displayUsername}-${roomId}.json`

        const url = URL.createObjectURL(blob)

        const a = document.createElement('a');
        a.href = url
        a.download = fileName

        a.click()
        URL.revokeObjectURL(url)
    }

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!room || !replay || !initialSnapshot) {
                throw new Error("Missing data for upload")
            }

            const ordered = getOrderedPlayers()
            if (!ordered) {
                throw new Error("Missing players for upload")
            }

            const replayData = buildReplayData(
                ordered.orderedPlayer1,
                ordered.orderedPlayer2,
            )
            const blobUrl = await uploadReplayToBlob(replayData)

            return await UploadReplay({
                roomId,
                player1: ordered.orderedPlayer1,
                player2: ordered.orderedPlayer2,
                blobUrl,
            })
        },
        onSuccess: () => {
            toast.success(t('toasts.uploadSuccess'))
        },
        onError: (error) => {
           toast.error(t('toasts.uploadFailed', { error: String(error) }))
        }
    })


    function handleUpload() {
        if (!room || !player1 || !player2 || !replay || !initialSnapshot) return
        uploadMutation.mutate()
    }

    if (!room) return null
    if (!room.finished && !room.replay) return null
    if (!player1 || !player2) return null

    return (
        <>
            <Button
                variant="outline"
                onClick={handleDownload}
                aria-label={t('a11y.download')}
            >
                <Download />
            </Button>
            <Button
                variant="outline"
                onClick={handleUpload}
                aria-label={t('a11y.upload')}
                disabled={uploadMutation.isPending}
            >
                <Upload />
            </Button>
            <Toaster />
        </>
    )
}
