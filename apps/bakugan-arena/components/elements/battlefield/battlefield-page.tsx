'use client'

import { useSocketStore } from "@/src/store/socket-id-store";
import { useRef } from "react"
import MessagesModal from "./messages-modal";
import { redirect } from "next/navigation";

type player = {
    player: {
        id: string;
        image: string | null;
        displayUsername: string | null;
    };
    deck: {
        bakugans: string[];
        ability: string[];
        exclusiveAbilities: string[];
        gateCards: string[];
    };
} | undefined

type BattleFieldPageProps = {
    player: player,
    opponent: player,
    roomId: string,
    userId: string
}


export default function BattleFieldPage({ player, opponent, roomId, userId }: BattleFieldPageProps) {

    const socket = useSocketStore((state) => state.socket)

    if(!socket) return null
    const socketId = socket.id

    if(socketId === undefined) {
        redirect('/dashboard')
    }

    const playerData = player?.player
    const opponentData = opponent?.player
    const GAMEBOARD_URL = process.env.NEXT_PUBLIC_3D_GAMEBOARD_URL
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const link = `${GAMEBOARD_URL}/?roomId=${roomId}&userId=${userId}&parentSocket=${socketId}&userImage=${playerData?.image ? playerData?.image : undefined}&opponentImage=${opponentData?.image ? opponentData?.image : undefined}`



    return (
        <>
            <MessagesModal player={playerData?.displayUsername} opponent={opponentData?.displayUsername}/>
            <iframe ref={iframeRef} src={link} className="w-full h-full border-0"></iframe>
        </>
    )
}