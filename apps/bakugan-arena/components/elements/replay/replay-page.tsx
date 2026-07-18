'use client'

import { useEffect, useRef, useState } from "react"
import ImportReplay from "./import-replay-input"
import { replayDataType } from "@bakugan-arena/game-data"
import SelectUploadedReplay from "./select-uploaded-replay"
import ReactHowler from "react-howler"
import { useAudioStore } from "@/src/store/sounds-store"
import MessagesModal from "../battlefield/messages-modal"
import { Button } from "@/components/ui/button"
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react"

type ReplayControlMessage =
    | "REPLAY_PAUSE"
    | "REPLAY_PLAY"
    | "REPLAY_NEXT_TURN"
    | "REPLAY_PREV_TURN"
    | "REPLAY_RESTART"

export default function ReplayPage() {

    const [replay, setReplay] = useState<replayDataType | null>(null)
    const [isPaused, setIsPaused] = useState(true)
    const { volume, track } = useAudioStore()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL

    const buildGameboardLink = (page: string) => {
        const baseUrl = (GAMEBOARD_URL ?? "http://localhost:5173").replace(/\/$/, "")
        const url = new URL(`${baseUrl}/${page}`)

        if (replay?.roomId) url.searchParams.set("roomId", replay.roomId)
        if (replay?.player1?.id) url.searchParams.set("player1Id", replay.player1.id)
        if (replay?.player1?.image) url.searchParams.set("player1Image", replay.player1.image)
        if (replay?.player2?.id) url.searchParams.set("player2Id", replay.player2.id)
        if (replay?.player2?.image) url.searchParams.set("player2Image", replay.player2.image)

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
        ? `${replay.player1.displayUsername} VS ${replay.player2.displayUsername}`
        : null

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
                <Button
                    variant="outline"
                    disabled={!replay}
                    onClick={clearReplay}
                    aria-label="Vider le replay"
                >
                    <X />
                    Clear
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
                <iframe ref={iframeRef} src={link} className="w-full h-[85%] border-0"></iframe>
                <div>
                    <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-[calc(50%+3rem)] items-center gap-2">
                        <MessagesModal isReplay={true} player={replay.player1.displayUsername} opponent={replay.player2.displayUsername} roomId={replay.roomId} userId={replay.player1.id} />
                        <Button
                            variant="outline"
                            onClick={() => sendReplayControl("REPLAY_RESTART")}
                            aria-label="Recommencer le replay"
                        >
                            <RotateCcw />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => sendReplayControl("REPLAY_PREV_TURN")}
                            aria-label="Tour précédent"
                        >
                            <SkipBack />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={togglePause}
                            aria-label={isPaused ? "Play replay" : "Pause replay"}
                        >
                            {isPaused ? <Play /> : <Pause />}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => sendReplayControl("REPLAY_NEXT_TURN")}
                            aria-label="Tour suivant"
                        >
                            <SkipForward />
                        </Button>
                    </div>
                </div>

            </>
        }

    </>)
}
