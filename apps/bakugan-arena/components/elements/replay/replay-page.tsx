'use client'

import { useEffect, useRef, useState } from "react"
import ImportReplay from "./import-replay-input"
import { replayDataType } from "@bakugan-arena/game-data"
import SelectUploadedReplay from "./select-uploaded-replay"
import ReactHowler from "react-howler"
import { useAudioStore } from "@/src/store/sounds-store"
import MessagesModal from "../battlefield/messages-modal"
import BattleLogToggle from "../battle-log/battle-log-toggle"
import { Button } from "@/components/ui/button"
import { Loader2, Pause, Play, RotateCcw, SkipBack, SkipForward, Upload, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ReplayExistsByRoomId } from "@/src/actions/replay/replay-exists-by-room-id"
import { UploadReplay } from "@/src/actions/replay/uploard-raplay-action"
import { toast } from "sonner"
import { useReplayBattleLogStore } from "@/src/store/replay-battle-log-store"
import { useLocale, useTranslations } from "next-intl"

type ReplayControlMessage =
    | "REPLAY_PAUSE"
    | "REPLAY_PLAY"
    | "REPLAY_NEXT_TURN"
    | "REPLAY_PREV_TURN"
    | "REPLAY_RESTART"

export default function ReplayPage() {
    const t = useTranslations('replay')
    const tCommon = useTranslations('common')
    const locale = useLocale()

    const [replay, setReplay] = useState<replayDataType | null>(null)
    const [isPaused, setIsPaused] = useState(true)
    const battleLogEnabled = useReplayBattleLogStore((state) => state.enabled)
    const { volume, track } = useAudioStore()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const queryClient = useQueryClient()

    const existsQuery = useQuery({
        queryKey: ["replay-exists", replay?.roomId],
        queryFn: () => ReplayExistsByRoomId(replay!.roomId),
        enabled: Boolean(replay?.roomId),
    })

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!replay?.player1 || !replay?.player2 || !replay.initialSnapshot || !replay.replay) {
                throw new Error("Missing data for upload")
            }

            return await UploadReplay({
                roomId: replay.roomId,
                player1: replay.player1,
                player2: replay.player2,
                replay: replay.replay,
                initialSnapshot: replay.initialSnapshot,
            })
        },
        onSuccess: async () => {
            toast.success(t('toasts.uploadSuccess'))
            await queryClient.invalidateQueries({ queryKey: ["replay-exists", replay?.roomId] })
            await queryClient.invalidateQueries({ queryKey: ["get-replays"] })
        },
        onError: (error) => {
            toast.error(t('toasts.uploadFailed', {
                error: error instanceof Error ? error.message : String(error),
            }))
        },
    })

    const buildGameboardLink = (page: string) => {
        const baseUrl = (GAMEBOARD_URL ?? "http://localhost:5173").replace(/\/$/, "")
        const url = new URL(`${baseUrl}/${page}`)

        if (replay?.roomId) url.searchParams.set("roomId", replay.roomId)
        if (replay?.player1?.id) url.searchParams.set("player1Id", replay.player1.id)
        if (replay?.player1?.image) url.searchParams.set("player1Image", replay.player1.image)
        if (replay?.player2?.id) url.searchParams.set("player2Id", replay.player2.id)
        if (replay?.player2?.image) url.searchParams.set("player2Image", replay.player2.image)
        url.searchParams.set("locale", locale)

        return url.toString()
    }

    const sendReplayControl = (type: ReplayControlMessage) => {
        iframeRef.current?.contentWindow?.postMessage(
            { type },
            GAMEBOARD_URL ?? "*"
        )
    }

    const togglePause = () => {
        const nextPaused = !isPaused
        setIsPaused(nextPaused)
        sendReplayControl(nextPaused ? "REPLAY_PAUSE" : "REPLAY_PLAY")
    }

    const clearReplay = () => {
        setReplay(null)
        setIsPaused(true)
    }

    useEffect(() => {
        if (!replay) return

        const iframe = iframeRef.current
        if (!iframe) return

        setIsPaused(true)

        const sendReplay = () => {
            iframe.contentWindow?.postMessage(
                {
                    type: "LOAD_REPLAY",
                    payload: replay,
                },
                GAMEBOARD_URL ?? "*"
            )
        }

        iframe.addEventListener("load", sendReplay)
        sendReplay()

        return () => {
            iframe.removeEventListener("load", sendReplay)
        }
    }, [replay, GAMEBOARD_URL])

    const link = buildGameboardLink("replay.html")
    const matchLabel = replay?.player1 && replay?.player2
        ? tCommon('labels.vs', {
            p1: replay.player1.displayUsername ?? tCommon('fallback.player'),
            p2: replay.player2.displayUsername ?? tCommon('fallback.player'),
        })
        : null
    const showUploadButton = Boolean(replay) && existsQuery.isSuccess && existsQuery.data === false

    return (<>
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/50 px-3 py-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <ImportReplay
                    setReplay={(replayData: replayDataType) => {
                        setReplay(replayData)
                    }}
                />
                <SelectUploadedReplay
                    setReplay={(replayData: replayDataType) => {
                        setReplay(replayData)
                    }}
                />
            </div>

            {matchLabel && (
                <p className="truncate text-sm font-medium text-muted-foreground">
                    {matchLabel}
                </p>
            )}

            <div className="flex items-center gap-2">
                <BattleLogToggle context="replay" />
                {showUploadButton && (
                    <Button
                        variant="outline"
                        disabled={uploadMutation.isPending}
                        onClick={() => uploadMutation.mutate()}
                        aria-label={t('a11y.upload')}
                    >
                        {uploadMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Upload />
                        )}
                        {t('upload')}
                    </Button>
                )}
                <Button
                    variant="outline"
                    disabled={!replay}
                    onClick={clearReplay}
                    aria-label={t('a11y.clear')}
                >
                    <X />
                    {t('clear')}
                </Button>
            </div>
        </header>

        {
            replay && replay.player1 && replay.player2 && <>

                <ReactHowler
                    src={[`/sounds/OST/${track}`]}
                    loop={true}
                    volume={volume[0]}
                    playing={!isPaused}
                />
                <div className="relative h-[85%] w-full">
                    <iframe ref={iframeRef} src={link} className="h-full w-full border-0"></iframe>
                    <MessagesModal
                        isReplay={true}
                        battleLogEnabled={battleLogEnabled}
                        player={replay.player1.displayUsername}
                        opponent={replay.player2.displayUsername}
                        roomId={replay.roomId}
                        userId={replay.player1.id}
                    />
                    <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => sendReplayControl("REPLAY_RESTART")}
                            aria-label={t('a11y.restart')}
                        >
                            <RotateCcw />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => sendReplayControl("REPLAY_PREV_TURN")}
                            aria-label={t('a11y.prevTurn')}
                        >
                            <SkipBack />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={togglePause}
                            aria-label={isPaused ? t('a11y.play') : t('a11y.pause')}
                        >
                            {isPaused ? <Play /> : <Pause />}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => sendReplayControl("REPLAY_NEXT_TURN")}
                            aria-label={t('a11y.nextTurn')}
                        >
                            <SkipForward />
                        </Button>
                    </div>
                </div>

            </>
        }

    </>)
}
