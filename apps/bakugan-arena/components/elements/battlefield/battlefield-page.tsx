'use client'

import { useSocketStore } from "@/src/store/socket-id-store";
import ReactHowler from 'react-howler'
import { useEffect, useRef, useState } from "react"
import MessagesModal from "./messages-modal";
import { redirect } from "next/navigation";
import { useAudioStore } from "@/src/store/sounds-store";
import { OSTLists } from "@/src/variables/OST";
import { Toaster } from "@/components/ui/sonner"
import DownloadAndUploadReplay from "./download-upload-replay";
import { BattleFieldPageProps } from "@bakugan-arena/game-data";
import { useBattlefieldBattleLogStore } from "@/src/store/battlefield-battle-log-store";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import TurnActionBar, { commitValidatedTarget } from "./turn-action-bar";
import AdditionalActionBar, { commitAdditionalTarget } from "./additional-action-bar";
import { useTurnActionStore } from "@/src/store/turn-action-store";
import { useAdditionalActionStore } from "@/src/store/additional-action-store";
import type { MessageFromIframe } from "@bakugan-arena/game-data";

export default function BattleFieldPage({ player, opponent, roomId, userId, isPlayer }: BattleFieldPageProps) {
    const t = useTranslations('battlefield')
    const locale = useLocale()
    const socket = useSocketStore((state) => state.socket)
    const battleLogEnabled = useBattlefieldBattleLogStore((state) => state.enabled)
    const [animationsPlaying, setAnimationsPlaying] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const { volume, track } = useAudioStore()
    const setTurnRequest = useTurnActionStore((s) => s.setRequest)
    const clearTurnActions = useTurnActionStore((s) => s.clear)
    const additionalKind = useAdditionalActionStore((s) => s.kind)
    const setAbilityAdditional = useAdditionalActionStore((s) => s.setAbilityRequest)
    const setGateAdditional = useAdditionalActionStore((s) => s.setGateRequest)
    const clearAdditional = useAdditionalActionStore((s) => s.clear)

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * OSTLists.length)
        useAudioStore.getState().setTrack(OSTLists[randomIndex].src)
    }, [])

    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const gameboardOrigin = GAMEBOARD_URL ?? "*"

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const data = event.data as MessageFromIframe | undefined
            if (!data?.type) return

            if (data.type === "GAME_ANIMATIONS_START") {
                setAnimationsPlaying(true)
            }
            if (data.type === "GAME_ANIMATIONS_DONE") {
                setAnimationsPlaying(false)
            }
            if (data.type === "TURN_ACTION_REQUEST") {
                if (!isPlayer) return
                clearAdditional()
                setTurnRequest(data.request)
            }
            if (data.type === "ADDITIONAL_ACTION_REQUEST") {
                if (!isPlayer) return
                clearTurnActions()
                if (data.kind === 'ability') {
                    setAbilityAdditional(data.request)
                } else {
                    setGateAdditional(data.request)
                }
            }
            if (data.type === "ACTION_TARGET_SELECTED") {
                commitValidatedTarget(
                    data.payload,
                    iframeRef.current,
                    gameboardOrigin,
                )
            }
            if (data.type === "ADDITIONAL_TARGET_SELECTED") {
                commitAdditionalTarget(
                    data.payload,
                    iframeRef.current,
                    gameboardOrigin,
                )
            }
            if (data.type === "ACTION_TARGET_CANCELLED") {
                useTurnActionStore.getState().setPhase('choosing')
                useTurnActionStore.getState().setSelectedKey(null)
                useAdditionalActionStore.getState().setPhase('choosing')
            }
            if (data.type === "GAME_TURN_END") {
                clearTurnActions()
                clearAdditional()
            }
        }

        window.addEventListener("message", onMessage)
        return () => {
            window.removeEventListener("message", onMessage)
            clearTurnActions()
            clearAdditional()
        }
    }, [
        clearAdditional,
        clearTurnActions,
        gameboardOrigin,
        isPlayer,
        setAbilityAdditional,
        setGateAdditional,
        setTurnRequest,
    ])

    if (!socket) {
        return (
            <div className="flex h-full w-full flex-col gap-2">
                <div className="h-[65%] w-full animate-pulse rounded-lg bg-accent md:h-[68%]" />
                <div className="min-h-0 flex-1 animate-pulse rounded-lg bg-accent" />
            </div>
        )
    }
    const socketId = socket.id

    if (socketId === undefined) {
        redirect('/dashboard')
    }

    const playerData = player?.player
    const opponentData = opponent?.player

    const buildGameboardLink = (page: string, params: Record<string, string | null | undefined>) => {
        const baseUrl = (GAMEBOARD_URL ?? "http://localhost:5173").replace(/\/$/, "")
        const url = new URL(`${baseUrl}/${page}`)

        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value)
        })

        return url.toString()
    }

    const playerLink = buildGameboardLink("", {
        roomId,
        userId,
        parentSocket: socketId,
        userImage: playerData?.image,
        opponentImage: opponentData?.image,
        locale,
    })

    const viewerLink = buildGameboardLink("viewer.html", {
        roomId,
        userId,
        parentSocket: socketId,
        player1Id: playerData?.id,
        player1Image: playerData?.image,
        player2Id: opponentData?.id,
        player2Image: opponentData?.image,
        locale,
    })

    const link = isPlayer ? playerLink : viewerLink

    const skipAnimations = () => {
        iframeRef.current?.contentWindow?.postMessage(
            { type: "SKIP_ANIMATIONS" },
            gameboardOrigin
        )
    }

    return (
        <>
            <ReactHowler
                src={[`/sounds/OST/${track}`]}
                loop={true}
                volume={volume[0]}
                playing={true}
            />
            <div
                className="flex h-full w-full flex-col overflow-hidden"
                data-battlefield-root
            >
                <div
                    data-battlefield-iframe
                    className={
                        isPlayer
                            ? 'relative h-[65%] w-full shrink-0 md:h-[68%]'
                            : 'relative h-full w-full'
                    }
                >
                    <iframe
                        ref={iframeRef}
                        src={link}
                        className="h-full w-full border-0"
                    />
                    <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
                        <MessagesModal
                            player={playerData?.displayUsername}
                            opponent={opponentData?.displayUsername}
                            roomId={roomId}
                            userId={userId}
                            isReplay={false}
                            battleLogEnabled={battleLogEnabled}
                            embedded
                        />
                        <DownloadAndUploadReplay
                            roomId={roomId}
                            player1={playerData}
                            player2={opponentData}
                        />
                        {animationsPlaying && (
                            <Button
                                variant="outline"
                                onClick={skipAnimations}
                                aria-label={t('a11y.skipAnimations')}
                            >
                                <SkipForward />
                            </Button>
                        )}
                    </div>
                </div>
                {isPlayer && (
                    <div className="min-h-0 flex-1 border-t border-border bg-background">
                        {additionalKind ? (
                            <AdditionalActionBar
                                iframeRef={iframeRef}
                                gameboardOrigin={gameboardOrigin}
                            />
                        ) : (
                            <TurnActionBar
                                iframeRef={iframeRef}
                                userId={userId}
                                gameboardOrigin={gameboardOrigin}
                            />
                        )}
                    </div>
                )}
            </div>
            <Toaster />
        </>
    )
}
