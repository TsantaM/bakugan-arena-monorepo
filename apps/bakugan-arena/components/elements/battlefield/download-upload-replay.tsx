'use client'

import { Button } from "@/components/ui/button"
import { saveReplayToServer, serializeReplayReference } from "@/src/lib/replay/replay-api-client"
import { REPLAY_ENABLED } from "@/src/lib/replay/replay-flag"
import { fetchRoomReplayViaSocket } from "@/src/lib/replay/replay-socket-client"
import { Room, useRoomsStore } from "@/src/store/rooms-store"
import { useSocketStore } from "@/src/store/socket-id-store"
import { playerDataType, replayEntryType, replaySnapshotType } from "@bakugan-arena/game-data"
import { Download, Loader2, Upload } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function DownloadAndUploadReplay({ roomId, userId, player1, player2 }: {
    roomId: string
    userId: string
    player1: playerDataType | undefined
    player2: playerDataType | undefined
}) {
    const t = useTranslations('replay')
    const room = useRoomsStore((state) => state.rooms).find((r) => r.roomId === roomId)
    const updateRoom = useRoomsStore((state) => state.updateRoom)
    const socket = useSocketStore((state) => state.socket)
    const [replay, setReplay] = useState<replayEntryType[] | undefined>(undefined)
    const [initialSnapshot, setInitialSnapshot] = useState<replaySnapshotType | undefined>(undefined)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (!socket) return

        const handleFinalRoomState = (nextRoom: Room) => {
            updateRoom(nextRoom)
        }

        socket.on('final-room-state', handleFinalRoomState)

        return () => {
            socket.off('final-room-state', handleFinalRoomState)
        }
    }, [socket, updateRoom])

    const getOrderedPlayers = () => {
        if (!player1 || !player2 || !room) return null

        const roomP1IsPlayer1 = player1.id === room.p1
        return {
            orderedPlayer1: roomP1IsPlayer1 ? player1 : player2,
            orderedPlayer2: roomP1IsPlayer1 ? player2 : player1,
        }
    }

    const ensureReplayLoaded = useCallback(async () => {
        if (replay && initialSnapshot) {
            return { replay, initialSnapshot }
        }
        if (!socket) {
            throw new Error("Socket unavailable")
        }

        const payload = await fetchRoomReplayViaSocket(socket, { roomId, userId })
        setReplay(payload.replay)
        setInitialSnapshot(payload.initialSnapshot)
        return payload
    }, [replay, initialSnapshot, socket, roomId, userId])

    async function handleDownload() {
        if (!room) return

        const ordered = getOrderedPlayers()
        if (!ordered) return

        const { orderedPlayer1, orderedPlayer2 } = ordered

        setIsDownloading(true)

        try {
            const { replay: loadedReplay, initialSnapshot: loadedSnapshot } = await ensureReplayLoaded()

            const savedReplay = await saveReplayToServer({
                replay: loadedReplay,
                initialSnapshot: loadedSnapshot,
                player1: orderedPlayer1,
                player2: orderedPlayer2,
                roomId,
            }, { ifExists: "return" })

            const json = serializeReplayReference({
                id: savedReplay.id,
                roomId,
                player1: orderedPlayer1,
                player2: orderedPlayer2,
            })

            const blob = new Blob([json], { type: "application/json" })
            const fileName = `Bakugan-Arena-${orderedPlayer1.displayUsername}-VS-${orderedPlayer2.displayUsername}-${roomId}.json`
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.click()
            URL.revokeObjectURL(url)

            toast.success(t('toasts.downloadSuccess'))
        } catch (error) {
            toast.error(t('toasts.downloadFailed', {
                error: error instanceof Error ? error.message : String(error),
            }))
        } finally {
            setIsDownloading(false)
        }
    }

    async function handleUpload() {
        if (!room || !player1 || !player2) return

        const ordered = getOrderedPlayers()
        if (!ordered) return

        setIsUploading(true)

        try {
            const { replay: loadedReplay, initialSnapshot: loadedSnapshot } = await ensureReplayLoaded()

            await saveReplayToServer({
                roomId,
                player1: ordered.orderedPlayer1,
                player2: ordered.orderedPlayer2,
                replay: loadedReplay,
                initialSnapshot: loadedSnapshot,
            }, { ifExists: "reject" })

            toast.success(t('toasts.uploadSuccess'))
        } catch (error) {
            toast.error(t('toasts.uploadFailed', { error: String(error) }))
        } finally {
            setIsUploading(false)
        }
    }

    if (!REPLAY_ENABLED) return null
    if (!room) return null
    if (!room.finished) return null
    // if (!room.replayAvailable) return null
    if (!player1 || !player2) return null

    return (
        <>
            <Button
                variant="outline"
                onClick={handleDownload}
                aria-label={t('a11y.download')}
                disabled={isDownloading}
            >
                {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
            </Button>
            <Button
                variant="outline"
                onClick={handleUpload}
                aria-label={t('a11y.upload')}
                disabled={isUploading}
            >
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            </Button>
            {/* <Toaster /> */}
        </>
    )
}
