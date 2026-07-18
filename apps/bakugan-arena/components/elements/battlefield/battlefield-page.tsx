'use client'

import { useSocketStore } from "@/src/store/socket-id-store";
import ReactHowler from 'react-howler'
import { useEffect, useRef } from "react"
import MessagesModal from "./messages-modal";
import { redirect } from "next/navigation";
import { useAudioStore } from "@/src/store/sounds-store";
import { OSTLists } from "@/src/variables/OST";
import { Toaster } from "@/components/ui/sonner"
import DownloadAndUploadReplay from "./download-upload-replay";
import { BattleFieldPageProps } from "@bakugan-arena/game-data";

export default function BattleFieldPage({ player, opponent, roomId, userId, isPlayer }: BattleFieldPageProps) {

    const socket = useSocketStore((state) => state.socket)

    if (!socket) return null
    const socketId = socket.id

    if (socketId === undefined) {
        redirect('/dashboard')
    }

    const playRandomOST = () => {
        const randomIndex = Math.floor(Math.random() * OSTLists.length)
        const randomTrack = OSTLists[randomIndex]

        useAudioStore.getState().setTrack(randomTrack.src)
    }

    const { volume, track } = useAudioStore()
    const playerData = player?.player
    const opponentData = opponent?.player
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const iframeRef = useRef<HTMLIFrameElement>(null)

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

    useEffect(() => {
        playRandomOST()
    }, [])

    return (
        <>
            <ReactHowler
                src={[`/sounds/OST/${track}`]}
                loop={true}
                volume={volume[0]}
                playing={true}
            />
            <DownloadAndUploadReplay roomId={roomId} player1={playerData} player2={opponent?.player} />
            <MessagesModal player={playerData?.displayUsername} opponent={opponentData?.displayUsername} roomId={roomId} userId={userId} isReplay={false} />
            <iframe ref={iframeRef} src={link} className="w-full h-full border-0"></iframe>
            <Toaster />
        </>
    )
}