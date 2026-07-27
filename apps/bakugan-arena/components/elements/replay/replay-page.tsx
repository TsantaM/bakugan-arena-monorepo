'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import ImportReplayReference from "./import-replay-reference-input"
import SelectReplayFromDb from "./select-replay-from-db"
import ReactHowler from "react-howler"
import { useAudioStore } from "@/src/store/sounds-store"
import MessagesModal from "../battlefield/messages-modal"
import BattleLogToggle from "../battle-log/battle-log-toggle"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Menu, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react"
import type { ReplaySelection } from "@/src/lib/replay/replay-selection"
import { loadReplaySelectionFromId } from "@/src/lib/replay/replay-api-client"
import { useReplayBattleLogStore } from "@/src/store/replay-battle-log-store"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

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

    const [replaySelection, setReplaySelection] = useState<ReplaySelection | null>(null)
    const [isPaused, setIsPaused] = useState(true)
    const searchParams = useSearchParams()
    const replayIdFromUrl = searchParams.get("replayId")
    const battleLogEnabled = useReplayBattleLogStore((state) => state.enabled)
    const { volume, track } = useAudioStore()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const REPLAY_API_ORIGIN = (process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3005").replace(/\/$/, "")

    const buildGameboardLink = (selection: ReplaySelection) => {
        const baseUrl = (GAMEBOARD_URL ?? "http://localhost:5173").replace(/\/$/, "")
        const url = new URL(`${baseUrl}/replay.html`)

        url.searchParams.set("replayId", selection.id)
        url.searchParams.set("replayApiOrigin", REPLAY_API_ORIGIN)
        url.searchParams.set("roomId", selection.roomId)
        url.searchParams.set("player1Id", selection.player1.id)
        if (selection.player1.image) {
            url.searchParams.set("player1Image", selection.player1.image)
        }
        url.searchParams.set("player2Id", selection.player2.id)
        if (selection.player2.image) {
            url.searchParams.set("player2Image", selection.player2.image)
        }
        url.searchParams.set("locale", locale)

        return url.toString()
    }

    const iframeSrc = useMemo(
        () => (replaySelection ? buildGameboardLink(replaySelection) : null),
        [replaySelection, REPLAY_API_ORIGIN, locale, GAMEBOARD_URL],
    )

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
        setReplaySelection(null)
        setIsPaused(true)
    }

    const handleSelectReplay = (selection: ReplaySelection) => {
        setReplaySelection(selection)
        setIsPaused(true)
    }

    useEffect(() => {
        if (!replayIdFromUrl) return

        let cancelled = false

        void loadReplaySelectionFromId(replayIdFromUrl)
            .then((selection) => {
                if (!cancelled) {
                    setReplaySelection(selection)
                    setIsPaused(true)
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    toast.error(t('toasts.importFailed'))
                    console.error(error)
                }
            })

        return () => {
            cancelled = true
        }
    }, [replayIdFromUrl, t])

    const matchLabel = replaySelection
        ? tCommon('labels.vs', {
            p1: replaySelection.player1.displayUsername ?? tCommon('fallback.player'),
            p2: replaySelection.player2.displayUsername ?? tCommon('fallback.player'),
        })
        : null

    const renderToolbarControls = (className: string) => (
        <div className={className}>
            <ImportReplayReference setReplay={handleSelectReplay} />
            <SelectReplayFromDb setReplay={handleSelectReplay} />
            <BattleLogToggle context="replay" />
            <Button
                variant="outline"
                disabled={!replaySelection}
                onClick={clearReplay}
                aria-label={t('a11y.clear')}
            >
                <X />
                {t('clear')}
            </Button>
        </div>
    )

    return (<>
        <header className="mb-3 flex items-center justify-between gap-3 rounded-lg border bg-card/50 px-3 py-2">
            {matchLabel ? (
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
                    {matchLabel}
                </p>
            ) : (
                <span className="min-w-0 flex-1" />
            )}

            {renderToolbarControls("hidden min-w-0 flex-wrap items-center justify-end gap-2 md:flex")}

            <Drawer>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                        aria-label={t('a11y.openControls')}
                    >
                        <Menu />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{t('controls')}</DrawerTitle>
                    </DrawerHeader>
                    {renderToolbarControls("flex flex-col gap-3 p-4 pb-8")}
                </DrawerContent>
            </Drawer>
        </header>

        {
            replaySelection && iframeSrc && <>

                <ReactHowler
                    src={[`/sounds/OST/${track}`]}
                    loop={true}
                    volume={volume[0]}
                    playing={!isPaused}
                />
                <div className="relative h-[85%] w-full">
                    <iframe
                        ref={iframeRef}
                        key={replaySelection.id}
                        src={iframeSrc}
                        className="h-full w-full border-0"
                    />
                    <MessagesModal
                        isReplay={true}
                        battleLogEnabled={battleLogEnabled}
                        player={replaySelection.player1.displayUsername}
                        opponent={replaySelection.player2.displayUsername}
                        roomId={replaySelection.roomId}
                        userId={replaySelection.player1.id}
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
