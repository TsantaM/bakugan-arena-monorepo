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
import { useTranslations } from "next-intl";

export default function BattleFieldPage({ player, opponent, roomId, userId, isPlayer }: BattleFieldPageProps) {
    const t = useTranslations('battlefield')
    const socket = useSocketStore((state) => state.socket)
    const battleLogEnabled = useBattlefieldBattleLogStore((state) => state.enabled)
    const [animationsPlaying, setAnimationsPlaying] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const { volume, track } = useAudioStore()

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * OSTLists.length)
        useAudioStore.getState().setTrack(OSTLists[randomIndex].src)
    }, [])

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.data?.type === "GAME_ANIMATIONS_START") {
                setAnimationsPlaying(true)
            }
            if (event.data?.type === "GAME_ANIMATIONS_DONE") {
                setAnimationsPlaying(false)
            }
        }

        window.addEventListener("message", onMessage)
        return () => window.removeEventListener("message", onMessage)
    }, [])

    if (!socket) return null
    const socketId = socket.id

    if (socketId === undefined) {
        redirect('/dashboard')
    }

    const playerData = player?.player
    const opponentData = opponent?.player
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL

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
    })

    const viewerLink = buildGameboardLink("viewer.html", {
        roomId,
        userId,
        parentSocket: socketId,
        player1Id: playerData?.id,
        player1Image: playerData?.image,
        player2Id: opponentData?.id,
        player2Image: opponentData?.image,
    })

    const link = isPlayer ? playerLink : viewerLink

    const skipAnimations = () => {
        iframeRef.current?.contentWindow?.postMessage(
            { type: "SKIP_ANIMATIONS" },
            GAMEBOARD_URL ?? "*"
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
            <div className="relative h-full w-full" data-battlefield-root>
                <iframe ref={iframeRef} src={link} className="h-full w-full border-0"></iframe>
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
            <Toaster />
        </>
    )
}
